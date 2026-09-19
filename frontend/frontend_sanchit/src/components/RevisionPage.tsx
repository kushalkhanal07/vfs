import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Flame,
  Loader2,
  ListOrdered,
  Pencil,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AddRevisionSessionModal } from "@/components/AddRevisionSessionModal";
import { RevisionPriorityCard } from "@/components/RevisionPriorityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRevision } from "@/contexts/revisionContext";
import { useNotifications } from "@/contexts/notificationsContext";
import type { RevisionSession } from "@/api/revision";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date();

type ViewMode = "calendar" | "list";

const priorityClasses: Record<RevisionSession["priority"], string> = {
  High: "border-blue-800/30 bg-blue-800/10 text-blue-800 dark:text-blue-300",
  Medium: "border-blue-600/30 bg-blue-600/10 text-blue-600 dark:text-blue-300",
  Low: "border-blue-400/30 bg-blue-400/10 text-blue-400 dark:text-blue-300",
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatWeekRange(startDate: Date) {
  const endDate = addDays(startDate, 6);
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function RevisionPage() {
  const {
    sessions,
    todaySessions,
    upcomingSessions,
    loading,
    error,
    load,
    create,
    update,
    selectedSession,
    openSession,
    closeSession,
  } = useRevision() as {
    sessions: RevisionSession[];
    todaySessions: RevisionSession[];
    upcomingSessions: RevisionSession[];
    loading: boolean;
    error: string | null;
    load: (range?: { from: string; to: string }) => Promise<void>;
    create: (payload: {
      title: string;
      description: string;
      subject: string;
      revisionDate: string;
      revisionTime: string;
      duration: number;
      priority: RevisionSession["priority"];
      difficulty: string;
      tags: string[];
      reminderEnabled: boolean;
      reminderInterval?: number | null;
      examBoost: boolean;
    }) => Promise<void>;
    update: (id: string, payload: {
      title: string;
      description: string;
      subject: string;
      revisionDate: string;
      revisionTime: string;
      duration: number;
      priority: RevisionSession["priority"];
      difficulty: string;
      tags: string[];
      reminderEnabled: boolean;
      reminderInterval?: number | null;
      examBoost: boolean;
    }) => Promise<void>;
    selectedSession: RevisionSession | null;
    openSession: (session: RevisionSession) => void;
    closeSession: () => void;
  };

  const { load: loadNotifications } = useNotifications() as { load: () => Promise<void> };

  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<RevisionSession | null>(null);
  const [newSessionDate, setNewSessionDate] = useState(() => startOfDay(new Date()));
  const [activeDate, setActiveDate] = useState(() => startOfWeek(new Date()));

  useEffect(() => {
    const start = startOfDay(activeDate);
    const end = addDays(start, 6);
    // Send full ISO datetimes to backend to avoid timezone shifts when server parses dates
    load({ from: start.toISOString(), to: end.toISOString() }).catch(() => undefined);
  }, [activeDate, load]);

  const weekLabel = useMemo(() => formatWeekRange(activeDate), [activeDate]);
  const todayKey = formatDateKey(today);

  const dayBuckets = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(activeDate, index);
        const key = formatDateKey(date);
        const bucketSessions = sessions
          .filter((session) => formatDateKey(new Date(session.revisionDate)) === key)
          .sort((left, right) => left.revisionTime.localeCompare(right.revisionTime));

        return { date, key, sessions: bucketSessions };
      }),
    [activeDate, sessions]
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((left, right) => {
      const leftDate = `${left.revisionDate}T${left.revisionTime}`;
      const rightDate = `${right.revisionDate}T${right.revisionTime}`;
      return leftDate.localeCompare(rightDate);
    });
  }, [sessions]);

  const stats = useMemo(() => {
    const highPriority = sessions.filter((session) => session.priority === "High").length;
    const examBoost = sessions.filter((session) => session.examBoost).length;
    const totalMinutes = sessions.reduce((sum, session) => sum + Number(session.duration || 0), 0);

    return [
      { label: "Sessions today", value: todaySessions?.length, icon: CalendarRange, tone: "from-blue-400 to-blue-600" },
      { label: "Scheduled", value: sessions.length, icon: Flame, tone: "from-blue-400 to-blue-600" },
      { label: "High priority", value: highPriority, icon: Sparkles, tone: "from-blue-400 to-blue-600" },
      { label: "Exam boosts", value: examBoost, icon: TrendingUp, tone: "from-blue-400 to-blue-600" },
      { label: "Planned minutes", value: totalMinutes, icon: Clock3, tone: "from-blue-400 to-blue-600" },
    ];
  }, [sessions, todaySessions?.length]);

  const openCreateModal = (date = new Date()) => {
    setEditingSession(null);
    setNewSessionDate(startOfDay(date));
    setIsModalOpen(true);
  };

  const openEditModal = (session: RevisionSession) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    title: string;
    description: string;
    subject: string;
    revisionDate: string;
    revisionTime: string;
    duration: number;
    priority: RevisionSession["priority"];
    difficulty: string;
    tags: string[];
    reminderEnabled: boolean;
    reminderInterval?: number | null;
    examBoost: boolean;
  }) => {
    const isEditing = Boolean(editingSession);

    try {
      if (isEditing && editingSession) {
        await update(editingSession._id, payload);
        toast.success("Revision session updated");
      } else {
        await create(payload);
        toast.success("Revision session saved");
      }

      // Refresh notifications so the newly-created session reminder shows immediately
      try {
        await loadNotifications();
      } catch (e) {
        // ignore – not critical
      }

      const start = activeDate;
      const end = addDays(activeDate, 6);
      await load({ from: formatDateKey(start), to: formatDateKey(end) });
      setIsModalOpen(false);
      setEditingSession(null);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save revision session";
      toast.error(message);
      throw saveError;
    }
  };

  const openSessionDetail = (session: RevisionSession) => {
    openSession(session);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
            <CardContent className="p-4">
              <div className={`size-10 rounded-xl bg-linear-to-br ${stat.tone} grid place-items-center text-white shadow-soft`}>
                <stat.icon className="size-4" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Revision planner</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {viewMode === "calendar" ? weekLabel : "All revision sessions"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch between a weekly calendar and a full list view, then edit sessions inline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border bg-background p-1">
            <Button
              type="button"
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="mr-1 size-4" /> Calendar
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ListOrdered className="mr-1 size-4" /> List
            </Button>
          </div>

          <div className="inline-flex items-center rounded-xl border border-border bg-background p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveDate((current) => startOfWeek(addDays(current, -7)))}
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveDate(startOfWeek(new Date()))}>
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveDate((current) => startOfWeek(addDays(current, 7)))}
            >
              Next <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>

          <Button type="button" onClick={() => openCreateModal(new Date())}>
            <Plus className="mr-2 size-4" /> Add session
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <RevisionPriorityCard refreshKey={sessions} />

      {viewMode === "calendar" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr]">
          <div className="space-y-4">
            <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
              <CardContent className="p-4 md:p-5">
                {loading ? (
                  <div className="flex min-h-95 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" /> Loading sessions...
                  </div>
                ) : (
                  <div className="grid min-w-190 grid-cols-7 gap-3 overflow-x-auto xl:min-w-0">
                    {weekdayLabels.map((label, index) => {
                      const bucket = dayBuckets[index];
                      const isToday = bucket.key === todayKey;

                      return (
                        <div key={label} className="space-y-3">
                          <div
                            className={[
                              "rounded-2xl border p-3 text-center transition-colors",
                              isToday ? "border-primary/50 bg-primary/5" : "border-border/60 bg-muted/20",
                            ].join(" ")}
                          >
                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
                            <p className={`mt-1 text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                              {bucket.date.getDate()}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{formatDisplayDate(bucket.date)}</p>
                          </div>

                          <div className="min-h-62.5 space-y-2">
                            {bucket?.sessions?.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
                                No sessions
                              </div>
                            ) : (
                              bucket?.sessions.map((session) => (
                                <button
                                  key={session._id}
                                  type="button"
                                  onClick={() => openSessionDetail(session)}
                                  className={[
                                    "w-full rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                                    priorityClasses[session.priority],
                                    bucket.key === todayKey ? "ring-2 ring-primary/30" : "",
                                  ].join(" ")}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                                        {session.revisionTime}
                                      </p>
                                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{session.title}</p>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                                      {session.priority}
                                    </Badge>
                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] opacity-80">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 className="size-3" /> {session.duration} min
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <BookOpen className="size-3" /> {session.subject}
                                    </span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Today’s revisions</CardTitle>
                  <CardDescription>Sessions scheduled for today and highlighted on the calendar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {todaySessions?.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-sm text-muted-foreground">
                      No revision sessions are scheduled for today.
                    </div>
                  ) : (
                    todaySessions?.map((session) => (
                      <button
                        key={session._id}
                        type="button"
                        onClick={() => openSessionDetail(session)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-left transition-colors hover:bg-accent/60"
                      >
                        <div className={`grid size-10 place-items-center rounded-xl border ${priorityClasses[session.priority]}`}>
                          <CalendarDays className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{session.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {session.subject} • {session.revisionTime} • {session.duration} min
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upcoming sessions</CardTitle>
                  <CardDescription>Scan the next revision items in your queue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingSessions?.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-sm text-muted-foreground">
                      Nothing upcoming yet. Add a new revision session to fill the week.
                    </div>
                  ) : (
                    upcomingSessions?.slice(0, 5).map((session) => (
                      <button
                        key={session._id}
                        type="button"
                        onClick={() => openSessionDetail(session)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-left transition-colors hover:bg-accent/60"
                      >
                        <div className={`grid size-10 place-items-center rounded-xl border ${priorityClasses[session.priority]}`}>
                          <CalendarRange className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{session.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDisplayDate(new Date(session.revisionDate))} • {session.revisionTime}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Week summary</CardTitle>
                <CardDescription>Quick snapshot of your revision load for this week.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total sessions</p>
                  <p className="mt-1 text-2xl font-semibold">{sessions?.length}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
                  <p className="mt-1 text-2xl font-semibold">{todaySessions?.length}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">High priority</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {sessions?.filter((session) => session.priority === "High")?.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All revision sessions</CardTitle>
            <CardDescription>Edit sessions directly from the list and keep the calendar in sync.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading sessions...
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-sm text-muted-foreground">
                No revision sessions yet. Create your first session to start planning.
              </div>
            ) : (
              sortedSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-accent/40 md:flex-row md:items-center"
                >
                  <div className={`grid size-11 place-items-center rounded-xl border ${priorityClasses[session.priority]}`}>
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{session.title}</h3>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {session.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatLongDate(session.revisionDate)} • {session.revisionTime} • {session.duration} min • {session.subject}
                    </p>
                    {session.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{session.description}</p>
                    )}
                    {session.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {session.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openSessionDetail(session)}>
                      View
                    </Button>
                    <Button type="button" size="sm" onClick={() => openEditModal(session)}>
                      <Pencil className="mr-1 size-4" /> Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <AddRevisionSessionModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingSession(null);
        }}
        onSubmit={handleSave}
        defaultDate={newSessionDate}
        initialSession={editingSession}
        loading={loading}
      />

      <Dialog open={Boolean(selectedSession)} onOpenChange={(open) => !open && closeSession()}>
        <DialogContent className="sm:max-w-xl">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSession.title}</DialogTitle>
                <DialogDescription>
                  {selectedSession.subject} • {formatDisplayDate(new Date(selectedSession.revisionDate))} at {selectedSession.revisionTime}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedSession.priority} priority</Badge>
                  <Badge variant="outline">{selectedSession.difficulty}</Badge>
                  {selectedSession.examBoost && <Badge>Exam boost</Badge>}
                  {selectedSession.reminderEnabled && (
                    <>
                      <Badge variant="outline">Reminder on</Badge>
                      {selectedSession.reminderInterval ? (
                        <Badge variant="secondary">{selectedSession.reminderInterval} min before</Badge>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
                    <p className="mt-1 font-medium">{selectedSession.duration} minutes</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium capitalize">{selectedSession.status}</p>
                  </div>
                </div>

                {selectedSession.description && (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{selectedSession.description}</p>
                  </div>
                )}

                {selectedSession.tags?.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSession.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-background px-2.5 py-1 text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSession(selectedSession);
                      setIsModalOpen(true);
                      closeSession();
                    }}
                  >
                    <Pencil className="mr-2 size-4" /> Edit session
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

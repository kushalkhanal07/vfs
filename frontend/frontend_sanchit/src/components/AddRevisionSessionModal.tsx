import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { RevisionPriority, RevisionSession } from "@/api/revision";

const priorityOptions: RevisionPriority[] = ["High", "Medium", "Low"];
const difficultyOptions = ["Easy", "Medium", "Hard", "Very Hard"];
const reminderPresetOptions = [5, 10, 15, 30, 60] as const;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromInputValue(value: string) {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

type SessionFormPayload = {
  title: string;
  description: string;
  subject: string;
  revisionDate: string;
  revisionTime: string;
  duration: number;
  priority: RevisionPriority;
  difficulty: string;
  tags: string[];
  reminderEnabled: boolean;
  reminderInterval?: number | null;
  examBoost: boolean;
};

type AddRevisionSessionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: SessionFormPayload) => Promise<void>;
  defaultDate?: Date;
  initialSession?: RevisionSession | null;
  loading?: boolean;
};

export function AddRevisionSessionModal({
  open,
  onOpenChange,
  onSubmit,
  defaultDate,
  initialSession,
  loading = false,
}: AddRevisionSessionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [revisionDate, setRevisionDate] = useState(toDateInputValue(defaultDate || new Date()));
  const [revisionTime, setRevisionTime] = useState("18:00");
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState<RevisionPriority>("Medium");
  const [difficulty, setDifficulty] = useState("Medium");
  const [tags, setTags] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMode, setReminderMode] = useState<string>("10");
  const [customReminder, setCustomReminder] = useState<string>("");
  const [examBoost, setExamBoost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const nextDate = initialSession?.revisionDate
      ? dateFromInputValue(initialSession.revisionDate.split("T")[0])
      : defaultDate || new Date();

    setTitle(initialSession?.title || "");
    setDescription(initialSession?.description || "");
    setSubject(initialSession?.subject || "");
    setRevisionDate(toDateInputValue(nextDate));
    setRevisionTime(initialSession?.revisionTime || "18:00");
    setDuration(initialSession?.duration || 45);
    setPriority(initialSession?.priority || "Medium");
    setDifficulty(initialSession?.difficulty || "Medium");
    setTags(initialSession?.tags?.join(", ") || "");
    setReminderEnabled(initialSession?.reminderEnabled ?? true);
    const nextReminder = initialSession?.reminderInterval ?? 10;
    if (reminderPresetOptions.includes(nextReminder as (typeof reminderPresetOptions)[number])) {
      setReminderMode(String(nextReminder));
      setCustomReminder("");
    } else {
      setReminderMode("custom");
      setCustomReminder(String(nextReminder));
    }
    setExamBoost(initialSession?.examBoost ?? false);
    setError(null);
  }, [open, defaultDate, initialSession]);

  const selectedDate = useMemo(() => dateFromInputValue(revisionDate), [revisionDate]);
  const minDate = useMemo(() => toDateInputValue(startOfDay(new Date())), []);
  const isEditMode = Boolean(initialSession);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  const resolvedReminderInterval = useMemo(() => {
    if (!reminderEnabled) return null;

    if (reminderMode === "custom") {
      const parsed = Number(customReminder);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    const parsed = Number(reminderMode);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [customReminder, reminderEnabled, reminderMode]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Session title is required.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject or topic is required.");
      return;
    }

    if (!revisionDate || !revisionTime) {
      setError("Revision date and time are required.");
      return;
    }

    const selected = dateFromInputValue(revisionDate);
    if (selected < startOfDay(new Date())) {
      setError("You cannot select a past date.");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        revisionDate,
        revisionTime,
        duration,
        priority,
        difficulty,
        tags: tagList,
        reminderEnabled,
        reminderInterval: resolvedReminderInterval,
        examBoost,
      });
      onOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save revision session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Revision Session" : "Add Revision Session"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the session details, time, and reminder settings."
              : "Create a focused study block with date, time, priority, and reminders."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="revision-session-title">Session Title</Label>
                <Input
                  id="revision-session-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Organic Chemistry Revision"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="revision-session-description">Description</Label>
                <Textarea
                  id="revision-session-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What do you want to cover in this session?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision-session-subject">Subject / Topic</Label>
                <Input
                  id="revision-session-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Biology, Calculus, History"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision-session-time">Revision Time</Label>
                <Input
                  id="revision-session-time"
                  type="time"
                  value={revisionTime}
                  onChange={(event) => setRevisionTime(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision-session-duration">Estimated Duration</Label>
                <Input
                  id="revision-session-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as RevisionPriority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="revision-session-tags">Tags</Label>
                <Input
                  id="revision-session-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="exam prep, chapter 4, weak topic"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="revision-session-date">Revision Date</Label>
                <Input
                  id="revision-session-date"
                  type="date"
                  min={minDate}
                  value={revisionDate}
                  onChange={(event) => setRevisionDate(event.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium">Reminder</p>
                  <p className="text-xs text-muted-foreground">Notify me before the session starts.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                  <Select
                    value={reminderMode}
                    onValueChange={(value) => {
                      setReminderMode(value);
                      if (value === "custom" && !customReminder) {
                        setCustomReminder("10");
                      }
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Reminder" />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderPresetOptions.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option === 60 ? "1 hour" : `${option} minutes`}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reminderMode === "custom" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Custom reminder (minutes before)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={customReminder}
                    onChange={(e) => setCustomReminder(e.target.value)}
                    placeholder="Enter custom minutes"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium">Exam Boost</p>
                  <p className="text-xs text-muted-foreground">Mark this session as high-priority for exams.</p>
                </div>
                <Switch checked={examBoost} onCheckedChange={setExamBoost} />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <Card className="border-border/70 bg-background/70 shadow-none">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-base">Pick a date</CardTitle>
              <CardDescription>Use the built-in calendar to place this session into your week.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setRevisionDate(toDateInputValue(date))}
                disabled={{ before: startOfDay(new Date()) }}
                className="mx-auto rounded-xl border border-border/60"
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Session" : "Save Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

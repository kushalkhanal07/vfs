import {
  FileText,
  FolderTree,
  Sparkles,
  Brain,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-4xl bg-black/10 blur-3xl"
      />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-none">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-black" />
          <span className="h-3 w-3 rounded-full bg-gray-400" />
          <span className="h-3 w-3 rounded-full bg-gray-300" />
          <div className="ml-4 flex-1">
            <div className="mx-auto w-72 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
              sanchit.app / dashboard
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0 text-xs">
          {/* sidebar */}
          <aside className="col-span-3 hidden border-r border-gray-200 bg-gray-50 p-4 sm:block">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-black text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold">StudyVault</span>
            </div>
            <div className="space-y-1">
              {[
                { icon: FolderTree, label: "Vault", active: true },
                { icon: FileText, label: "Notes" },
                { icon: Brain, label: "Revision" },
                { icon: TrendingUp, label: "Analytics" },
                { icon: Clock, label: "Schedule" },
              ].map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${i.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                >
                  <i.icon className="h-3.5 w-3.5" /> {i.label}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-[10px] font-medium uppercase text-gray-500">Today</div>
              <div className="mt-1 text-sm font-semibold text-black">3 reviews due</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-2/3 rounded-full bg-black" />
              </div>
            </div>
          </aside>

          {/* main */}
          <section className="col-span-12 p-5 sm:col-span-9">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase text-gray-500">
                  Welcome back
                </div>
                <h4 className="text-lg font-semibold">Your learning vault</h4>
              </div>
              <div className="hidden gap-2 sm:flex">
                <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-500">
                  ⌘K Search
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Files", value: "1,284", trend: "+12%" },
                { label: "Streak", value: "42d", trend: "+3d" },
                { label: "Mastery", value: "87%", trend: "+5%" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3 border-l-4 border-l-blue-500">
                  <div className="text-[10px] uppercase text-gray-500">{s.label}</div>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="text-xl font-mono font-semibold">{s.value}</div>
                    <div className="text-[10px] font-semibold text-gray-500">{s.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              <div className="col-span-3 rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[11px] font-semibold">Revision schedule</div>
                  <div className="text-[10px] text-gray-500">spaced repetition</div>
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {[40, 65, 30, 80, 55, 90, 70, 50, 75, 60, 85, 45].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-blue-600"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 text-[11px] font-semibold">Priority queue</div>
                <ul className="space-y-2">
                  {[
                    "Linear Algebra · Eigenvalues",
                    "Organic Chem · Reactions",
                    "Algorithms · Dynamic Prog.",
                  ].map((t, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                      <span className="truncate text-[11px]">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

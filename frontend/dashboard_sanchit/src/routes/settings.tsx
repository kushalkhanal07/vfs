import { createFileRoute } from "@tanstack/react-router";
import { User, Palette, Bell, Lock, Globe, Sparkles, Check } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "language", label: "Language", icon: Globe },
];

const accents = [
  { name: "Indigo", val: "from-indigo-500 to-purple-600" },
  { name: "Cyan", val: "from-cyan-400 to-blue-600" },
  { name: "Rose", val: "from-rose-400 to-pink-600" },
  { name: "Emerald", val: "from-emerald-400 to-teal-600" },
  { name: "Amber", val: "from-amber-400 to-orange-600" },
];

function SettingsPage() {
  const [active, setActive] = useState("profile");
  const [accent, setAccent] = useState("Indigo");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    const isDark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <aside className="glass rounded-2xl p-2 h-fit lg:sticky lg:top-24">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60"
            }`}
          >
            <s.icon className="size-4" /> {s.label}
          </button>
        ))}
      </aside>

      <div className="space-y-6">
        {/* Profile card always visible */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-24 gradient-primary opacity-90" />
          <div className="relative pt-14">
            <div className="size-20 rounded-2xl gradient-cool grid place-items-center text-white text-2xl font-semibold shadow-elegant ring-4 ring-background">
              A
            </div>
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Aarav Sharma</h2>
                <p className="text-sm text-muted-foreground">aarav@student.edu • Year 2 Engineering</p>
              </div>
              <button className="self-start inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-3.5 py-2 text-sm font-medium">
                Edit profile
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              {[
                { v: "184", l: "Notes" },
                { v: "27d", l: "Streak" },
                { v: "92%", l: "Mastery" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-muted/40 p-3">
                  <p className="text-lg font-semibold">{s.v}</p>
                  <p className="text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            <h3 className="font-semibold tracking-tight">Appearance</h3>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => applyTheme(t)}
                  className={`rounded-xl p-3 border-2 transition-all ${
                    theme === t ? "border-primary shadow-soft" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className={`h-16 rounded-lg mb-2 ${t === "light" ? "bg-white border" : t === "dark" ? "bg-slate-900" : "bg-gradient-to-r from-white to-slate-900"}`} />
                  <p className="text-xs font-medium capitalize">{t}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Accent color</p>
            <div className="flex gap-3 flex-wrap">
              {accents.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setAccent(a.name)}
                  className={`relative size-10 rounded-xl bg-gradient-to-br ${a.val} hover:scale-110 transition-transform shadow-soft`}
                >
                  {accent === a.name && (
                    <Check className="absolute inset-0 m-auto size-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h3 className="font-semibold tracking-tight">Study Preferences</h3>
          </div>

          {[
            { label: "Daily revision reminders", desc: "Get nudged when sessions are due", on: true },
            { label: "Weekly progress digest", desc: "Email summary every Sunday evening", on: false },
            { label: "Focus mode sound", desc: "Subtle ambient audio during sessions", on: true },
          ].map((p) => (
            <Toggle key={p.label} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  const [checked, setChecked] = useState(on);
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => setChecked((c) => !c)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "gradient-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

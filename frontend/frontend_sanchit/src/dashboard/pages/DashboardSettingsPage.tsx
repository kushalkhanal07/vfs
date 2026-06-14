import { Bell, Check, Globe, Lock, Palette, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import * as settingsApi from "@/api/settings";
import { getUserProfile, updateUserProfile } from "@/api/user";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "language", label: "Language", icon: Globe },
];

const accents = [
  { name: "Blue 600", val: "bg-blue-600" },
  { name: "Blue 700", val: "bg-blue-700" },
  { name: "Blue 500", val: "bg-blue-500" },
  { name: "Blue 400", val: "bg-blue-400" },
  { name: "Blue 200", val: "bg-blue-200" },
];

export function DashboardSettingsPage() {
  const [active, setActive] = useState("profile");
  const [accent, setAccent] = useState("Blue 600");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [prefs, setPrefs] = useState({ dailyRevisionReminders: true, aiScheduling: true, weeklyDigest: false });
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    let mounted = true;
    (async function load() {
      try {
        const res = await settingsApi.getSettings();
        const s = res?.settings;
        if (!mounted) return;
        if (s) {
          setTheme(s.theme || "light");
          setAccent(s.accent || "Blue 600");
          setPrefs(s.preferences || { dailyRevisionReminders: true, aiScheduling: true, weeklyDigest: false });
        }
        try {
          const u = await getUserProfile().catch(() => null);
          if (u) setUser(u);
        } catch (e) {
          console.error("Failed to load user", e);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const applyTheme = (nextTheme: "light" | "dark" | "system") => {
    setTheme(nextTheme);
    const isDark =
      nextTheme === "dark" ||
      (nextTheme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    try { settingsApi.updateSettings({ theme: nextTheme }); } catch (e) {}
  };

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-blue-200 bg-white p-2 lg:sticky lg:top-24">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActive(section.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active === section.id
                  ? "bg-blue-100 text-blue-900"
                  : "text-blue-700 hover:bg-blue-100"
            }`}
          >
            <section.icon className="size-4" />
            {section.label}
          </button>
        ))}
      </aside>

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-24 bg-blue-50" />
          <div className="relative pt-14">
            <div className="grid size-20 place-items-center rounded-2xl border border-blue-200 bg-blue-900 text-2xl font-semibold text-white ring-4 ring-white">
              {user?.name?.trim()?.charAt(0) || "A"}
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-blue-900">{user?.name || "Your name"}</h2>
                <p className="text-sm text-blue-400">{user?.email || ""} • {user?.role || "Workspace owner"}</p>
              </div>
              <button onClick={() => {
                setEditing(true);
                setFormName(user?.name || "");
                setFormEmail(user?.email || "");
              }} className="inline-flex self-start rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white md:self-auto hover:bg-blue-700">
                Edit profile
              </button>
            </div>
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">Edit profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-blue-800">Full name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Your full name" className="mt-1 w-full rounded-md border border-blue-300 px-3 py-2 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Email</label>
                  <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="you@example.com" className="mt-1 w-full rounded-md border border-blue-300 px-3 py-2 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500" />
                </div>
                {formError && <div className="text-sm text-red-500">{formError}</div>}
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => setEditing(false)} className="rounded-md px-3 py-2 border border-blue-100">Cancel</button>
                  <button disabled={isSubmitting} onClick={async () => {
                    setFormError("");
                    setIsSubmitting(true);
                    try {
                      const res = await updateUserProfile({ name: formName, email: formEmail });
                      if (res && res.user) {
                        setUser(res.user);
                        toast.success("Profile updated");
                        // notify other components to refresh
                        try { window.dispatchEvent(new CustomEvent("user:refresh")); } catch (e) {}
                      }
                      setEditing(false);
                    } catch (err) {
                      setFormError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-blue-900" />
            <h3 className="font-semibold tracking-tight text-blue-800">Appearance</h3>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-blue-800">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => applyTheme(themeOption)}
                  className={`rounded-md border p-3 transition-all ${
                    theme === themeOption
                      ? "border-blue-600"
                      : "border-blue-100 hover:border-blue-200"
                  }`}
                >
                  <div
                    className={`mb-2 h-16 rounded-lg ${
                      themeOption === "light"
                          ? "border border-blue-100 bg-white"
                        : themeOption === "dark"
                          ? "bg-blue-900"
                          : "bg-blue-100"
                    }`}
                  />
                  <p className="text-xs font-medium capitalize text-blue-800">{themeOption}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-blue-800">Accent color</p>
            <div className="flex flex-wrap gap-3">
              {accents.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setAccent(item.name);
                    try { settingsApi.updateSettings({ accent: item.name }); } catch (e) {}
                  }}
                  className={`relative size-10 rounded-xl transition-transform hover:scale-110 shadow-sm ${item.val}`}
                >
                  {accent === item.name && (
                    <Check className="absolute inset-0 m-auto size-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle?: (next: boolean) => void }) {
  const [checked, setChecked] = useState(on);

  useEffect(() => {
    setChecked(on);
  }, [on]);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-blue-800">{label}</p>
        <p className="text-xs text-blue-400">{desc}</p>
      </div>
      <button
        onClick={() => {
          const next = !checked;
          setChecked(next);
          if (onToggle) onToggle(next);
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-blue-100"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

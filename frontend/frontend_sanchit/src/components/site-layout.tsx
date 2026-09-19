import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/services", label: "Modules" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="sticky top-0 z-50 bg-blue-800 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">StudyVault</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-white/90 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login" className="hidden md:inline-flex">
            <button className="rounded-md px-3.5 py-2 text-sm font-medium bg-white/10 text-white hover:bg-white/20">
              Sign in
            </button>
          </Link>
          <Link to="/signup" className="hidden md:inline-flex">
            <button className="rounded-md px-3.5 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50">
              Get started
            </button>
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button className="w-full bg-gradient-brand" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-14 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-black">StudyVault</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-gray-600">
            A vault for learning. Smart storage, spaced repetition, and AI-grade search built for
            ambitious students.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          {
            title: "Product",
            links: [
              ["Features", "/features"],
              ["Modules", "/services"],
              ["Testimonials", "/testimonials"],
            ],
          },
          {
            title: "Company",
            links: [
              ["About", "/about"],
              ["Contact", "/contact"],
              ["FAQ", "/faq"],
            ],
          },
          {
            title: "Account",
            links: [
              ["Sign in", "/login"],
              ["Sign up", "/signup"],
            ],
          },
        ].map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold text-black">{c.title}</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {c.links.map(([l, to]) => (
                <li key={l}>
                  <Link to={to} className="hover:text-black">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} StudyVault — A Vault for Learning.</p>
          <p>Built for students who think ahead.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-blue-50" />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

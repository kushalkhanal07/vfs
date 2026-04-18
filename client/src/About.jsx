import { Cloud, Zap, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Zap,
    title: "Speed",
    desc: "Lightning-fast uploads and downloads for seamless file management.",
  },
  {
    icon: Users,
    title: "Collaboration",
    desc: "Easy sharing and collaboration tools for teams and individuals.",
  },
  {
    icon: Award,
    title: "Reliability",
    desc: "99.9% uptime with enterprise-grade infrastructure and support.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#082f49_0%,#0f172a_35%,#020617_100%)] text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/home" className="flex items-center gap-2 font-bold text-xl">
            <Cloud className="h-6 w-6 text-primary" />
            Virtual File System
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/home" className="text-sm font-medium text-slate-300/70 hover:text-white">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-sky-300 hover:text-sky-200">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-slate-300/70 hover:text-white">
              Contact
            </Link>
          </div>
          <Link to="/login">
            <Button size="sm" className="bg-linear-to-r from-sky-500 to-blue-600 text-white hover:opacity-95">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold">About Virtual File System</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-300">
            We're on a mission to make secure cloud storage accessible to everyone.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-linear-to-b from-slate-900/70 to-slate-950/50">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900/75 px-6 py-10 shadow-xl shadow-slate-950/50 md:px-10">
          <h2 className="text-4xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-lg leading-8 text-slate-300">
            <p>
              Virtual File System was founded in 2023 by a team of passionate developers who believed that cloud storage should be both secure and easy to use. We started with a simple vision: create a platform where individuals and teams could store, manage, and share files without compromise.
            </p>
            <p>
              Today, thousands of users trust Virtual File System with their most important files. We've grown from a small startup to a trusted service provider, and we're just getting started.
            </p>
            <p>
              Our commitment remains the same: provide the best file management experience while maintaining the highest standards of security and privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Our Values</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              These principles guide everything we do at Virtual File System.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-700 bg-slate-900/75 p-6 text-center shadow-xl shadow-slate-950/50">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-blue-500/20">
                  <value.icon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="font-semibold text-lg">{value.title}</h3>
                <p className="text-slate-300">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 rounded-3xl bg-linear-to-r from-sky-500 via-blue-500 to-cyan-400 py-20 shadow-2xl shadow-sky-300/40">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 text-center md:px-6">
          <h2 className="text-4xl font-bold text-white">Join Our Community</h2>
          <p className="text-xl text-white/90 max-w-lg mx-auto">
            Start using Virtual File System today and experience the difference.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950/80 py-12">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="text-center text-sm text-slate-400">
            <p>© 2026 Virtual File System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

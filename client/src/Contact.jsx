import { Cloud, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Contact() {
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
            <Link to="/about" className="text-sm font-medium text-slate-300/70 hover:text-white">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-sky-300 hover:text-sky-200">
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
          <h1 className="text-5xl md:text-6xl font-bold">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-300">
            Have questions? We'd love to hear from you. Contact our team anytime.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-linear-to-b from-slate-900/70 to-slate-950/50">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/75 p-6 text-center shadow-xl shadow-slate-950/50">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-blue-500/20">
                <Mail className="h-6 w-6 text-sky-300" />
              </div>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-slate-300">support@virtualfilesystem.io</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/75 p-6 text-center shadow-xl shadow-slate-950/50">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-blue-500/20">
                <Phone className="h-6 w-6 text-sky-300" />
              </div>
              <h3 className="font-semibold text-lg">Phone</h3>
              <p className="text-slate-300">+1 (555) 123-4567</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/75 p-6 text-center shadow-xl shadow-slate-950/50">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-blue-500/20">
                <MapPin className="h-6 w-6 text-sky-300" />
              </div>
              <h3 className="font-semibold text-lg">Address</h3>
              <p className="text-slate-300">San Francisco, CA 94102</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <form className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/60 md:p-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-900/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-900/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Message</label>
              <textarea
                placeholder="Your message..."
                rows={5}
                className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-900/40"
              ></textarea>
            </div>
            <Button size="lg" className="w-full bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:opacity-95">
              Send Message
            </Button>
          </form>
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

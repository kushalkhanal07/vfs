import { ArrowRight, Cloud, Eye, FolderOpen, Lock, Share2, ShieldCheck, Star, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cloud.jpg";
import securityImage from "@/assets/security-illustration.jpg";

const features = [
  {
    icon: Upload,
    title: "File Upload",
    desc: "Drag & drop or browse to upload any file type instantly to the cloud.",
  },
  {
    icon: FolderOpen,
    title: "Folder Management",
    desc: "Organize your files into folders and subfolders with ease.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    desc: "Share files and folders with anyone via secure links.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    desc: "Access your files from any device, anytime, anywhere.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create an Account",
    desc: "Sign up in seconds with just your email.",
  },
  {
    num: "02",
    title: "Upload Your Files",
    desc: "Drag and drop files or browse to upload.",
  },
  {
    num: "03",
    title: "Access Anywhere",
    desc: "Open, share, and manage files from any device.",
  },
];

const securityFeatures = [
  { icon: ShieldCheck, title: "End-to-end encryption for all files" },
  { icon: Lock, title: "Password-protected sharing links" },
  { icon: Eye, title: "Full privacy — your data stays yours" },
];

const highlights = [
  { value: "99.99%", label: "Platform uptime" },
  { value: "10TB+", label: "Daily file sync volume" },
  { value: "AES-256", label: "Encryption standard" },
  { value: "24/7", label: "Live incident monitoring" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    text: '"Virtual File System transformed how our team handles documents. It\'s incredibly intuitive."',
    stars: 5,
  },
  {
    name: "James Mitchell",
    role: "Freelance Designer",
    text: '"I can access my design files from anywhere. The sharing features are top-notch."',
    stars: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Startup Founder",
    text: '"Simple, secure, and reliable. Exactly what we needed for our growing team."',
    stars: 5,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#082f49_0%,#0f172a_35%,#020617_100%)] text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Cloud className="h-6 w-6 text-primary" />
            Virtual File System
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/home" className="text-sm font-medium text-sky-300 hover:text-sky-200">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-300/70 hover:text-white">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-4 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Store, Manage, and Share Your Files{" "}
                <span className="text-gradient">Securely in the Cloud</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                A modern virtual file system that keeps your documents organized, accessible, and protected — from anywhere in the world.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <Link to="/register">
                  <Button size="lg" className="bg-linear-to-r from-sky-500 to-blue-600 text-lg text-white shadow-lg shadow-sky-500/30 hover:opacity-95">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-sky-400/40 bg-slate-900/60 text-lg text-slate-100 hover:bg-slate-800">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={heroImage}
                alt="Cloud storage illustration"
                className="w-full max-w-xl rounded-3xl border border-sky-400/30 bg-slate-900/50 object-cover p-2 shadow-2xl shadow-cyan-900/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-b from-slate-950/40 to-slate-900/70">
        <div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Powerful Features</h2>
            <p className="mx-auto max-w-lg text-lg text-slate-300">
              Everything you need to store, organize, and share your files.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/50 transition-all hover:-translate-y-1.5 hover:border-sky-500/50 hover:shadow-cyan-900/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-blue-500/20">
                  <feature.icon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 md:grid-cols-4 md:px-6">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-900/75 p-5 text-center shadow-lg shadow-slate-950/40">
              <p className="text-3xl font-extrabold text-sky-300">{item.value}</p>
              <p className="mt-2 text-sm text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-300">Get started in three simple steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="rounded-2xl border border-slate-700 bg-slate-900/75 px-6 py-8 text-center shadow-xl shadow-slate-950/50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-2xl font-bold text-white">
                  {step.num}
                </div>
                <h3 className="font-semibold text-xl">{step.title}</h3>
                <p className="text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-linear-to-b from-slate-900/70 to-slate-950/50">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="flex justify-center">
              <img
                src={securityImage}
                alt="Security illustration"
                className="w-full max-w-md rounded-3xl border border-cyan-400/30 p-2 shadow-2xl shadow-cyan-900/50"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Security,<br />Our Priority</h2>
              </div>
              <div className="space-y-4">
                {securityFeatures.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/20">
                      <feature.icon className="h-4 w-4 text-sky-300" />
                    </div>
                    <p className="text-lg text-slate-200">{feature.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Trusted by Thousands</h2>
            <p className="text-lg text-slate-300">See what our users have to say.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-700 bg-slate-900/75 p-6 shadow-xl shadow-slate-950/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 leading-7 text-slate-200">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-4 rounded-3xl bg-linear-to-r from-sky-500 via-blue-500 to-cyan-400 py-20 shadow-2xl shadow-sky-300/40">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 text-center md:px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 max-w-lg mx-auto">
            Join thousands of users who trust Virtual File System for secure, simple file management.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950/80 py-12 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Cloud className="h-6 w-6 text-primary" />
                Virtual File System
              </div>
              <p className="text-sm text-slate-300">
                Secure cloud storage for modern teams and individuals.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="#" className="text-slate-300 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="#" className="text-slate-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-slate-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Contact</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>support@virtualfilesystem.io</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 Virtual File System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

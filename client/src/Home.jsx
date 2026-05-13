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

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    text: '"CloudVault transformed how our team handles documents. It\'s incredibly intuitive."',
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Cloud className="h-6 w-6 text-primary" />
            CloudVault
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-primary hover:text-primary/80">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/60 hover:text-foreground">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/60 hover:text-foreground">
              Contact
            </Link>
          </div>
          <Link to="/login">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Store, Manage, and Share Your Files{" "}
                <span className="text-gradient">Securely in the Cloud</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                A modern virtual file system that keeps your documents organized, accessible, and protected — from anywhere in the world.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={heroImage}
                alt="Cloud storage illustration"
                className="w-full max-w-md rounded-2xl shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/40">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Powerful Features</h2>
            <p className="text-lg text-muted-foreground mx-auto max-w-lg">
              Everything you need to store, organize, and share your files.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground">Get started in three simple steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-semibold text-xl">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="flex justify-center">
              <img
                src={securityImage}
                alt="Security illustration"
                className="w-full max-w-sm rounded-2xl shadow-card"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Security,<br />Our Priority</h2>
              </div>
              <div className="space-y-4">
                {securityFeatures.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg text-foreground">{feature.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Trusted by Thousands</h2>
            <p className="text-lg text-muted-foreground">See what our users have to say.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent rounded-2xl mx-4">
        <div className="container text-center space-y-6 py-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 max-w-lg mx-auto">
            Join thousands of users who trust CloudVault for secure, simple file management.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Cloud className="h-6 w-6 text-primary" />
                CloudVault
              </div>
              <p className="text-sm text-muted-foreground">
                Secure cloud storage for modern teams and individuals.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Contact</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>support@cloudvault.io</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 CloudVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

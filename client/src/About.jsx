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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/home" className="flex items-center gap-2 font-bold text-xl">
            <Cloud className="h-6 w-6 text-primary" />
            CloudVault
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/home" className="text-sm font-medium text-foreground/60 hover:text-foreground">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-primary hover:text-primary/80">
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

      {/* Hero */}
      <section className="py-20">
        <div className="container text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold">About CloudVault</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make secure cloud storage accessible to everyone.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-muted/40">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              CloudVault was founded in 2023 by a team of passionate developers who believed that cloud storage should be both secure and easy to use. We started with a simple vision: create a platform where individuals and teams could store, manage, and share files without compromise.
            </p>
            <p>
              Today, thousands of users trust CloudVault with their most important files. We've grown from a small startup to a trusted service provider, and we're just getting started.
            </p>
            <p>
              Our commitment remains the same: provide the best file management experience while maintaining the highest standards of security and privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at CloudVault.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent rounded-2xl mx-4">
        <div className="container text-center space-y-6 py-12">
          <h2 className="text-4xl font-bold text-white">Join Our Community</h2>
          <p className="text-xl text-white/90 max-w-lg mx-auto">
            Start using CloudVault today and experience the difference.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 CloudVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

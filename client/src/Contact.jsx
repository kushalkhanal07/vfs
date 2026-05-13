import { Cloud, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Contact() {
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
            <Link to="/about" className="text-sm font-medium text-foreground/60 hover:text-foreground">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-primary hover:text-primary/80">
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
          <h1 className="text-5xl md:text-6xl font-bold">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Contact our team anytime.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-muted-foreground">support@cloudvault.io</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Address</h3>
              <p className="text-muted-foreground">San Francisco, CA 94102</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                placeholder="Your message..."
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
              ></textarea>
            </div>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
              Send Message
            </Button>
          </form>
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

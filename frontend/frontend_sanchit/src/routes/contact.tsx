import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  Twitter,
  Github,
  Linkedin,
  Send,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sanchit" },
      {
        name: "description",
        content:
          "Get in touch with the Sanchit team. Questions, feedback, partnerships — we'd love to hear from you.",
      },
      { property: "og:title", content: "Contact Sanchit" },
      { property: "og:description", content: "We're here to help." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let's talk about your <span className="text-gradient">learning vault</span>
            </>
          }
          description="Questions, feedback, or just want to say hi — we read every message."
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "hello@sanchit.app",
              desc: "We reply within 24 hours.",
            },
            {
              icon: MessageCircle,
              title: "Live chat",
              value: "Mon–Fri · 9am–6pm IST",
              desc: "Quickest way to get answers.",
            },
            {
              icon: MapPin,
              title: "Studio",
              value: "Kathmandu, India",
              desc: "Building remotely worldwide.",
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+91 80-0000-0000",
              desc: "For partnerships & press.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </div>
                <div className="mt-0.5 font-semibold">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Follow us</div>
            <div className="mt-3 flex gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-brand opacity-10 blur-3xl"
            />
            <div className="relative space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Your name">
                  <Input id="name" placeholder="Aanya Sharma" required />
                </Field>
                <Field id="email" label="Email">
                  <Input id="email" type="email" placeholder="you@university.edu" required />
                </Field>
              </div>
              <Field id="subject" label="Subject">
                <Input id="subject" placeholder="What's this about?" required />
              </Field>
              <Field id="message" label="Message">
                <Textarea id="message" rows={6} placeholder="Tell us a bit more..." required />
              </Field>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-brand text-primary-foreground shadow-glow"
              >
                {sent ? (
                  <>
                    Message sent <Sparkles className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Send message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { q: "How fast do you respond?", a: "Within 24 hours on weekdays — usually faster." },
              {
                q: "Can I request a feature?",
                a: "Yes! Use the form and tag it [Feature]. We read every one.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="text-sm font-semibold">{f.q}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="group">
      <Label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </Label>
      <div className="mt-1.5 transition-transform focus-within:-translate-y-0.5">{children}</div>
    </div>
  );
}

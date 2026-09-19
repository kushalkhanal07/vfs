import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="ml-2">{eyebrow}</span>
        </Badge>
      )}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-blue-950 sm:text-lg">{description}</p>
      )}
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: any;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={`group relative overflow-hidden border-blue-200 bg-white shadow-sm transition-all hover:-translate-y-1 ${className}`}>
      <CardContent className="p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-600 opacity-0 blur-3xl transition-opacity group-hover:opacity-5" />
        <div className="relative">
        <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-blue-950">{description}</p>
      </div>
      </CardContent>
    </Card>
  );
}

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-white p-10 text-blue-900 shadow-sm sm:p-16">
        <div aria-hidden className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
        <div aria-hidden className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-3xl font-bold text-blue-900 sm:text-4xl">
              Build the vault your future self will thank you for.
            </h3>
            <p className="mt-3 max-w-xl text-base text-blue-950">
              Join thousands of students using StudyVault to study smarter — not harder.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg" className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
              <Link to="/signup">Create free account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/features">Explore features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

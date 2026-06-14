import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2, Search, SlidersHorizontal, Sparkles } from "lucide-react";

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = bytes;
  let unitIndex = 0;

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }

  return `${current.toFixed(current >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  tone = "from-blue-500/20 to-blue-500/5",
}: {
  label: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  tone?: string;
}) {
  return (
    <Card className="overflow-hidden border-blue-100 bg-white text-slate-900 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
      <CardContent className="relative p-5">
        <div className={cn("absolute inset-x-0 top-0 h-1 bg-linear-to-r", tone)} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
            {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-white/10 dark:text-blue-200 dark:ring-white/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="border-blue-100 bg-white text-slate-900 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">{title}</CardTitle>
            {description ? <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">{description}</CardDescription> : null}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  filters,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 dark:border-white/10 dark:bg-slate-950/40">
        <Search className="size-4 text-blue-500 dark:text-blue-300" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent px-0 text-slate-800 placeholder:text-slate-500 focus-visible:ring-0 dark:text-slate-100"
        />
      </div>
      {filters}
    </div>
  );
}

export function AdminStateCard({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Sparkles className="size-4" />,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-8 text-center shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-700 ring-1 ring-blue-400/20 dark:text-blue-200">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = "Loading admin data..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-blue-100 bg-white px-4 py-10 text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      <Loader2 className="mr-3 size-4 animate-spin text-blue-500 dark:text-blue-300" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function AdminToolbar({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-700/70 dark:text-blue-200/70">{title}</p>
        {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-none dark:border-white/10 dark:bg-slate-950/40">
      <Table>
        <TableHeader>
          <TableRow className="border-blue-100 hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/5">
            {columns.map((column) => (
              <TableHead key={column} className="h-12 px-4 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

export function AdminTableRowEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow className="border-blue-100 hover:bg-transparent dark:border-white/10">
      <TableCell colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        {message}
      </TableCell>
    </TableRow>
  );
}

export function AdminPill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : tone === "danger"
          ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
          : "border-blue-200 bg-blue-50 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100";

  return <Badge className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>{children}</Badge>;
}

export function AdminDivider() {
  return <Separator className="bg-blue-100 dark:bg-white/10" />;
}

export function AdminFilterButton({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "border-blue-100 bg-white text-slate-700 hover:bg-blue-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
        active && "border-blue-400/30 bg-blue-500/15 text-blue-800 dark:text-blue-50",
      )}
    >
      <SlidersHorizontal className="size-4" />
      {label}
    </Button>
  );
}

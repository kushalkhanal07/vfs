import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getAdminSettings, updateAdminSettings } from "@/api/admin";
import { AdminStateCard, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    uploadSizeLimit: 5242880,
    allowedFileTypes: ["pdf", "docx", "pptx", "png", "jpg", "jpeg", "txt"],
    spamThreshold: 0.15,
    revisionSettings: { defaultIntervalDays: 1, reminderLeadMinutes: 10, streakGraceDays: 1 },
    notificationSettings: { dailyDigestEnabled: true, broadcastEnabled: true },
    storageLimitBytes: 5242880,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getAdminSettings();
        if (mounted) setForm((current: any) => ({ ...current, ...result.settings }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load settings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateAdminSettings(form);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading settings..." />;

  return (
    <div className="space-y-6">
      <AdminToolbar title="Settings Management" description="Configure upload limits, spam thresholds, revisions, and notifications." />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-blue-100 bg-white p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Storage & uploads</h3>
          <Input type="number" value={form.uploadSizeLimit} onChange={(e) => setForm((current: any) => ({ ...current, uploadSizeLimit: Number(e.target.value) }))} placeholder="Upload size limit" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <Input type="number" value={form.storageLimitBytes} onChange={(e) => setForm((current: any) => ({ ...current, storageLimitBytes: Number(e.target.value) }))} placeholder="Storage limit bytes" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <Textarea value={Array.isArray(form.allowedFileTypes) ? form.allowedFileTypes.join(", ") : ""} onChange={(e) => setForm((current: any) => ({ ...current, allowedFileTypes: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Allowed file types, comma separated" className="min-h-24 border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <Input type="number" step="0.01" value={form.spamThreshold} onChange={(e) => setForm((current: any) => ({ ...current, spamThreshold: Number(e.target.value) }))} placeholder="Spam threshold" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
        </div>

        <div className="space-y-4 rounded-3xl border border-blue-100 bg-white p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revision and notifications</h3>
          <Input type="number" value={form.revisionSettings?.defaultIntervalDays || 1} onChange={(e) => setForm((current: any) => ({ ...current, revisionSettings: { ...current.revisionSettings, defaultIntervalDays: Number(e.target.value) } }))} placeholder="Default interval days" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <Input type="number" value={form.revisionSettings?.reminderLeadMinutes || 10} onChange={(e) => setForm((current: any) => ({ ...current, revisionSettings: { ...current.revisionSettings, reminderLeadMinutes: Number(e.target.value) } }))} placeholder="Reminder lead minutes" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <Input type="number" value={form.revisionSettings?.streakGraceDays || 1} onChange={(e) => setForm((current: any) => ({ ...current, revisionSettings: { ...current.revisionSettings, streakGraceDays: Number(e.target.value) } }))} placeholder="Streak grace days" className="border-blue-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" />
          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span>Daily digest enabled</span>
            <Switch checked={form.notificationSettings?.dailyDigestEnabled ?? true} onCheckedChange={(checked) => setForm((current: any) => ({ ...current, notificationSettings: { ...current.notificationSettings, dailyDigestEnabled: checked } }))} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span>Broadcast notifications</span>
            <Switch checked={form.notificationSettings?.broadcastEnabled ?? true} onCheckedChange={(checked) => setForm((current: any) => ({ ...current, notificationSettings: { ...current.notificationSettings, broadcastEnabled: checked } }))} />
          </div>
          <Button onClick={save} disabled={saving} className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100">
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

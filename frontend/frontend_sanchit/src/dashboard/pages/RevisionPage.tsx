import React, { useEffect, useState } from "react";
import { getWeekSessions, createSession } from "../../api/revision";

function formatISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function RevisionPage() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return formatISODate(d);
  });
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(start);
  const [duration, setDuration] = useState(30);

  const load = async (s?: string) => {
    try {
      const res = await getWeekSessions(s || start);
      setGrouped((res as any).grouped || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load(start);
  }, [start]);

  const daysArray = (() => {
    const arr = [];
    const base = new Date(start);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d);
    }
    return arr;
  })();

  const handleCreate = async () => {
    try {
      await createSession({ title, startDate: date, durationMinutes: duration } as any);
      setShowModal(false);
      setTitle("");
      load(start);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Revision Week</h2>
        <div>
          <button className="btn" onClick={() => setShowModal(true)}>
            + Add session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((d) => {
          const key = formatISODate(d);
          const items = grouped[key] || [];
          return (
            <div key={key} className="border p-2 min-h-30">
              <div className="text-sm font-medium">{d.toDateString()}</div>
              <div className="mt-2 space-y-2">
                {items.map((it: any) => (
                  <div key={it._id} className="p-2 bg-blue-100 rounded border border-blue-200">
                    <div className="text-sm font-semibold">{it.title}</div>
                    <div className="text-xs text-blue-400">{new Date(it.startDate).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-950/40">
          <div className="bg-white p-4 rounded w-96 border border-blue-200">
            <h3 className="font-semibold mb-2">Add Study Session</h3>
            <label className="block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-2" />
            <label className="block">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mb-2" />
            <label className="block">Duration (minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full mb-2" />
            <div className="flex justify-end space-x-2">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, SchoolProfile } from "@/context/auth";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DOOffice() {
  const { role } = useAuth();
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [q, setQ] = useState("");
  const doId = localStorage.getItem("do.id") || "";

  useEffect(() => {
    const list: SchoolProfile[] = JSON.parse(localStorage.getItem("schools") || "[]");
    setSchools(list.filter((s) => !doId || s.doId === doId));
  }, [doId]);

  const today = new Date().toISOString().slice(0,10);
  const rows = useMemo(() => schools.filter((s)=>`${s.name} ${s.schoolId} ${s.district}`.toLowerCase().includes(q.toLowerCase())).map((s) => {
    const totalPresent = Object.keys(localStorage)
      .filter((k) => k.startsWith(`attendance:${s.doId}:${s.schoolId}:${today}:`))
      .reduce((acc, key) => acc + Object.values(JSON.parse(localStorage.getItem(key) || "{}") as Record<string, boolean>).filter(Boolean).length, 0);
    return { ...s, totalPresent };
  }), [schools, today]);

  return (
    <AppLayout>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">DO Office • Schools Overview</h1>
          <AddSchool onAdded={() => {
            const list: SchoolProfile[] = JSON.parse(localStorage.getItem("schools") || "[]");
            setSchools(list.filter((s) => !doId || s.doId === doId));
          }} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schools ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <table className="min-w-[800px] w-full">
                <thead className="bg-muted/50 text-sm">
                  <tr>
                    <th className="text-left p-2">School ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">District</th>
                    <th className="text-left p-2">Address</th>
                    <th className="text-left p-2">DO Office ID</th>
                    <th className="text-left p-2">Present Today</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.schoolId} className="odd:bg-background even:bg-muted/20">
                      <td className="p-2 font-mono">{s.schoolId}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.district}</td>
                      <td className="p-2">{s.address}</td>
                      <td className="p-2">{s.doId}</td>
                      <td className="p-2">{s.totalPresent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function AddSchool({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SchoolProfile>({ name: "", schoolId: "", district: "", address: "", doId: localStorage.getItem("do.id") || "" });

  const save = () => {
    if (!form.schoolId || !form.name) return;
    const list: SchoolProfile[] = JSON.parse(localStorage.getItem("schools") || "[]");
    const idx = list.findIndex((s) => s.schoolId === form.schoolId);
    if (idx >= 0) list[idx] = form; else list.push(form);
    localStorage.setItem("schools", JSON.stringify(list));
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add School</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add / Edit School</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <label className="text-sm">School Name<Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
          <label className="text-sm">School ID<Input value={form.schoolId} onChange={(e)=>setForm({...form,schoolId:e.target.value})} /></label>
          <label className="text-sm">District<Input value={form.district} onChange={(e)=>setForm({...form,district:e.target.value})} /></label>
          <label className="text-sm">Address<Input value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
          <label className="text-sm">DO Office ID<Input value={form.doId} onChange={(e)=>setForm({...form,doId:e.target.value})} /></label>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

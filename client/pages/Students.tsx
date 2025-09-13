import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth";
import { useEffect, useMemo, useState } from "react";

export default function Students() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "SCHOOL";
  const [students, setStudents] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const load = () => {
    const list = JSON.parse(localStorage.getItem(`students:${schoolId}`) || localStorage.getItem("students") || "[]");
    setStudents(list);
  };
  useEffect(load, [schoolId]);

  const filtered = useMemo(() => {
    return students.filter((s) => `${s.name} ${s.roll}`.toLowerCase().includes(q.toLowerCase()));
  }, [students, q]);

  return (
    <AppLayout>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Students</h1>
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-xs" />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Student List</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto">
              <table className="min-w-[800px] w-full">
                <thead className="bg-muted/50 text-sm">
                  <tr>
                    <th className="p-2 text-left">Roll</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-left">Section</th>
                    <th className="p-2 text-left">Parent</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <Row key={idx} s={s} onChange={(ns)=>{ const list=[...students]; list[idx]=ns; setStudents(list); localStorage.setItem(`students:${schoolId}`, JSON.stringify(list)); }} />
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

function Row({ s, onChange }: { s: any; onChange: (s: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(s);
  useEffect(()=>setForm(s),[s]);
  return (
    <tr className="odd:bg-background even:bg-muted/20">
      <td className="p-2 font-mono">{s.roll}</td>
      <td className="p-2">{s.name}</td>
      <td className="p-2">{s.className}</td>
      <td className="p-2">{s.section}</td>
      <td className="p-2">{s.parent}</td>
      <td className="p-2">{s.phone}</td>
      <td className="p-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
            <div className="grid gap-2">
              <label className="text-sm">Name<Input value={form.name||""} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
              <label className="text-sm">Roll<Input value={form.roll||""} onChange={(e)=>setForm({...form,roll:e.target.value})} /></label>
              <label className="text-sm">Class<Input value={form.className||""} onChange={(e)=>setForm({...form,className:e.target.value})} /></label>
              <label className="text-sm">Section<Input value={form.section||""} onChange={(e)=>setForm({...form,section:e.target.value})} /></label>
              <label className="text-sm">Parent<Input value={form.parent||""} onChange={(e)=>setForm({...form,parent:e.target.value})} /></label>
              <label className="text-sm">Phone<Input value={form.phone||""} onChange={(e)=>setForm({...form,phone:e.target.value})} /></label>
              <div className="flex justify-end gap-2 mt-2">
                <Button onClick={()=>{ onChange(form); setOpen(false); }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}

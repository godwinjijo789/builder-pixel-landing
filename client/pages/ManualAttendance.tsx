import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

export default function ManualAttendance() {
  const { profile } = useAuth();
  const doId = profile?.doId || localStorage.getItem("do.id") || "DO";
  const schoolId = profile?.schoolId || "SCHOOL";
  const [cls, setCls] = useState("Class 7");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [students, setStudents] = useState<{ name: string; id: string }[]>([]);
  const [present, setPresent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`students:${schoolId}`) || localStorage.getItem("students") || "[]");
    const list = (stored.filter((s: any) => !s.className || s.className === cls) as any[]).map((s, i) => ({ name: s.name || `Student ${i+1}`, id: s.roll || String(i+1).padStart(3,"0") }));
    setStudents(list.length ? list : Array.from({length: 10}, (_,i)=>({name:`Student ${i+1}`, id:String(i+1).padStart(3,'0')})));
    setPresent({});
  }, [cls]);

  const save = () => {
    const key = `attendance:${doId}:${schoolId}:${date}:${cls}`;
    localStorage.setItem(key, JSON.stringify(present));
    toast.success("Manual attendance saved");
  };

  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">Manual Attendance</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={cls} onValueChange={setCls}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  {Array.from({length:12},(_,i)=>(<SelectItem key={i} value={`Class ${i+1}`}>{`Class ${i+1}`}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-44" />
              <Button onClick={save} className="ml-auto">Save</Button>
            </div>
            <div className="rounded-md border divide-y">
              {students.map((s)=> (
                <label key={s.id} className="flex items-center gap-3 p-3">
                  <Checkbox checked={!!present[s.id]} onCheckedChange={(v)=>setPresent((p)=>({...p,[s.id]: Boolean(v)}))} />
                  <div className="flex-1">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {s.id}</div>
                  </div>
                  <span className={`text-xs font-medium ${present[s.id] ? 'text-emerald-600':'text-red-600'}`}>{present[s.id] ? 'Present' : 'Absent'}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

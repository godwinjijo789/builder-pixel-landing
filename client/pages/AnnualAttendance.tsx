import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function fmtDate(y: number, mIndex: number, d: number) {
  const mm = String(mIndex + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function parseTimeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function AnnualAttendance() {
  const now = new Date();
  const [cls, setCls] = useState<string>("Class 7");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(now.getMonth());
  const [startTime, setStartTime] = useState<string>(() => localStorage.getItem(`window:${cls}:start`) || "08:30");
  const [endTime, setEndTime] = useState<string>(() => localStorage.getItem(`window:${cls}:end`) || "10:00");
  const [students, setStudents] = useState<{ name: string; id: string }[]>([]);
  const days = useMemo(() => Array.from({ length: daysInMonth(year, monthIndex) }, (_, i) => i + 1), [year, monthIndex]);

  useEffect(() => {
    // refresh students when class changes
    const stored = JSON.parse(localStorage.getItem("students") || "[]");
    const list = (stored.filter((s: any) => !s.className || s.className === cls) as any[]).map((s: any, i: number) => ({ name: s.name || `Student ${i + 1}`, id: s.roll || String(i + 1).padStart(3, "0") }));
    setStudents(list.length ? list : Array.from({ length: 12 }, (_, i) => ({ name: `Student ${i + 1}`, id: String(i + 1).padStart(3, "0") })));
    // load window per class
    setStartTime(localStorage.getItem(`window:${cls}:start`) || "08:30");
    setEndTime(localStorage.getItem(`window:${cls}:end`) || "10:00");
  }, [cls]);

  const saveWindow = () => {
    localStorage.setItem(`window:${cls}:start`, startTime);
    localStorage.setItem(`window:${cls}:end`, endTime);
  };

  const getStatus = (studentId: string, d: number): "P" | "A" | "" => {
    const date = fmtDate(year, monthIndex, d);
    const key = `attendance:${date}:${cls}`;
    const rec: Record<string, boolean> = JSON.parse(localStorage.getItem(key) || "{}");
    if (rec[studentId]) return "P";
    const todayStr = fmtDate(now.getFullYear(), now.getMonth(), now.getDate());
    const endMinutes = parseTimeToMinutes(endTime);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (date < todayStr) return "A";
    if (date > todayStr) return "";
    if (nowMinutes > endMinutes) return "A";
    return "";
  };

  const toggleCell = (studentId: string, d: number) => {
    const date = fmtDate(year, monthIndex, d);
    const key = `attendance:${date}:${cls}`;
    const rec: Record<string, boolean> = JSON.parse(localStorage.getItem(key) || "{}");
    const status = rec[studentId] === true ? "P" : getStatus(studentId, d);
    if (status === "P") {
      delete rec[studentId]; // toggle to Absent
    } else {
      rec[studentId] = true; // mark Present
    }
    localStorage.setItem(key, JSON.stringify(rec));
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <AppLayout>
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-semibold">Annual Attendance</h1>
          <div className="flex gap-2 flex-wrap">
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={`Class ${i + 1}`}>{`Class ${i + 1}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(monthIndex)} onValueChange={(v) => setMonthIndex(Number(v))}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" className="w-24" value={year} onChange={(e)=>setYear(Number(e.target.value)||year)} />
            <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-background">
              <span className="text-xs text-muted-foreground">Window</span>
              <Input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-28" />
              <span className="text-muted-foreground">–</span>
              <Input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-28" />
              <Button onClick={saveWindow} size="sm" className="ml-1">Save</Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{months[monthIndex]} {year} • {cls}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border rounded-md">
              <table className="min-w-[900px] w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-sm">
                    <th className="sticky left-0 bg-muted/50 p-2 text-left font-medium border-r">Student</th>
                    {days.map((d) => (
                      <th key={d} className="px-2 py-1 border-l text-center font-medium">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="odd:bg-background even:bg-muted/20">
                      <td className="sticky left-0 bg-inherit p-2 border-r whitespace-nowrap">
                        <div className="font-medium leading-tight">{s.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {s.id}</div>
                      </td>
                      {days.map((d) => {
                        const st = getStatus(s.id, d);
                        return (
                          <td
                            key={d}
                            onClick={() => { toggleCell(s.id, d); /* re-render by updating state */ setStudents((x)=>[...x]); }}
                            className={cn(
                              "h-9 border-l text-center select-none cursor-pointer align-middle",
                              st === "P" && "bg-emerald-50 text-emerald-700",
                              st === "A" && "bg-red-50 text-red-700",
                            )}
                            title={st === "" ? "Pending" : st === "P" ? "Present" : "Absent (click to edit)"}
                          >
                            {st === "" ? "" : st}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Legend: P = Present, A = Absent. Click any cell to toggle. If not marked by the end of the window, students are marked Absent automatically.</div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

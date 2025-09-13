import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function AutoWindows() {
  const [schools, setSchools] = useState<any[]>([]);
  useEffect(()=>{
    setSchools(JSON.parse(localStorage.getItem("schools") || "[]"));
  },[]);

  const save = (id: string, start: string, end: string) => {
    localStorage.setItem(`window:school:${id}:start`, start);
    localStorage.setItem(`window:school:${id}:end`, end);
  };

  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">Automatic Attendance Time Windows</h1>
        <Card>
          <CardHeader><CardTitle className="text-base">Per School</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto">
              <table className="min-w-[800px] w-full">
                <thead className="bg-muted/50 text-sm"><tr><th className="p-2 text-left">School</th><th className="p-2 text-left">Start</th><th className="p-2 text-left">End</th><th className="p-2 text-left">Save</th></tr></thead>
                <tbody>
                  {schools.map((s)=>{
                    const start = localStorage.getItem(`window:school:${s.schoolId}:start`) || "08:30";
                    const end = localStorage.getItem(`window:school:${s.schoolId}:end`) || "10:00";
                    return (
                      <tr key={s.schoolId} className="odd:bg-background even:bg-muted/20">
                        <td className="p-2">{s.name || s.schoolId}</td>
                        <td className="p-2"><Input type="time" defaultValue={start} onChange={(e)=>localStorage.setItem(`window:school:${s.schoolId}:start`, e.target.value)} className="w-32" /></td>
                        <td className="p-2"><Input type="time" defaultValue={end} onChange={(e)=>localStorage.setItem(`window:school:${s.schoolId}:end`, e.target.value)} className="w-32" /></td>
                        <td className="p-2"><Button size="sm" onClick={()=>save(s.schoolId, localStorage.getItem(`window:school:${s.schoolId}:start`)||start, localStorage.getItem(`window:school:${s.schoolId}:end`)||end)}>Save</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground mt-2">These windows are used for school-wide defaults. Class-specific windows can override them in the Annual Attendance page.</div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

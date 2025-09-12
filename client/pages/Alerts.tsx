import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

const ALL_ALERTS = [
  { id: 1, type: "Absenteeism", title: "Absenteeism Alert", body: "Alice Johnson was absent from her 3rd-period class today. Please contact the school for more details.", tone: "destructive" as const },
  { id: 2, type: "System", title: "System Update", body: "A new system update has been deployed. Expect improved performance and new features.", tone: "default" as const },
  { id: 3, type: "Acknowledgement", title: "Acknowledgement Pending", body: "Bob Smith attended all classes today. Please acknowledge this daily attendance summary.", tone: "default" as const },
  { id: 4, type: "Absenteeism", title: "Absenteeism Alert", body: "Charlie Brown was absent from the morning assembly. Kindly follow up.", tone: "destructive" as const },
];

export default function Alerts() {
  const [type, setType] = useState<string>("All");
  const filtered = useMemo(() => (type === "All" ? ALL_ALERTS : ALL_ALERTS.filter((a) => a.type === type)), [type]);

  return (
    <AppLayout>
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-semibold">Parent Alerts</h1>
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Absenteeism">Absenteeism</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Acknowledgement">Acknowledgement</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setType("All")}>Apply Filters</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className={`text-base ${a.tone === "destructive" ? "text-destructive" : ""}`}>{a.title}</CardTitle>
                <div className="text-xs text-muted-foreground">Type: {a.type}</div>
              </CardHeader>
              <CardContent>{a.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

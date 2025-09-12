import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const data = [
  { m: "Jan", Present: 920, Absent: 60 },
  { m: "Feb", Present: 910, Absent: 70 },
  { m: "Mar", Present: 935, Absent: 55 },
  { m: "Apr", Present: 960, Absent: 40 },
  { m: "May", Present: 945, Absent: 50 },
  { m: "Jun", Present: 930, Absent: 65 },
  { m: "Jul", Present: 940, Absent: 60 },
  { m: "Aug", Present: 955, Absent: 45 },
  { m: "Sep", Present: 970, Absent: 35 },
  { m: "Oct", Present: 965, Absent: 40 },
  { m: "Nov", Present: 950, Absent: 55 },
  { m: "Dec", Present: 940, Absent: 60 },
];

export default function AnnualAttendance() {
  const config = { Present: { color: "hsl(var(--primary))", label: "Present" }, Absent: { color: "hsl(var(--destructive))", label: "Absent" } };
  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">Annual Attendance</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="aspect-[16/7]">
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Present" radius={[4,4,0,0]} fill="var(--color-Present)" />
                  <Bar dataKey="Absent" radius={[4,4,0,0]} fill="var(--color-Absent)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

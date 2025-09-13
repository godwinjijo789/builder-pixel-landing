import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const stats = [
  {
    title: "Total Students",
    value: 1200,
    delta: "+5 new",
    deltaClass: "text-emerald-600",
  },
  {
    title: "Present Today",
    value: 1080,
    delta: "+2% from yesterday",
    deltaClass: "text-emerald-600",
  },
  {
    title: "Absent Today",
    value: 120,
    delta: "-1% from yesterday",
    deltaClass: "text-red-600",
  },
  {
    title: "Recent Alerts",
    value: 8,
    delta: "+3 new",
    deltaClass: "text-emerald-600",
  },
];

const attendanceData = [
  { month: "Jan", Present: 980, Absent: 40 },
  { month: "Feb", Present: 900, Absent: 60 },
  { month: "Mar", Present: 1000, Absent: 25 },
  { month: "Apr", Present: 950, Absent: 35 },
  { month: "May", Present: 920, Absent: 45 },
  { month: "Jun", Present: 880, Absent: 55 },
];

const initialFeed = [
  { name: "Aisha Rahman", id: "S001", time: "10:05 AM", status: "Present" },
  { name: "Ben Carter", id: "S002", time: "10:03 AM", status: "Present" },
  { name: "Clara Diaz", id: "S003", time: "10:01 AM", status: "Absent" },
  { name: "David Lee", id: "S004", time: "09:58 AM", status: "Present" },
];

export default function Index() {
  const [feed, setFeed] = useState(initialFeed);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setFeed((prev) => {
        const now = new Date();
        const next = {
          name: randomName(),
          id: `S${String(Math.floor(Math.random() * 900) + 1000)}`,
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: Math.random() > 0.1 ? "Present" : "Absent",
        } as const;
        return [next, ...prev].slice(0, 8);
      });
    }, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const chartConfig = useMemo(
    () => ({ Present: { color: "hsl(var(--primary))", label: "Present" }, Absent: { color: "hsl(var(--destructive))", label: "Absent" } }),
    [],
  );

  return (
    <AppLayout>
      <div className="grid gap-4 md:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.title} className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
                <div className={"mt-1 flex items-center gap-1 text-xs " + s.deltaClass}>
                  {s.deltaClass.includes("emerald") ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span>{s.delta}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Historical Attendance</CardTitle>
              <Button variant="outline" size="sm">Last 6 Months</Button>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-[16/7]">
                <ResponsiveContainer>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
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

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Absenteeism/Proxy Alerts</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')}>View All</Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <div className="font-medium">Potential proxy detected in Class 7A</div>
                    <div className="text-xs text-muted-foreground">Investigate and confirm identity</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                  <div>
                    <div className="font-medium">High absenteeism in Grade 5</div>
                    <div className="text-xs text-muted-foreground">Parent notification pending</div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Real-time Attendance Feed</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setFeed(shuffleFeed())}>Refresh</Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {feed.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium leading-none">{f.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {f.id}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{f.time}</span>
                    <Badge variant={f.status === "Present" ? "default" : "destructive"}>{f.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function shuffleFeed() {
  return Array.from({ length: 4 }, () => ({
    name: randomName(),
    id: `S${Math.floor(Math.random()*9000)+1000}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: Math.random() > 0.15 ? 'Present' : 'Absent',
  }));
}

function randomName() {
  const first = ["Aisha","Ben","Clara","David","Eva","Farid","Grace","Hari","Isha","Jon"];
  const last = ["Rahman","Carter","Diaz","Lee","Singh","Ahmed","Okoro","Patel","Khan","Kim"];
  return `${first[Math.floor(Math.random()*first.length)]} ${last[Math.floor(Math.random()*last.length)]}`;
}

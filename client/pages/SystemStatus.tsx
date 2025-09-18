import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CAMS = [
  {
    id: 1,
    name: "CCTV Camera 1",
    location: "Main Entrance - School A",
    status: "online",
    last: "2 mins ago",
    uptime: "25 days",
    img: "https://images.unsplash.com/photo-1589254066213-a0c9dc853511?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "CCTV Camera 2",
    location: "Classroom 1 - School A",
    status: "offline",
    last: "Yesterday 10:30 AM",
    uptime: "1 day",
    img: "https://images.unsplash.com/photo-1608889175189-f1a8c2c3f85e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "CCTV Camera 3",
    location: "Playground - School B",
    status: "online",
    last: "10 minutes ago",
    uptime: "12 days",
    img: "https://images.unsplash.com/photo-1565619624098-2f4b4f32ed7f9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "CCTV Camera 4",
    location: "Cafeteria - School B",
    status: "online",
    last: "1 hour ago",
    uptime: "4 days",
    img: "https://images.unsplash.com/photo-1585435376539-5751d76fb5a6?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "CCTV Camera 5",
    location: "Library - School B",
    status: "online",
    last: "5 minutes ago",
    uptime: "30 days",
    img: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "CCTV Camera 6",
    location: "Bus Stop - School C",
    status: "offline",
    last: "1 hour ago",
    uptime: "8 days",
    img: "https://images.unsplash.com/photo-1576765607778-c09c7fa1f7b9?q=80&w=800&auto=format&fit=crop",
  },
];

const MAINT = [
  {
    id: 1,
    title: "Power Supply Failure",
    device: "CCTV Camera 2",
    urgency: "High",
    rec: "Replace PSU immediately, schedule a technician visit within 24 hours.",
  },
  {
    id: 2,
    title: "Lens Cleaning Required",
    device: "CCTV Camera 4",
    urgency: "Medium",
    rec: "Perform routine lens cleaning during next maintenance window.",
  },
];

export default function SystemStatus() {
  const online = CAMS.filter((c) => c.status === "online").length;
  const offline = CAMS.length - online;
  const [openCamId, setOpenCamId] = useState<number | null>(null);
  const [resolved, setResolved] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const r = JSON.parse(localStorage.getItem("maint.resolved") || "[]");
    setResolved(Array.isArray(r) ? r : []);
  }, []);

  const unresolvedMaint = useMemo(
    () => MAINT.filter((m) => !resolved.includes(m.id)),
    [resolved],
  );

  const viewCam = (id: number) => setOpenCamId(id);
  const closeCam = () => setOpenCamId(null);

  const markResolved = (id: number) => {
    setResolved((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem("maint.resolved", JSON.stringify(next));
      return next;
    });
  };

  const cam = CAMS.find((c) => c.id === openCamId) || null;

  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">System Status</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{CAMS.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Online Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {online}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Offline Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{offline}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connectivity Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-emerald-600">
                Internet: Connected
              </div>
              <div className="text-sm text-emerald-600">
                Cloud Sync: Synchronized
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cloud Sync Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={92} />
              <div className="text-xs text-muted-foreground mt-2">
                Last sync today • 7 files pending upload
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CAMS.map((c) => (
            <Card key={c.id}>
              <img
                src={c.img}
                alt={c.name}
                className="h-40 w-full object-cover"
              />
              <CardHeader>
                <CardTitle className="text-base">{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {c.location}
                </div>
                <div
                  className={`mt-2 text-sm font-medium ${c.status === "online" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {c.status === "online" ? "Online" : "Offline"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last Check-in: {c.last}
                </div>
                <div className="text-xs text-muted-foreground">
                  Uptime: {c.uptime}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => viewCam(c.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unresolvedMaint.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  {m.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Device: {m.device}</div>
                <div className="text-sm">Urgency: {m.urgency}</div>
                <div className="text-sm mt-2 text-muted-foreground">
                  Recommendation: {m.rec}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => markResolved(m.id)}
                >
                  Resolve Issue
                </Button>
              </CardFooter>
            </Card>
          ))}
          {unresolvedMaint.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  No outstanding maintenance issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  All systems are healthy.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={!!openCamId} onOpenChange={(o) => !o && closeCam()}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Camera Details</DialogTitle>
            </DialogHeader>
            {cam && (
              <div className="grid gap-3">
                <img
                  src={cam.img}
                  alt={cam.name}
                  className="w-full h-56 object-cover rounded-md border"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    {cam.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    {cam.location}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <span
                      className={
                        cam.status === "online"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {cam.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime: </span>
                    {cam.uptime}
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Last check-in:{" "}
                    </span>
                    {cam.last}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeCam}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      closeCam();
                      navigate("/cctv");
                    }}
                  >
                    Go to CCTV
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

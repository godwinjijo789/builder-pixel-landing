import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/context/auth";

function useWebSocketStream() {
  const [url, setUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (!url) {
      setError("Enter WebSocket URL");
      return;
    }
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setError(null);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
      };
      ws.onerror = () => {
        setError("WebSocket error or unreachable.");
        setConnected(false);
      };
      ws.onmessage = (ev) => {
        try {
          const data =
            typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
          if (data && data.type === "frame" && typeof data.data === "string") {
            if (autoplay) setLastImage(data.data);
          }
          // optional status messages
        } catch {
          // If binary (e.g., JPEG bytes), create a blob URL
          if (ev.data instanceof Blob) {
            const url = URL.createObjectURL(ev.data);
            if (autoplay) setLastImage(url);
          }
        }
      };
    } catch (e) {
      setError("Failed to connect.");
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setConnected(false);
  };

  useEffect(
    () => () => {
      socketRef.current?.close();
    },
    [],
  );

  return {
    url,
    setUrl,
    connected,
    error,
    lastImage,
    connect,
    disconnect,
    autoplay,
    setAutoplay,
  };
}

function AnalogCamera() {
  const {
    url,
    setUrl,
    connected,
    error,
    lastImage,
    connect,
    disconnect,
    autoplay,
    setAutoplay,
  } = useWebSocketStream();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Analog Camera Connection (via WebSocket bridge)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <label className="text-sm">
            WebSocket URL
            <Input
              placeholder="wss://bridge.example/ws"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <div className="flex items-center gap-2">
            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
            <span className="text-sm text-muted-foreground">
              Auto-display frames
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!connected ? (
            <Button onClick={connect}>Connect</Button>
          ) : (
            <Button variant="destructive" onClick={disconnect}>
              Disconnect
            </Button>
          )}
        </div>
        {error && <div className="text-xs text-destructive">{error}</div>}
        <div className="rounded-md overflow-hidden border bg-muted/30 grid place-items-center aspect-[16/9]">
          {lastImage ? (
            <img
              src={lastImage}
              alt="Stream frame"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-xs text-muted-foreground p-4 text-center">
              Waiting for frames... The bridge should send messages like{" "}
              {`{"type":"frame","data":"data:image/jpeg;base64,..."}`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function hamming(a: bigint, b: bigint) {
  let x = a ^ b;
  let count = 0;
  while (x) {
    x &= x - 1n;
    count++;
  }
  return count;
}

function dhash(img: HTMLCanvasElement): bigint {
  const ctx = img.getContext("2d")!;
  const w = 9,
    h = 8;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext("2d")!;
  tctx.drawImage(img, 0, 0, w, h);
  const data = tctx.getImageData(0, 0, w, h).data;
  let hash = 0n;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i1 = (y * w + x) * 4;
      const i2 = (y * w + x + 1) * 4;
      const g1 = 0.299 * data[i1] + 0.587 * data[i1 + 1] + 0.114 * data[i1 + 2];
      const g2 = 0.299 * data[i2] + 0.587 * data[i2 + 1] + 0.114 * data[i2 + 2];
      hash = (hash << 1n) | (g1 > g2 ? 1n : 0n);
    }
  }
  return hash;
}

function IPCamera() {
  const { profile } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [ipUrl, setIpUrl] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const students: any[] = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem(`students:${profile?.schoolId || "SCHOOL"}`) ||
          localStorage.getItem("students") ||
          "[]",
      ),
    [profile?.schoolId],
  );
  const hashesRef = useRef<
    { id: string; className: string; name: string; hash: bigint }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detector =
    "FaceDetector" in window
      ? new (window as any).FaceDetector({ fastMode: true })
      : null;

  useEffect(
    () => () => {
      stop();
    },
    [],
  );

  const buildHashes = async () => {
    const list: {
      id: string;
      className: string;
      name: string;
      hash: bigint;
    }[] = [];
    for (const s of students) {
      if (!s.faceImage) continue;
      const img = new Image();
      await new Promise<void>((r) => {
        img.onload = () => r();
        img.src = s.faceImage;
      });
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      const h = dhash(c);
      list.push({
        id: s.roll || s.id,
        className: s.className || "Class 7",
        name: s.name || "Student",
        hash: h,
      });
    }
    hashesRef.current = list;
  };

  const start = async () => {
    setHint(null);
    try {
      await buildHashes();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStarted(true);
      }
    } catch (e) {
      setHint("Could not access camera. Ensure permissions are granted.");
    }
  };

  const stop = () => {
    const media = videoRef.current?.srcObject as MediaStream | null;
    media?.getTracks().forEach((t) => t.stop());
    setStarted(false);
    setDetecting(false);
  };

  const tick = async () => {
    if (!detector || !videoRef.current) return;
    const v = videoRef.current;
    const canvas =
      canvasRef.current ||
      (canvasRef.current = document.createElement("canvas"));
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    try {
      const faces = await detector.detect(canvas);
      for (const f of faces) {
        const { x, y, width, height } = f.boundingBox as DOMRectReadOnly;
        const faceCanvas = document.createElement("canvas");
        faceCanvas.width = width;
        faceCanvas.height = height;
        faceCanvas
          .getContext("2d")!
          .drawImage(canvas, x, y, width, height, 0, 0, width, height);
        const h = dhash(faceCanvas);
        let best: { cand: any; dist: number } | null = null;
        for (const cand of hashesRef.current) {
          const dist = Number(hamming(h, cand.hash));
          if (!best || dist < best.dist) best = { cand, dist };
        }
        if (best && best.dist <= 10) {
          const today = new Date();
          const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const doId = profile?.doId || localStorage.getItem("do.id") || "DO";
          const schoolId = profile?.schoolId || "SCHOOL";
          const key = `attendance:${doId}:${schoolId}:${date}:${best.cand.className}`;
          const rec: Record<string, boolean> = JSON.parse(
            localStorage.getItem(key) || "{}",
          );
          if (!rec[best.cand.id]) {
            rec[best.cand.id] = true;
            localStorage.setItem(key, JSON.stringify(rec));
            setLog((l) =>
              [
                `${best.cand.name} (${best.cand.id}) marked Present`,
                ...l,
              ].slice(0, 20),
            );
            try {
              await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: {
                    doId,
                    schoolId,
                    date,
                    className: best.cand.className,
                    studentId: best.cand.id,
                    status: "P",
                  },
                }),
              });
            } catch {}
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (!detecting) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [detecting]);

  const uploadAbsentees = async () => {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const doId = profile?.doId || localStorage.getItem("do.id") || "DO";
    const schoolId = profile?.schoolId || "SCHOOL";
    const grouped: Record<string, any[]> = {};
    for (const s of students) {
      const cls = s.className || "Class 7";
      grouped[cls] = grouped[cls] || [];
      grouped[cls].push(s);
    }
    for (const cls of Object.keys(grouped)) {
      const key = `attendance:${doId}:${schoolId}:${date}:${cls}`;
      const rec: Record<string, boolean> = JSON.parse(
        localStorage.getItem(key) || "{}",
      );
      for (const s of grouped[cls]) {
        if (!rec[s.roll]) {
          try {
            await fetch("/api/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: {
                  doId,
                  schoolId,
                  date,
                  className: cls,
                  studentId: s.roll,
                  status: "A",
                },
              }),
            });
          } catch {}
        }
      }
    }
    setLog((l) => ["Absentees uploaded", ...l].slice(0, 20));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IP Camera Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          For on-prem IP cameras (RTSP/ONVIF), use a gateway that exposes a
          WebRTC or WebSocket MJPEG bridge to the browser. For testing, you can
          use your local camera below.
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <label className="text-sm">
            IP/Stream URL
            <Input
              placeholder="rtsp:// or webrtc:// via gateway"
              value={ipUrl}
              onChange={(e) => setIpUrl(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Facing Mode
            <select
              className="input-like"
              value={facingMode}
              onChange={(e) => setFacingMode(e.target.value as any)}
            >
              <option value="environment">Back</option>
              <option value="user">Front</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          {!started ? (
            <Button onClick={start}>Start Local Camera</Button>
          ) : (
            <>
              <Button variant="destructive" onClick={stop}>
                Stop
              </Button>
              <Button
                variant={detecting ? "default" : "outline"}
                onClick={() => setDetecting((d) => !d)}
                disabled={!detector}
              >
                {detecting ? "Stop Detection" : "Start Detection"}
              </Button>
              <Button variant="outline" onClick={uploadAbsentees}>
                Upload Absentees
              </Button>
            </>
          )}
        </div>
        {!detector && (
          <div className="text-xs text-yellow-600">
            FaceDetector API not available in this browser. Detection will be
            disabled.
          </div>
        )}
        {hint && <div className="text-xs text-destructive">{hint}</div>}
        <div className="rounded-md overflow-hidden border bg-muted/30 aspect-[16/9]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
        <div className="text-xs text-muted-foreground">Log:</div>
        <ul className="text-xs max-h-40 overflow-auto border rounded p-2 bg-background">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function CCTV() {
  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">CCTV Cameras</h1>
        <AnalogCamera />
        <IPCamera />
      </div>
    </AppLayout>
  );
}

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";

function useWebSocketStream() {
  const [url, setUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (!url) { setError("Enter WebSocket URL"); return; }
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setError(null);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => { setConnected(false); };
      ws.onerror = () => { setError("WebSocket error or unreachable."); setConnected(false); };
      ws.onmessage = (ev) => {
        try {
          const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
          if (data && data.type === 'frame' && typeof data.data === 'string') {
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

  useEffect(() => () => { socketRef.current?.close(); }, []);

  return { url, setUrl, connected, error, lastImage, connect, disconnect, autoplay, setAutoplay };
}

function AnalogCamera() {
  const { url, setUrl, connected, error, lastImage, connect, disconnect, autoplay, setAutoplay } = useWebSocketStream();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Analog Camera Connection (via WebSocket bridge)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <label className="text-sm">WebSocket URL<Input placeholder="wss://bridge.example/ws" value={url} onChange={(e)=>setUrl(e.target.value)} /></label>
          <div className="flex items-center gap-2">
            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
            <span className="text-sm text-muted-foreground">Auto-display frames</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!connected ? (
            <Button onClick={connect}>Connect</Button>
          ) : (
            <Button variant="destructive" onClick={disconnect}>Disconnect</Button>
          )}
        </div>
        {error && <div className="text-xs text-destructive">{error}</div>}
        <div className="rounded-md overflow-hidden border bg-muted/30 grid place-items-center aspect-[16/9]">
          {lastImage ? (
            <img src={lastImage} alt="Stream frame" className="w-full h-full object-contain" />
          ) : (
            <div className="text-xs text-muted-foreground p-4 text-center">Waiting for frames... The bridge should send messages like {`{"type":"frame","data":"data:image/jpeg;base64,..."}`}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IPCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user'|'environment'>('environment');
  const [ipUrl, setIpUrl] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => () => { stop(); }, []);

  const start = async () => {
    setHint(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IP Camera Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          For on-prem IP cameras (RTSP/ONVIF), use a gateway that exposes a WebRTC or WebSocket MJPEG bridge to the browser. For testing, you can use your local camera below.
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <label className="text-sm">IP/Stream URL<Input placeholder="rtsp:// or webrtc:// via gateway" value={ipUrl} onChange={(e)=>setIpUrl(e.target.value)} /></label>
          <label className="text-sm">Facing Mode<select className="input-like" value={facingMode} onChange={(e)=>setFacingMode(e.target.value as any)}><option value="environment">Back</option><option value="user">Front</option></select></label>
        </div>
        <div className="flex gap-2">
          {!started ? (
            <Button onClick={start}>Start Local Camera</Button>
          ) : (
            <Button variant="destructive" onClick={stop}>Stop</Button>
          )}
        </div>
        {hint && <div className="text-xs text-destructive">{hint}</div>}
        <div className="rounded-md overflow-hidden border bg-muted/30 aspect-[16/9]">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        </div>
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

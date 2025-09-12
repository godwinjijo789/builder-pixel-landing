import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useRef, useState } from "react";

export default function Enrollment() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <StudentInfo />
        <FaceCapture />
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2">
            <span>Save & Register Student</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function StudentInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Student Information</CardTitle>
        <p className="text-sm text-muted-foreground">Please fill in the student's details accurately.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row>
          <div>
            <Label htmlFor="name">Student Name</Label>
            <Input id="name" placeholder="Enter student's full name" />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" />
          </div>
        </Row>
        <Row>
          <div>
            <Label>Gender</Label>
            <RadioGroup defaultValue="Male" className="mt-2 flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Class/Grade</Label>
            <Select defaultValue="Class 7">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={`Class ${i + 1}`}>{`Class ${i + 1}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="roll">Roll Number</Label>
            <Input id="roll" placeholder="Enter roll number" />
          </div>
          <div>
            <Label htmlFor="parent">Parent/Guardian Name</Label>
            <Input id="parent" placeholder="Enter parent's full name" />
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="phone">Parent Contact Number</Label>
            <Input id="phone" placeholder="e.g., +1234567890" />
          </div>
          <div>
            <Label htmlFor="email">Parent Email (Optional)</Label>
            <Input id="email" type="email" placeholder="e.g., parent@example.com" />
          </div>
        </Row>
      </CardContent>
    </Card>
  );
}

function FaceCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (e) {
      setError("Camera access unavailable. You can upload a photo instead.");
    }
  };

  const stopStream = () => {
    const media = videoRef.current?.srcObject as MediaStream | null;
    media?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/png");
    setImage(data);
    stopStream();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facial Data Capture</CardTitle>
        <p className="text-sm text-muted-foreground">Follow the instructions to capture the student's face for AI recognition.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 text-sm text-muted-foreground space-y-1">
          <div>• Ensure the student is facing the camera directly and under good lighting.</div>
          <div>• The full face should be visible within the frame; remove hats or obstructions.</div>
          <div>• Click "Capture Image" or upload an existing photo.</div>
        </div>

        <div className="rounded-lg overflow-hidden border bg-muted/30">
          {!image && (
            <div className="aspect-[16/6] grid place-items-center text-muted-foreground">
              {!streaming ? (
                <div className="flex flex-col items-center gap-3">
                  <Button onClick={startStream}>Start Camera</Button>
                  {error && <div className="text-xs text-destructive">{error}</div>}
                  <div className="text-xs">or upload a photo below</div>
                </div>
              ) : null}
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted hidden={!streaming} />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          {image && (
            <img src={image} alt="Captured" className="w-full object-cover aspect-[16/6]" />
          )}
        </div>

        <div className="flex items-center gap-3">
          {streaming ? (
            <Button onClick={capture}>Capture Image</Button>
          ) : (
            <Button onClick={startStream}>Capture Image</Button>
          )}
          <Input type="file" accept="image/*" onChange={onFile} className="max-w-xs" />
          {image && (
            <Button variant="outline" onClick={() => setImage(null)}>
              Retake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

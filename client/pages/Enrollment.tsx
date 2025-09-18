import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

export default function Enrollment() {
  const { role, profile } = useAuth();
  const [student, setStudent] = useState<any>({
    gender: "Male",
    className: "Class 7",
  });
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const schoolList: any[] = JSON.parse(localStorage.getItem("schools") || "[]");
  const [targetSchool, setTargetSchool] = useState<string>(
    profile?.schoolId || schoolList[0]?.schoolId || "",
  );

  const getImageDims = (dataUrl: string) =>
    new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.src = dataUrl;
    });

  const save = async () => {
    if (!student.name || !student.roll) {
      toast.error("Please complete required fields: name and roll number.");
      return;
    }
    const schoolId =
      role === "school" ? profile?.schoolId || "SCHOOL" : targetSchool;
    if (!schoolId) {
      toast.error("Select a school to save this student.");
      return;
    }
    if (!faceImage) {
      toast.error("Capture a clear face image before saving.");
      return;
    }
    const { w, h } = await getImageDims(faceImage);
    if (w < 200 || h < 200) {
      toast.error("Face image too small. Capture a clearer image.");
      return;
    }

    const entry = { ...student, faceImage };
    const list = JSON.parse(localStorage.getItem("students") || "[]");
    list.push(entry);
    localStorage.setItem("students", JSON.stringify(list));
    const key = `students:${schoolId}`;
    const slist = JSON.parse(localStorage.getItem(key) || "[]");
    slist.push(entry);
    localStorage.setItem(key, JSON.stringify(slist));

    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, student: entry }),
      });
    } catch {}

    toast.success("Student registered successfully");
    setStudent({ gender: "Male", className: "Class 7" });
    setFaceImage(null);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {role === "do" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target School</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={targetSchool} onValueChange={setTargetSchool}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schoolList.map((s) => (
                    <SelectItem key={s.schoolId} value={s.schoolId}>
                      {s.name || s.schoolId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        <StudentInfo value={student} onChange={setStudent} />
        <FaceCapture value={faceImage} onChange={setFaceImage} />
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setStudent({ gender: "Male", className: "Class 7" });
              setFaceImage(null);
            }}
          >
            Cancel
          </Button>
          <Button className="gap-2" onClick={save}>
            <span>Save & Register Student</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function StudentInfo({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Student Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please fill in the student's details accurately.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row>
          <div>
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              placeholder="Enter student's full name"
              value={value.name || ""}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={value.dob || ""}
              onChange={(e) => onChange({ ...value, dob: e.target.value })}
            />
          </div>
        </Row>
        <Row>
          <div>
            <Label>Gender</Label>
            <RadioGroup
              value={value.gender}
              onValueChange={(v) => onChange({ ...value, gender: v })}
              className="mt-2 flex gap-6"
            >
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
            <Select
              value={value.className}
              onValueChange={(v) => onChange({ ...value, className: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => (
                  <SelectItem
                    key={i}
                    value={`Class ${i + 1}`}
                  >{`Class ${i + 1}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="roll">Roll Number</Label>
            <Input
              id="roll"
              placeholder="Enter roll number"
              value={value.roll || ""}
              onChange={(e) => onChange({ ...value, roll: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              placeholder="e.g., A / B / C"
              value={value.section || ""}
              onChange={(e) => onChange({ ...value, section: e.target.value })}
            />
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="parent">Parent/Guardian Name</Label>
            <Input
              id="parent"
              placeholder="Enter parent's full name"
              value={value.parent || ""}
              onChange={(e) => onChange({ ...value, parent: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Parent Contact Number</Label>
            <Input
              id="phone"
              placeholder="e.g., +1234567890"
              value={value.phone || ""}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
            />
          </div>
        </Row>
        <Row>
          <div>
            <Label htmlFor="phone">Parent Contact Number</Label>
            <Input
              id="phone"
              placeholder="e.g., +1234567890"
              value={value.phone || ""}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Parent Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., parent@example.com"
              value={value.email || ""}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
            />
          </div>
        </Row>
      </CardContent>
    </Card>
  );
}

function FaceCapture({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<string | null>(value);
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
    onChange(data);
    stopStream();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const d = reader.result as string;
      setImage(d);
      onChange(d);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facial Data Capture</CardTitle>
        <p className="text-sm text-muted-foreground">
          Follow the instructions to capture the student's face for AI
          recognition.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 text-sm text-muted-foreground space-y-1">
          <div>
            • Ensure the student is facing the camera directly and under good
            lighting.
          </div>
          <div>
            • The full face should be visible within the frame; remove hats or
            obstructions.
          </div>
          <div>• Click "Capture Image" or upload an existing photo.</div>
        </div>

        <div className="rounded-lg overflow-hidden border bg-muted/30">
          {!image && (
            <div className="aspect-[16/6] grid place-items-center text-muted-foreground">
              {!streaming ? (
                <div className="flex flex-col items-center gap-3">
                  <Button onClick={startStream}>Start Camera</Button>
                  {error && (
                    <div className="text-xs text-destructive">{error}</div>
                  )}
                  <div className="text-xs">or upload a photo below</div>
                </div>
              ) : null}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                hidden={!streaming}
              />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          {image && (
            <img
              src={image}
              alt="Captured"
              className="w-full object-cover aspect-[16/6]"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {streaming ? (
            <Button onClick={capture}>Capture Image</Button>
          ) : (
            <Button onClick={startStream}>Capture Image</Button>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={onFile}
            className="max-w-xs"
          />
          {image && (
            <Button
              variant="outline"
              onClick={() => {
                setImage(null);
                onChange(null);
              }}
            >
              Retake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"school" | "do">("school");
  const [doId, setDoId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login({ username, password, role, doId: role === "do" ? doId : undefined });
    setLoading(false);
    if (ok) {
      toast.success("Welcome back");
      navigate("/");
    } else {
      toast.error("Invalid credentials. Use admin/password for demo.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-4 items-center">
              <RadioGroup value={role} onValueChange={(v)=>setRole(v as any)} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="school" value="school" />
                  <Label htmlFor="school">School Login</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="do" value="do" />
                  <Label htmlFor="do">DO Office Login</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <label className="text-sm">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            </div>
            {role === "do" && (
              <div>
                <label className="text-sm">DO Office ID</label>
                <Input value={doId} onChange={(e)=>setDoId(e.target.value)} placeholder="e.g., DO-123" />
              </div>
            )}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

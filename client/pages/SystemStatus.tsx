import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function SystemStatus() {
  return (
    <AppLayout>
      <div className="grid gap-4">
        <h1 className="text-xl font-semibold">System Status</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connectivity Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-emerald-600">Internet: Connected</div>
              <div className="text-sm text-emerald-600">Cloud Sync: Synchronized</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cloud Sync Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={92} />
              <div className="text-xs text-muted-foreground mt-2">7 files pending upload</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">6</div>
              <div className="text-xs text-muted-foreground">4 online • 2 offline</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Alerts() {
  return (
    <AppLayout>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Parent Alerts</h1>
          <div className="flex gap-2">
            <Button variant="outline">All Types</Button>
            <Button>Apply Filters</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">Absenteeism Alert</CardTitle>
            </CardHeader>
            <CardContent>
              Alice Johnson was absent from her 3rd-period class today. Please contact the school for more details.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Update</CardTitle>
            </CardHeader>
            <CardContent>
              A new system update has been deployed. Expect improved performance and new features.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acknowledgement Pending</CardTitle>
            </CardHeader>
            <CardContent>
              Bob Smith attended all classes today. Please acknowledge this daily attendance summary.
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

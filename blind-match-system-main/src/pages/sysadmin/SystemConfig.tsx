import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SystemConfig() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Environment and infrastructure settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Environment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Base URL</Label>
            <Input defaultValue="https://api.university.ac.uk/pas/v1" disabled />
          </div>
          <div className="space-y-2">
            <Label>Database Connection</Label>
            <Input defaultValue="Server=db.uni.ac.uk;Database=PAS_DB" disabled />
          </div>
          <div className="space-y-2">
            <Label>SMTP Server</Label>
            <Input defaultValue="smtp.university.ac.uk" disabled />
          </div>
          <p className="text-xs text-muted-foreground">These settings are managed by the ASP.NET Core backend and shown here for reference.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Security (RBAC)</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Role-Based Access Control is active with 4 roles: Student, Supervisor, Module Leader, System Admin</p>
          <p>• Students cannot access Supervisor dashboards and vice versa</p>
          <p>• Session timeout: 30 minutes of inactivity</p>
          <p>• Password policy: Minimum 8 characters, 1 uppercase, 1 number</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { PROPOSALS, MATCHES, USERS } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, GitCompare, Users, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Proposals", value: PROPOSALS.length, icon: FileText },
    { label: "Active Matches", value: MATCHES.filter((m) => m.status === "confirmed").length, icon: GitCompare },
    { label: "Students", value: USERS.filter((u) => u.role === "student").length, icon: Users },
    { label: "Supervisors", value: USERS.filter((u) => u.role === "supervisor").length, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Module Leader Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of the project approval system</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="py-6 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

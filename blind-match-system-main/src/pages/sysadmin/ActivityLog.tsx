import { ACTIVITY_LOG, USERS } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: "bg-status-matched/15 text-status-matched",
  PROPOSAL_SUBMITTED: "bg-status-review/15 text-status-review",
  MATCH_CONFIRMED: "bg-accent/15 text-accent",
  RESEARCH_AREA_ADDED: "bg-status-pending/15 text-status-pending",
};

export default function ActivityLog() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">System audit trail</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {ACTIVITY_LOG.map((entry) => {
              const user = USERS.find((u) => u.id === entry.userId);
              return (
                <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{entry.details}</p>
                    <p className="text-xs text-muted-foreground">by {user?.name}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${ACTION_COLORS[entry.action] || ""}`}>
                    {entry.action.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { MATCHES, PROPOSALS, USERS, RESEARCH_AREAS } from "@/data/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, GitCompare } from "lucide-react";

export default function MyMatches() {
  const { user } = useAuth();
  const myMatches = MATCHES.filter((m) => m.supervisorId === user?.id && m.status === "confirmed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">{myMatches.length} confirmed match(es)</p>
      </div>

      {myMatches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <GitCompare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No confirmed matches yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myMatches.map((match) => {
            const proposal = PROPOSALS.find((p) => p.id === match.proposalId);
            const student = USERS.find((u) => u.id === match.studentId);
            const area = proposal ? RESEARCH_AREAS.find((a) => a.id === proposal.researchAreaId) : null;

            if (!proposal || !student) return null;

            return (
              <Card key={match.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                        {student.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{student.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" /> {student.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-muted-foreground">{proposal.projectCode}</p>
                      <p className="text-sm font-medium">{proposal.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">{area?.name}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
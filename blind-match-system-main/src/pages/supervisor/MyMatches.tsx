import { useState, useEffect } from "react";
import { supervisorService, SupervisorMatch } from "@/services/supervisorService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, GitCompare, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function MyMatches() {
  const [matches, setMatches] = useState<SupervisorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);

  useEffect(() => {
    supervisorService
      .getMyMatches()
      .then(setMatches)
      .catch(() => toast.error("Failed to load matches"))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmMatch = async (matchId: number) => {
    setConfirming(matchId);
    try {
      const result = await supervisorService.confirmMatch(matchId);
      toast.success(`Match confirmed! Student: ${result.studentName}`);
      // Update local state — set isRevealed = true and update studentName/email
      setMatches((prev) =>
        prev.map((m) =>
          m.matchId === matchId
            ? { ...m, isRevealed: true, studentName: result.studentName, studentEmail: result.studentEmail }
            : m
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm match");
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">{matches.length} match(es)</p>
      </div>

      {matches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <GitCompare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No matches yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Express interest in proposals from Blind Review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.matchId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{match.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{match.researchArea}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          match.status === "Matched"
                            ? "text-xs bg-status-matched/15 text-status-matched border-status-matched/30"
                            : "text-xs bg-status-review/15 text-status-review border-status-review/30"
                        }
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                  {match.isRevealed && (
                    <Badge className="text-xs bg-status-matched/15 text-status-matched border-status-matched/30" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" /> Identity Revealed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{match.abstractText}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1">
                  {match.techStack.split(",").map((t) => (
                    <Badge key={t.trim()} variant="secondary" className="text-xs font-mono">{t.trim()}</Badge>
                  ))}
                </div>

                {/* Student Info */}
                <div className="p-3 rounded-lg border">
                  {match.isRevealed ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                          {getInitials(match.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{match.studentName}</p>
                        {match.studentEmail && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {match.studentEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">??</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">Student Identity Hidden</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Match button — only shown when not yet revealed */}
                {!match.isRevealed && (
                  <Button
                    className="w-full"
                    onClick={() => handleConfirmMatch(match.matchId)}
                    disabled={confirming === match.matchId}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {confirming === match.matchId ? "Confirming..." : "Confirm Match & Reveal Identity"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useParams, useNavigate } from "react-router-dom";
import { PROPOSALS, RESEARCH_AREAS, USERS } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const proposal = PROPOSALS.find((p) => p.id === id);

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const area = RESEARCH_AREAS.find((a) => a.id === proposal.researchAreaId);
  const supervisor = proposal.supervisorId ? USERS.find((u) => u.id === proposal.supervisorId) : null;

  const statusColor = proposal.status === "pending" ? "hsl(var(--status-pending))" :
    proposal.status === "under_review" ? "hsl(var(--status-review))" : "hsl(var(--status-matched))";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs font-mono text-muted-foreground">{proposal.projectCode}</p>
          <h1 className="text-2xl font-bold text-foreground">{proposal.title}</h1>
        </div>
        <Badge variant="outline" className="border" style={{
          borderColor: statusColor,
          color: statusColor,
          backgroundColor: `${statusColor}15`,
        }}>
          {proposal.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-0">
            {[
              { label: "Submitted", done: true, date: proposal.createdAt },
              { label: "Under Review", done: proposal.status !== "pending" },
              { label: "Matched", done: proposal.status === "matched", date: proposal.matchedAt },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full border-2 ${step.done ? "bg-primary border-primary" : "border-muted-foreground/30"}`} />
                  <span className="text-[10px] text-muted-foreground mt-1 text-center">{step.label}</span>
                  {step.date && <span className="text-[9px] text-muted-foreground">{new Date(step.date).toLocaleDateString()}</span>}
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-2 ${step.done ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Abstract</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{proposal.abstract}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Research Area</CardTitle></CardHeader>
          <CardContent><Badge variant="outline">{area?.name}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tech Stack</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {proposal.techStack.map((t) => <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The Reveal - Supervisor Info */}
      {proposal.status === "matched" && supervisor && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              Assigned Supervisor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                  {supervisor.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{supervisor.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {supervisor.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {proposal.status === "pending" && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">Edit Proposal</Button>
          <Button variant="destructive" className="flex-1">Withdraw</Button>
        </div>
      )}
    </div>
  );
}

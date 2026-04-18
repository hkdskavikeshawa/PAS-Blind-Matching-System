import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { proposalService, BackendProject } from "@/services/proposalService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

type DisplayStatus = "pending" | "under_review" | "matched" | "withdrawn";

const mapStatus = (backendStatus: string): DisplayStatus => {
  switch (backendStatus) {
    case "Under Review": return "under_review";
    case "Matched": return "matched";
    case "Withdrawn": return "withdrawn";
    default: return "pending";
  }
};

const STATUS_STYLES: Record<DisplayStatus, string> = {
  pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  under_review: "bg-status-review/15 text-status-review border-status-review/30",
  matched: "bg-status-matched/15 text-status-matched border-status-matched/30",
  withdrawn: "bg-muted text-muted-foreground border-muted",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  matched: "Matched",
  withdrawn: "Withdrawn",
};

export default function MyProposals() {
  const [proposals, setProposals] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proposalService
      .getMyProposals()
      .then(setProposals)
      .catch(() => toast.error("Failed to load proposals"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your project proposals</p>
        </div>
        <Link to="/student/proposals/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> New Proposal
          </Button>
        </Link>
      </div>

      {proposals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No proposals yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proposals.map((proposal) => {
            const status = mapStatus(proposal.status);
            const techItems = proposal.techStack
              ? proposal.techStack.split(",").map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-muted-foreground">#{proposal.id}</p>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={STATUS_STYLES[status]}>
                      {STATUS_LABELS[status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{proposal.abstract}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {techItems.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs font-mono">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{proposal.researchArea}</Badge>
                    </div>

                    {proposal.isMatched && proposal.supervisorName && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Supervisor</p>
                        <p className="text-sm font-medium text-status-matched">{proposal.supervisorName}</p>
                      </div>
                    )}

                    <Link to={`/student/proposals/${proposal.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Timeline Legend */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Status Timeline</p>
          <div className="flex items-center gap-2">
            {(["pending", "under_review", "matched"] as DisplayStatus[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{
                  backgroundColor: s === "pending" ? "hsl(var(--status-pending))" :
                    s === "under_review" ? "hsl(var(--status-review))" : "hsl(var(--status-matched))"
                }} />
                <span className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</span>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

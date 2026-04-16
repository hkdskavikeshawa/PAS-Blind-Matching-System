import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EyeOff, Check, Eye } from "lucide-react";
import { toast } from "sonner";

interface BlindProposal {
  id: number;
  title: string;
  abstract: string;
  techStack: string;
  status: string;
  researchArea: string;
  researchAreaId: number;
}

export default function BlindReview() {
  const token = localStorage.getItem("blindmatch_token");
  const [proposals, setProposals] = useState<BlindProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<BlindProposal | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/Supervisor/blind-review`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.proposals) {
          setProposals(data.proposals);
        } else {
          setProposals(data);
        }
      } catch (error) {
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProposals();
  }, []);

  const handleExpressInterest = async () => {
    if (!selectedProposal) return;
    setSubmitting(true);

    try {
      const res = await fetch(
        `${API_URL}/api/Supervisor/express-interest/${selectedProposal.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setProposals(proposals.filter((p) => p.id !== selectedProposal.id));
        toast.success("Interest expressed successfully!");
      } else {
        const error = await res.text();
        toast.error(error || "Failed to express interest");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
      setShowConfirmDialog(false);
      setSelectedProposal(null);
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
        <h1 className="text-2xl font-bold text-foreground">Blind Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse anonymous proposals • {proposals.length} available
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No proposals available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Make sure you have selected your research areas in Expertise Management
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base mt-1">{proposal.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {proposal.researchArea}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {proposal.abstract}
                </p>

                <div className="flex flex-wrap gap-1">
                  {proposal.techStack.split(",").map((tech) => (
                    <Badge
                      key={tech.trim()}
                      variant="secondary"
                      className="text-xs font-mono"
                    >
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>

                {/* Identity always hidden - this is the blind part */}
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Student Identity Hidden
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowConfirmDialog(true);
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" /> Express Interest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedProposal && !showConfirmDialog}
        onOpenChange={() => setSelectedProposal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProposal?.title}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline">{selectedProposal?.researchArea}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Abstract</p>
              <p className="text-sm text-muted-foreground">{selectedProposal?.abstract}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Tech Stack</p>
              <div className="flex flex-wrap gap-1">
                {selectedProposal?.techStack.split(",").map((tech) => (
                  <Badge key={tech.trim()} variant="secondary" className="text-xs">
                    {tech.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Student Identity Hidden
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProposal(null)}>
              Close
            </Button>
            <Button onClick={() => setShowConfirmDialog(true)}>
              <Check className="h-3 w-3 mr-1" /> Express Interest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Express Interest Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>
              Are you sure you want to supervise "{selectedProposal?.title}"?
              This will reveal the student's identity once confirmed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedProposal(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleExpressInterest} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm & Reveal Identity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
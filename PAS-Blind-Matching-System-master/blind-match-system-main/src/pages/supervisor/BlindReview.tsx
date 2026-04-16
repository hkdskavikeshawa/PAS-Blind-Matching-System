import { useState } from "react";
import { PROPOSALS, RESEARCH_AREAS, SUPERVISOR_EXPERTISE, USERS } from "@/data/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Check, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Proposal } from "@/types/pas";

export default function BlindReview() {
  const { user } = useAuth();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [confirmedMatches, setConfirmedMatches] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const expertiseAreas = user ? SUPERVISOR_EXPERTISE[user.id] || [] : [];
  const availableProposals = PROPOSALS.filter(
    (p) => p.status !== "matched" && p.status !== "withdrawn" && !confirmedMatches.includes(p.id)
  );

  const handleConfirmMatch = (proposal: Proposal) => {
    setConfirmedMatches([...confirmedMatches, proposal.id]);
    setRevealedId(proposal.id);
    setShowConfirmDialog(false);
    toast.success("Match confirmed! Identity revealed.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Blind Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse anonymous proposals • {availableProposals.length} available
        </p>
      </div>

      {expertiseAreas.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by expertise:</span>
          {expertiseAreas.map((areaId) => {
            const area = RESEARCH_AREAS.find((a) => a.id === areaId);
            return <Badge key={areaId} variant="outline" className="text-xs">{area?.name}</Badge>;
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {availableProposals.map((proposal) => {
          const area = RESEARCH_AREAS.find((a) => a.id === proposal.researchAreaId);
          const student = USERS.find((u) => u.id === proposal.studentId);
          const isRevealed = revealedId === proposal.id;

          return (
            <Card key={proposal.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{proposal.projectCode}</p>
                    <CardTitle className="text-base mt-1">{proposal.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">{area?.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{proposal.abstract}</p>

                <div className="flex flex-wrap gap-1">
                  {proposal.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs font-mono">{tech}</Badge>
                  ))}
                </div>

                {/* Identity Section */}
                <AnimatePresence mode="wait">
                  {isRevealed && student ? (
                    <motion.div
                      key="revealed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="p-3 rounded-lg border border-accent/30 bg-accent/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                          <User className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hidden"
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3 rounded-lg bg-blind"
                    >
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">Identity Hidden</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isRevealed && (
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
                      onClick={() => { setSelectedProposal(proposal); setShowConfirmDialog(true); }}
                    >
                      <Check className="h-3 w-3 mr-1" /> Express Interest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirm Match Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to supervise "{selectedProposal?.title}"? This will reveal the student's identity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedProposal && handleConfirmMatch(selectedProposal)}>
              Confirm & Reveal Identity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { proposalService, BackendProjectDetail, BackendResearchArea } from "@/services/proposalService";
import { TECH_STACK_OPTIONS } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Mail, User, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const mapStatusColor = (status: string) => {
  switch (status) {
    case "Under Review": return "hsl(var(--status-review))";
    case "Matched": return "hsl(var(--status-matched))";
    default: return "hsl(var(--status-pending))";
  }
};

const mapStatusLabel = (status: string) => {
  switch (status) {
    case "Under Review": return "Under Review";
    case "Matched": return "Matched";
    default: return "Pending";
  }
};

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = parseInt(id ?? "0");

  const [proposal, setProposal] = useState<BackendProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAbstract, setEditAbstract] = useState("");
  const [editResearchArea, setEditResearchArea] = useState("");
  const [editTechStack, setEditTechStack] = useState<string[]>([]);
  const [researchAreas, setResearchAreas] = useState<BackendResearchArea[]>([]);
  const [saving, setSaving] = useState(false);

  // Withdraw state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!numericId) { setNotFound(true); setLoading(false); return; }
    proposalService
      .getProposal(numericId)
      .then((data) => setProposal(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    proposalService.getResearchAreas().then(setResearchAreas).catch(() => {});
  }, [numericId]);

  const openEdit = () => {
    if (!proposal) return;
    setEditTitle(proposal.title);
    setEditAbstract(proposal.abstract);
    setEditTechStack(proposal.techStack ? proposal.techStack.split(",").map((t) => t.trim()).filter(Boolean) : []);
    setEditResearchArea(""); // will be re-selected by user; we can't map name→id without extra lookup
    // Try to match the research area name to ID
    const matched = researchAreas.find((a) => a.name === proposal.researchArea);
    if (matched) setEditResearchArea(String(matched.id));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editTitle || !editAbstract || !editResearchArea || editTechStack.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await proposalService.updateProposal(numericId, {
        title: editTitle,
        abstract: editAbstract,
        techStack: editTechStack,
        researchAreaId: parseInt(editResearchArea),
      });
      toast.success("Proposal updated successfully!");
      setEditOpen(false);
      // Refresh proposal data
      const updated = await proposalService.getProposal(numericId);
      setProposal(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await proposalService.withdrawProposal(numericId);
      toast.success("Proposal withdrawn successfully");
      navigate("/student/proposals");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to withdraw proposal");
      setWithdrawOpen(false);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const statusColor = mapStatusColor(proposal.status);
  const statusLabel = mapStatusLabel(proposal.status);
  const techItems = proposal.techStack
    ? proposal.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs font-mono text-muted-foreground">Proposal #{proposal.id}</p>
          <h1 className="text-2xl font-bold text-foreground">{proposal.title}</h1>
        </div>
        <Badge variant="outline" className="border" style={{
          borderColor: statusColor,
          color: statusColor,
          backgroundColor: `${statusColor}15`,
        }}>
          {statusLabel}
        </Badge>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-0">
            {[
              { label: "Submitted", done: true },
              { label: "Under Review", done: proposal.status === "Under Review" || proposal.status === "Matched" },
              { label: "Matched", done: proposal.status === "Matched" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full border-2 ${step.done ? "bg-primary border-primary" : "border-muted-foreground/30"}`} />
                  <span className="text-[10px] text-muted-foreground mt-1 text-center">{step.label}</span>
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
          <CardContent><Badge variant="outline">{proposal.researchArea}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tech Stack</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techItems.map((t) => (
                <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supervisor Reveal Card */}
      {proposal.isMatched && proposal.isRevealed && proposal.supervisor && (
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
                  {getInitials(proposal.supervisor.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{proposal.supervisor.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {proposal.supervisor.email}
                </div>
                {proposal.supervisor.phone && (
                  <p className="text-sm text-muted-foreground">{proposal.supervisor.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending actions */}
      {proposal.status === "Pending" && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={openEdit}>Edit Proposal</Button>
          <Button variant="destructive" className="flex-1" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
            <DialogDescription>Update your project details. Only available while the proposal is Pending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Abstract</Label>
              <Textarea rows={5} value={editAbstract} onChange={(e) => setEditAbstract(e.target.value)} />
              <p className="text-xs text-muted-foreground">{editAbstract.length}/1000</p>
            </div>
            <div className="space-y-2">
              <Label>Research Area</Label>
              <Select value={editResearchArea} onValueChange={setEditResearchArea}>
                <SelectTrigger><SelectValue placeholder="Select a research area" /></SelectTrigger>
                <SelectContent>
                  {researchAreas.map((area) => (
                    <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tech Stack</Label>
              <Select onValueChange={(t) => { if (!editTechStack.includes(t)) setEditTechStack([...editTechStack, t]); }}>
                <SelectTrigger><SelectValue placeholder="Add technologies..." /></SelectTrigger>
                <SelectContent>
                  {TECH_STACK_OPTIONS.filter((t) => !editTechStack.includes(t)).map((tech) => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editTechStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editTechStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono text-xs gap-1">
                      {tech}
                      <button type="button" onClick={() => setEditTechStack(editTechStack.filter((t) => t !== tech))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw "{proposal.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)} disabled={withdrawing}>Cancel</Button>
            <Button variant="destructive" onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

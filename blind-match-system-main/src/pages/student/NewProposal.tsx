import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TECH_STACK_OPTIONS } from "@/data/mock-data";
import { proposalService, BackendResearchArea } from "@/services/proposalService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [researchAreas, setResearchAreas] = useState<BackendResearchArea[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    proposalService.getResearchAreas().then(setResearchAreas).catch(() => {
      toast.error("Failed to load research areas");
    });
  }, []);

  const addTech = (tech: string) => {
    if (!selectedTech.includes(tech)) setSelectedTech([...selectedTech, tech]);
  };

  const removeTech = (tech: string) => {
    setSelectedTech(selectedTech.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || !researchArea || selectedTech.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await proposalService.createProposal({
        title,
        abstract,
        techStack: selectedTech,
        researchAreaId: parseInt(researchArea),
      });
      toast.success("Proposal submitted successfully!");
      navigate("/student/proposals");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Proposal</h1>
          <p className="text-sm text-muted-foreground">Submit a new project proposal for review</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="e.g. AI-Powered Student Attendance System" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea id="abstract" placeholder="Describe your project idea, objectives, and expected outcomes..." rows={6} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
              <p className="text-xs text-muted-foreground">{abstract.length}/1000 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Research Area</Label>
              <Select value={researchArea} onValueChange={setResearchArea}>
                <SelectTrigger><SelectValue placeholder="Select a research area" /></SelectTrigger>
                <SelectContent>
                  {researchAreas.map((area) => (
                    <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Technical Stack</Label>
              <Select onValueChange={addTech}>
                <SelectTrigger><SelectValue placeholder="Add technologies..." /></SelectTrigger>
                <SelectContent>
                  {TECH_STACK_OPTIONS.filter((t) => !selectedTech.includes(t)).map((tech) => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedTech.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono text-xs gap-1">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Proposal"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

import { useState } from "react";
import { RESEARCH_AREAS as initialAreas } from "@/data/mock-data";
import { ResearchArea } from "@/types/pas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ResearchAreas() {
  const [areas, setAreas] = useState<ResearchArea[]>(initialAreas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ResearchArea | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openNew = () => { setEditing(null); setName(""); setDescription(""); setDialogOpen(true); };
  const openEdit = (a: ResearchArea) => { setEditing(a); setName(a.name); setDescription(a.description || ""); setDialogOpen(true); };

  const save = () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      setAreas(areas.map((a) => a.id === editing.id ? { ...a, name, description } : a));
      toast.success("Research area updated");
    } else {
      setAreas([...areas, { id: `ra${Date.now()}`, name, description }]);
      toast.success("Research area added");
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => { setAreas(areas.filter((a) => a.id !== id)); toast.success("Research area removed"); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Areas</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage available research area tags</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Area</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {areas.map((area) => (
          <Card key={area.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{area.name}</p>
                {area.description && <p className="text-xs text-muted-foreground">{area.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(area)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(area.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Research Area</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

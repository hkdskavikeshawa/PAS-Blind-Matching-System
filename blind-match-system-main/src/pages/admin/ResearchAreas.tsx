import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Interface matching the Backend Model
interface ResearchArea {
  id: number;
  name: string;
  description: string;
}

export default function ResearchAreas() {
  const [categories, setCategories] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ResearchArea | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Backend API URL - Verify if your port is 5047
  const API_URL = "http://localhost:5010/api/ResearchArea";

  // 1. Fetch Data
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ResearchArea[]>(API_URL);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load research areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNew = () => { 
    setEditing(null); 
    setName(""); 
    setDescription(""); 
    setDialogOpen(true); 
  };

  const openEdit = (a: ResearchArea) => { 
    setEditing(a); 
    setName(a.name); 
    setDescription(a.description || ""); 
    setDialogOpen(true); 
  };

  // 2. Save/Update Data
   const save = async () => {
  if (!name.trim()) { toast.error("Name is required"); return; }

  try {
    const categoryData = { 
      id: editing ? editing.id : 0, 
      name: name, 
      description: description 
    };

    if (editing) {
      
      await axios.put(`http://localhost:5010/api/ResearchArea/${editing.id}`, categoryData);
      toast.success("Research area updated");
    } else {
      await axios.post("http://localhost:5010/api/ResearchArea", categoryData);
      toast.success("Research area added");
    }
    
    setDialogOpen(false);
    fetchCategories(); 
  } catch (error) {
    toast.error("Failed to save");
  }
};  

  // 3. Delete Data
  const remove = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        if (response.status === 200) {
          toast.success("Research area removed");
          fetchCategories();
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Areas</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage available research area tags</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Area</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading research areas...</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.length > 0 ? (
            categories.map((area) => (
              <Card key={area.id} className="hover:bg-muted/50 transition-colors">
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
            ))
          ) : (
            <p className="col-span-2 text-center py-10 text-muted-foreground">No research areas found.</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Research Area</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Artificial Intelligence" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
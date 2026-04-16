import { useState } from "react";
import { RESEARCH_AREAS, SUPERVISOR_EXPERTISE } from "@/data/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ExpertiseManagement() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(
    user ? SUPERVISOR_EXPERTISE[user.id] || [] : []
  );

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setSelected(next);
    toast.success("Expertise updated");
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expertise Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Select your preferred research areas to filter proposals</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Research Areas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {RESEARCH_AREAS.map((area) => (
            <label key={area.id} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox checked={selected.includes(area.id)} onCheckedChange={() => toggle(area.id)} />
              <div>
                <p className="text-sm font-medium">{area.name}</p>
                {area.description && <p className="text-xs text-muted-foreground">{area.description}</p>}
              </div>
              {selected.includes(area.id) && <Badge className="ml-auto text-xs">Active</Badge>}
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

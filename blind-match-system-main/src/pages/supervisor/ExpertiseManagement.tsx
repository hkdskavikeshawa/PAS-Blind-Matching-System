import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ResearchArea {
  id: number;
  name: string;
}

interface Preference {
  id: number;
  researchAreaId: number;
  researchAreaName: string;
}

export default function ExpertiseManagement() {
  const token = localStorage.getItem("blindmatch_token");
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasRes = await fetch(`${API_URL}/api/Supervisor/research-areas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const areasData = await areasRes.json();
        setResearchAreas(areasData);

        const prefsRes = await fetch(`${API_URL}/api/Supervisor/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prefsData = await prefsRes.json();
        setPreferences(prefsData);
      } catch (error) {
        toast.error("Failed to load research areas");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, []);

  const isSelected = (areaId: number) => {
    return preferences.some((p) => p.researchAreaId === areaId);
  };

  const toggle = async (areaId: number) => {
    if (isSelected(areaId)) {
      try {
        const res = await fetch(`${API_URL}/api/Supervisor/preferences/${areaId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setPreferences(preferences.filter((p) => p.researchAreaId !== areaId));
          toast.success("Research area removed");
        } else {
          toast.error("Failed to remove research area");
        }
      } catch {
        toast.error("Something went wrong");
      }
    } else {
      try {
        const res = await fetch(`${API_URL}/api/Supervisor/preferences/${areaId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const newPref = await res.json();
          setPreferences([...preferences, newPref]);
          toast.success("Research area added");
        } else {
          toast.error("Failed to add research area");
        }
      } catch {
        toast.error("Something went wrong");
      }
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
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expertise Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select your preferred research areas to filter proposals
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Research Areas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {researchAreas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No research areas available yet.
            </p>
          ) : (
            researchAreas.map((area) => (
              <label
                key={area.id}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={isSelected(area.id)}
                  onCheckedChange={() => toggle(area.id)}
                />
                <div>
                  <p className="text-sm font-medium">{area.name}</p>
                </div>
                {isSelected(area.id) && (
                  <Badge className="ml-auto text-xs">Active</Badge>
                )}
              </label>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
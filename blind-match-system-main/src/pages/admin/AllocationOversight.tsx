import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, FileText, Users, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: number;
  code: string;
  title: string;
  studentName: string;
  area: string;
  status: string;
  supervisor: string;
}

export default function AllocationOversight() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [suitableSupervisors, setSuitableSupervisors] = useState<any[]>([]);

  // 1. Fetch all projects from the database
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5010/api/Project");
      setProjects(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // 2. Load supervisors specific to a research area when the dropdown is clicked
  const loadSupervisors = async (areaName: string) => {
    try {
      const response = await axios.get(`http://localhost:5010/api/Project/suitable-supervisors-by-name?areaName=${areaName}`);
      setSuitableSupervisors(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading supervisors");
    }
  };

  // 3. Function to handle the reassignment of a supervisor to a project
  const handleReassign = async (projectId: number, supervisorId: string) => {
    try {
      const response = await axios.put("http://localhost:5010/api/Project/reassign", {
        projectId: projectId,
        supervisorId: supervisorId
      });

      if (response.status === 200) {
        toast.success("Supervisor reassigned successfully!");
        fetchProjects(); // Refresh the data to update the table
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reassign supervisor");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase().replace(" ", "_");
    switch (s) {
      case "pending":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "under_review":
      case "under review":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "matched":
        return "bg-emerald-100 text-emerald-600 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Loading allocations...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Allocation Oversight</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all project-supervisor allocations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="py-4 flex items-center gap-3">
          <FileText className="text-blue-500" /> <div><p className="text-2xl font-bold">{projects.length}</p><p className="text-xs text-muted-foreground">Total Proposals</p></div>
        </CardContent></Card>
        <Card><CardContent className="py-4 flex items-center gap-3">
          <BarChart3 className="text-orange-500" /> <div><p className="text-2xl font-bold">{projects.filter(p=>p.status.toLowerCase()==="pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
        </CardContent></Card>
        <Card><CardContent className="py-4 flex items-center gap-3">
          <Users className="text-blue-500" /> <div><p className="text-2xl font-bold">{projects.filter(p=>p.status.toLowerCase().includes("review")).length}</p><p className="text-xs text-muted-foreground">Under Review</p></div>
        </CardContent></Card>
        <Card><CardContent className="py-4 flex items-center gap-3">
          <GitCompare className="text-emerald-500" /> <div><p className="text-2xl font-bold">{projects.filter(p=>p.status.toLowerCase()==="matched").length}</p><p className="text-xs text-muted-foreground">Matched</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Proposals</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead className="w-[180px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.code}</TableCell>
                  <TableCell className="font-medium text-sm">{p.title}</TableCell>
                  <TableCell className="text-sm">{p.studentName}</TableCell>
                  <TableCell><Badge variant="outline" className="font-normal">{p.area}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`shadow-none font-medium px-2.5 py-0.5 rounded-full border ${getStatusStyles(p.status)}`}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.supervisor}</TableCell>
                  <TableCell>
                    {/* Only display the Reassign dropdown if the status is 'matched' */}
                    {p.status.toLowerCase() === "matched" ? (
                      <Select 
                        onOpenChange={(open) => open && loadSupervisors(p.area)}
                        onValueChange={(value) => handleReassign(p.id, value)}
                      >
                        <SelectTrigger className="h-8 w-full text-xs">
                          <SelectValue placeholder="Reassign..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suitableSupervisors.length > 0 ? (
                            suitableSupervisors.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))
                          ) : (
                            <div className="text-[10px] p-2 text-muted-foreground text-center italic">
                              No alternative supervisors for this area
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground italic ml-2">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
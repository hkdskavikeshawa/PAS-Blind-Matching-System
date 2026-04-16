import { MATCHES, PROPOSALS, USERS, RESEARCH_AREAS } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, FileText, Users, BarChart3 } from "lucide-react";

export default function AllocationOversight() {
  const totalProposals = PROPOSALS.length;
  const matched = PROPOSALS.filter((p) => p.status === "matched").length;
  const pending = PROPOSALS.filter((p) => p.status === "pending").length;
  const underReview = PROPOSALS.filter((p) => p.status === "under_review").length;

  const supervisors = USERS.filter((u) => u.role === "supervisor");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Allocation Oversight</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all project-supervisor allocations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Proposals", value: totalProposals, icon: FileText },
          { label: "Pending", value: pending, icon: BarChart3 },
          { label: "Under Review", value: underReview, icon: Users },
          { label: "Matched", value: matched, icon: GitCompare },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROPOSALS.map((proposal) => {
                const student = USERS.find((u) => u.id === proposal.studentId);
                const supervisor = proposal.supervisorId ? USERS.find((u) => u.id === proposal.supervisorId) : null;
                const area = RESEARCH_AREAS.find((a) => a.id === proposal.researchAreaId);
                const statusColor = proposal.status === "pending" ? "status-pending" :
                  proposal.status === "under_review" ? "status-review" : "status-matched";

                return (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-mono text-xs">{proposal.projectCode}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{proposal.title}</TableCell>
                    <TableCell className="text-sm">{student?.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{area?.name}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs bg-${statusColor}/15 text-${statusColor} border-${statusColor}/30`}>
                        {proposal.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{supervisor?.name || "—"}</TableCell>
                    <TableCell>
                      {proposal.status === "matched" && (
                        <Select>
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue placeholder="Reassign..." />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { USERS } from "@/data/mock-data";
import { UserRole } from "@/types/pas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield } from "lucide-react";

const ROLE_COLORS: Record<UserRole, string> = {
  student: "bg-status-pending/15 text-status-pending",
  supervisor: "bg-status-review/15 text-status-review",
  module_leader: "bg-status-matched/15 text-status-matched",
  system_admin: "bg-accent/15 text-accent",
};

export default function SysAdminUsers() {
  const byRole = (role: UserRole) => USERS.filter((u) => u.role === role).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all accounts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["student", "supervisor", "module_leader", "system_admin"] as UserRole[]).map((role) => (
          <Card key={role}>
            <CardContent className="py-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xl font-bold">{byRole(role)}</p>
                <p className="text-xs text-muted-foreground capitalize">{role.replace("_", " ")}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{u.avatarInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${ROLE_COLORS[u.role]}`}>
                      {u.role.replace("_", " ")}
                    </Badge>
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

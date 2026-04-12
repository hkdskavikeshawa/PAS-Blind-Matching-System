import { useState } from "react";
import { USERS as initialUsers } from "@/data/mock-data";
import { User, UserRole } from "@/types/pas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS: Record<UserRole, string> = {
  student: "bg-status-pending/15 text-status-pending",
  supervisor: "bg-status-review/15 text-status-review",
  module_leader: "bg-status-matched/15 text-status-matched",
  system_admin: "bg-accent/15 text-accent",
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const create = () => {
    if (!name || !email) { toast.error("All fields required"); return; }
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    setUsers([...users, { id: `u${Date.now()}`, name, email, role, avatarInitials: initials }]);
    setDialogOpen(false);
    toast.success("User created");
  };

  const remove = (id: string) => { setUsers(users.filter((u) => u.id !== id)); toast.success("User removed"); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage user accounts</p>
        </div>
        <Button onClick={() => { setName(""); setEmail(""); setRole("student"); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{u.avatarInitials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${ROLE_COLORS[u.role]}`}>
                      {u.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(u.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="module_leader">Module Leader</SelectItem>
                  <SelectItem value="system_admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={create}>Create User</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// User structure returned by the Backend
interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  role: string;
}

const ROLE_COLORS: Record<string, string> = {
  student: "bg-status-pending/15 text-status-pending",
  supervisor: "bg-status-review/15 text-status-review",
  module_leader: "bg-status-matched/15 text-status-matched",
  system_admin: "bg-accent/15 text-accent",
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");

  // API URL Configuration
  const BASE_URL = "http://localhost:5047/api/admin";
  const API_URL = `${BASE_URL}/users`;
  const ADD_USER_URL = `${BASE_URL}/add-user`;

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch Users from the Database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<User[]>(API_URL, { headers: getAuthHeader() });
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Add a new User to the Database
  const create = async () => {
    if (!name || !email) {
      toast.error("All fields required");
      return;
    }

    try {
      const newUser = {
        fullName: name,
        email: email,
        password: "DefaultPassword123!",
        role: role
      };

      const response = await axios.post(ADD_USER_URL, newUser, { headers: getAuthHeader() });

      if (response.status === 200) {
        toast.success("User created successfully!");
        setDialogOpen(false);
        setName("");
        setEmail("");
        setRole("student");
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMsg = error.response?.data?.[0]?.description || "Failed to create user";
      toast.error(errorMsg);
    }
  };

  // 3. Remove a User (Delete Function)
  const remove = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Calling the delete-user/{id} endpoint on the Backend
        const response = await axios.delete(`${BASE_URL}/delete-user/${id}`, { 
          headers: getAuthHeader() 
        });

        if (response.status === 200) {
          toast.success("User deleted successfully!");
          // Refresh fetchUsers() to remove the user from the Table
          fetchUsers();
        }
      } catch (error: any) {
        console.error("Delete error:", error);
        toast.error("Failed to delete user. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user accounts directly from SQL Database</p>
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
                <TableHead className="px-4">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm mt-2">Connecting to Server...</p>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {u.fullName?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${ROLE_COLORS[u.role.toLowerCase()] || ""}`}>
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:bg-destructive/10" 
                        onClick={() => remove(u.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No users found in database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@blindmatch.com" />
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="module_leader">Module Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * New users will be created with default password: DefaultPassword123!
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create User Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
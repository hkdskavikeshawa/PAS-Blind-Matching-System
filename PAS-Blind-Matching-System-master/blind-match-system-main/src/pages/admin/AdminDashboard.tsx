import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, GitCompare, Users, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Interface for the data structure returned by the Backend
interface DashboardStats {
  proposals: number;
  activeMatches: number;
  students: number;
  supervisors: number;
  researchAreas: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // API URL (Configured for Backend Port 5047)
  const STATS_URL = "http://localhost:5047/api/Dashboard/stats";

  // Function to fetch data from the Database
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get<DashboardStats>(STATS_URL);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Screen to display during the Loading state
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Dashboard Data...</span>
      </div>
    );
  }

  // Prepare data to be displayed in the Stat Cards
  const statCards = [
    { 
      label: "Total Proposals", 
      value: stats?.proposals || 0, 
      icon: FileText,
      color: "text-blue-500"
    },
    { 
      label: "Active Matches", 
      value: stats?.activeMatches || 0, 
      icon: GitCompare,
      color: "text-purple-500"
    },
    { 
      label: "Students", 
      value: stats?.students || 0, 
      icon: GraduationCap, // GraduationCap is more suitable for Students
      color: "text-orange-500"
    },
    { 
      label: "Supervisors", 
      value: stats?.supervisors || 0, 
      icon: Users,
      color: "text-green-500"
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Module Leader Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview from the database
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="py-6 flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Displaying the number of Research Areas at the bottom */}
      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-sm text-primary font-medium text-center">
          Currently managing <strong>{stats?.researchAreas || 0}</strong> active research areas.
        </p>
      </div>
    </div>
  );
}
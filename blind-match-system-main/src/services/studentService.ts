import { authService } from "@/services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: object
) => {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (typeof data === "string") throw new Error(data);
    throw new Error(JSON.stringify(data));
  }

  return data;
};

export interface ProjectStatus {
  status: string;
  isMatched: boolean;
  supervisorName?: string | null;
  supervisorEmail?: string | null;
}

export const studentService = {
  async getProjectStatus(id: number): Promise<ProjectStatus> {
    return (await apiCall(`/api/student/projects/${id}/status`)) as ProjectStatus;
  },
};

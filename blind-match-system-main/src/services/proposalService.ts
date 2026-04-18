import { authService } from "@/services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: object,
  requiresAuth: boolean = true
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = authService.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

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

export interface BackendProject {
  id: number;
  title: string;
  abstract: string;
  techStack: string;
  status: string;
  researchArea: string;
  isMatched: boolean;
  supervisorName?: string | null;
  supervisorEmail?: string | null;
}

export interface BackendProjectDetail {
  id: number;
  title: string;
  abstract: string;
  techStack: string;
  status: string;
  researchArea: string;
  isMatched: boolean;
  isRevealed: boolean;
  supervisor?: {
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export interface BackendResearchArea {
  id: number;
  name: string;
  description?: string;
}

export interface CreateProposalData {
  title: string;
  abstract: string;
  techStack: string[];
  researchAreaId: number;
}

export const proposalService = {
  async getResearchAreas(): Promise<BackendResearchArea[]> {
    return (await apiCall("/api/researcharea", "GET", undefined, false)) as BackendResearchArea[];
  },

  async getMyProposals(): Promise<BackendProject[]> {
    return (await apiCall("/api/student/my-projects")) as BackendProject[];
  },

  async getProposal(id: number): Promise<BackendProjectDetail> {
    return (await apiCall(`/api/student/projects/${id}`)) as BackendProjectDetail;
  },

  async createProposal(data: CreateProposalData): Promise<{ message: string; projectId: number }> {
    return (await apiCall("/api/student/projects", "POST", {
      title: data.title,
      abstract: data.abstract,
      techStack: data.techStack.join(","),
      researchAreaId: data.researchAreaId,
    })) as { message: string; projectId: number };
  },

  async updateProposal(
    id: number,
    data: CreateProposalData
  ): Promise<{ message: string }> {
    return (await apiCall(`/api/student/projects/${id}`, "POST", {
      title: data.title,
      abstract: data.abstract,
      techStack: data.techStack.join(","),
      researchAreaId: data.researchAreaId,
    })) as { message: string };
  },

  async withdrawProposal(id: number): Promise<{ message: string }> {
    return (await apiCall(`/api/student/projects/${id}`, "DELETE")) as { message: string };
  },
};

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

export interface BlindProposal {
  id: number;
  title: string;
  abstract: string;
  techStack: string;
  status: string;
  researchArea: string;
  researchAreaId: number;
}

export interface SupervisorMatch {
  matchId: number;
  projectId: number;
  title: string;
  abstractText: string;
  techStack: string;
  status: string;
  researchArea: string;
  isRevealed: boolean;
  createdAt: string;
  studentName: string;
  studentEmail?: string | null;
}

export interface ResearchArea {
  id: number;
  name: string;
}

export interface Preference {
  id: number;
  researchAreaId: number;
  researchAreaName: string;
}

export const supervisorService = {
  async getBlindReviewProposals(): Promise<BlindProposal[]> {
    const data = await apiCall("/api/supervisor/blind-review");
    // Backend returns either an array directly, or { message, proposals: [] }
    if (Array.isArray(data)) return data as BlindProposal[];
    const shaped = data as { proposals?: BlindProposal[] };
    return shaped.proposals ?? [];
  },

  async expressInterest(projectId: number): Promise<{ message: string; matchId: number }> {
    return (await apiCall(
      `/api/supervisor/express-interest/${projectId}`,
      "POST"
    )) as { message: string; matchId: number };
  },

  async getMyMatches(): Promise<SupervisorMatch[]> {
    return (await apiCall("/api/supervisor/my-matches")) as SupervisorMatch[];
  },

  async confirmMatch(matchId: number): Promise<{ message: string; studentName: string; studentEmail: string }> {
    return (await apiCall(
      `/api/supervisor/confirm-match/${matchId}`,
      "POST"
    )) as { message: string; studentName: string; studentEmail: string };
  },

  async getResearchAreas(): Promise<ResearchArea[]> {
    return (await apiCall("/api/supervisor/research-areas")) as ResearchArea[];
  },

  async getPreferences(): Promise<Preference[]> {
    return (await apiCall("/api/supervisor/preferences")) as Preference[];
  },

  async addPreference(areaId: number): Promise<Preference> {
    return (await apiCall(
      `/api/supervisor/preferences/${areaId}`,
      "POST"
    )) as Preference;
  },

  async removePreference(areaId: number): Promise<void> {
    await apiCall(`/api/supervisor/preferences/${areaId}`, "DELETE");
  },
};

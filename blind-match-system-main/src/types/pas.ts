export type UserRole = "student" | "supervisor" | "module_leader" | "system_admin";

export type ProposalStatus = "pending" | "under_review" | "matched" | "withdrawn";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export interface ResearchArea {
  id: string;
  name: string;
  description?: string;
}

export interface Proposal {
  id: string;
  projectCode: string;
  title: string;
  abstract: string;
  techStack: string[];
  researchAreaId: string;
  status: ProposalStatus;
  studentId: string;
  supervisorId?: string;
  createdAt: string;
  matchedAt?: string;
}

export interface Match {
  id: string;
  proposalId: string;
  studentId: string;
  supervisorId: string;
  status: "interested" | "confirmed";
  createdAt: string;
  confirmedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

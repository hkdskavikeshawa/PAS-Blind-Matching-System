import { User, ResearchArea, Proposal, Match, ActivityLogEntry } from "@/types/pas";

export const RESEARCH_AREAS: ResearchArea[] = [
  { id: "ra1", name: "Artificial Intelligence", description: "Machine learning, NLP, computer vision" },
  { id: "ra2", name: "Web Development", description: "Full-stack, frontend frameworks, APIs" },
  { id: "ra3", name: "Cybersecurity", description: "Network security, cryptography, ethical hacking" },
  { id: "ra4", name: "Cloud Computing", description: "AWS, Azure, serverless architectures" },
  { id: "ra5", name: "Data Science", description: "Big data, analytics, visualization" },
  { id: "ra6", name: "Mobile Development", description: "iOS, Android, cross-platform" },
  { id: "ra7", name: "IoT", description: "Embedded systems, sensor networks" },
  { id: "ra8", name: "Machine Learning", description: "Deep learning, reinforcement learning" },
];

export const USERS: User[] = [
  { id: "s1", name: "Alice Johnson", email: "alice.j@uni.ac.uk", role: "student", avatarInitials: "AJ" },
  { id: "s2", name: "Bob Smith", email: "bob.s@uni.ac.uk", role: "student", avatarInitials: "BS" },
  { id: "s3", name: "Charlie Davis", email: "charlie.d@uni.ac.uk", role: "student", avatarInitials: "CD" },
  { id: "s4", name: "Diana Evans", email: "diana.e@uni.ac.uk", role: "student", avatarInitials: "DE" },
  { id: "sv1", name: "Dr. Sarah Williams", email: "s.williams@uni.ac.uk", role: "supervisor", avatarInitials: "SW" },
  { id: "sv2", name: "Prof. James Brown", email: "j.brown@uni.ac.uk", role: "supervisor", avatarInitials: "JB" },
  { id: "sv3", name: "Dr. Emily Clark", email: "e.clark@uni.ac.uk", role: "supervisor", avatarInitials: "EC" },
  { id: "ml1", name: "Dr. Richard Moore", email: "r.moore@uni.ac.uk", role: "module_leader", avatarInitials: "RM" },
  { id: "sa1", name: "Admin User", email: "admin@uni.ac.uk", role: "system_admin", avatarInitials: "AU" },
];

export const TECH_STACK_OPTIONS = [
  "React", "Angular", "Vue.js", "Node.js", "ASP.NET Core", "Python", "Flask", "Django",
  "TensorFlow", "PyTorch", "SQL Server", "PostgreSQL", "MongoDB", "Docker", "Kubernetes",
  "AWS", "Azure", "Firebase", "Swift", "Kotlin", "Flutter", "React Native",
];

export const PROPOSALS: Proposal[] = [
  {
    id: "p1", projectCode: "PAS-2026-001", title: "AI-Powered Student Attendance System",
    abstract: "This project proposes developing an intelligent attendance tracking system using facial recognition and machine learning. The system will automatically identify students entering a lecture hall and mark their attendance in real-time, reducing manual effort and increasing accuracy.",
    techStack: ["Python", "TensorFlow", "Flask", "PostgreSQL"],
    researchAreaId: "ra1", status: "pending", studentId: "s1", createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "p2", projectCode: "PAS-2026-002", title: "Secure E-Voting Platform for University Elections",
    abstract: "A blockchain-based electronic voting system designed for university student union elections. The platform ensures vote integrity through cryptographic hashing, provides voter anonymity, and offers real-time result tabulation with an immutable audit trail.",
    techStack: ["ASP.NET Core", "SQL Server", "React", "Docker"],
    researchAreaId: "ra3", status: "under_review", studentId: "s2", createdAt: "2026-01-20T14:30:00Z",
  },
  {
    id: "p3", projectCode: "PAS-2026-003", title: "Cloud-Native Microservices for Library Management",
    abstract: "This project aims to redesign the university library management system using a microservices architecture deployed on AWS. It will feature book cataloguing, reservation management, fine tracking, and integration with the university SSO system.",
    techStack: ["Node.js", "AWS", "Docker", "Kubernetes", "MongoDB"],
    researchAreaId: "ra4", status: "matched", studentId: "s3", supervisorId: "sv1",
    createdAt: "2026-01-10T09:00:00Z", matchedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "p4", projectCode: "PAS-2026-004", title: "IoT-Based Smart Campus Energy Monitor",
    abstract: "Development of an IoT sensor network to monitor energy consumption across campus buildings. The system will collect real-time data from smart meters, analyze usage patterns using machine learning, and provide actionable insights through a web dashboard.",
    techStack: ["Python", "Flask", "React", "PostgreSQL", "AWS"],
    researchAreaId: "ra7", status: "pending", studentId: "s4", createdAt: "2026-02-05T16:00:00Z",
  },
];

export const MATCHES: Match[] = [
  {
    id: "m1", proposalId: "p3", studentId: "s3", supervisorId: "sv1",
    status: "confirmed", createdAt: "2026-01-28T10:00:00Z", confirmedAt: "2026-02-01T11:00:00Z",
  },
];

export const SUPERVISOR_EXPERTISE: Record<string, string[]> = {
  sv1: ["ra4", "ra2"],
  sv2: ["ra1", "ra8", "ra5"],
  sv3: ["ra3", "ra6"],
};

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: "al1", action: "USER_CREATED", userId: "sa1", details: "Created student account for Alice Johnson", timestamp: "2026-01-10T08:00:00Z" },
  { id: "al2", action: "PROPOSAL_SUBMITTED", userId: "s1", details: "Proposal PAS-2026-001 submitted", timestamp: "2026-01-15T10:00:00Z" },
  { id: "al3", action: "MATCH_CONFIRMED", userId: "sv1", details: "Match confirmed for PAS-2026-003", timestamp: "2026-02-01T11:00:00Z" },
  { id: "al4", action: "RESEARCH_AREA_ADDED", userId: "ml1", details: "Added research area: IoT", timestamp: "2026-01-05T09:00:00Z" },
  { id: "al5", action: "PROPOSAL_SUBMITTED", userId: "s2", details: "Proposal PAS-2026-002 submitted", timestamp: "2026-01-20T14:30:00Z" },
];

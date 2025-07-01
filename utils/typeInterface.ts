export interface Result {
  email: string;
  result: string;
  positions: string[];
}
export interface User {
  email: string;
  role: string;
  status: string;
}
export interface PersonalInfo {
  name: string;
  nickname: string;
  mobile: string;
  address: string;
  dob: string; // ISO date string
  bloodType: string;
  lineId: string;
  university: string;
  qualification: string;
  major: string;
  gpa: number;
  reason: string;
  otherReason: string;
  strength: string;
  weakness: string;
  opportunity: string;
  threats: string;
  recruitmentSource: string;
  email: string;
  dueTime: string; // ISO date string
  videoClip?: string; // URL to video clip
  gradeReport?: string; // URL to grade report
  homeRegistration?: string; // URL to home registration
  idCard?: string; // URL to ID card
  slidePresentation?: string; // URL to slide presentation
}

export interface SkillTest {
  name: string;
  pdf: string; // URL to PDF file
  positions: string;
}

export interface Request {
  email: string;
  resume: string; // URL to resume file
  positions: string[];
  offered: boolean;
}

export interface Position {
  name: string;
  availability: boolean;
}

export interface SkillTestOffer {
  name: string;
  uploadedFiles: string[]; // URL to PDF file
  status: string;
  dueTime: string; // ISO date string
  rank: number; // 1 for highest, 2 for second highest, etc.
  explanation: string; // Explanation for the rank
}

export interface Offer {
  email: string;
  dueTime: string; // ISO date string
  skillTests: SkillTestOffer[];
}

export interface Filter {
  gpaF: number;
  gpaA: number;
  F: number;
  completeness: number;
  email: string;
  done: boolean;
}

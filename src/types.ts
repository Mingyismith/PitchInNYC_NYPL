export type CauseType =
  | "Food Security & Hunger"
  | "Youth & Education"
  | "Animal Welfare"
  | "Environment & Parks"
  | "Housing & Homelessness"
  | "Senior Support"
  | "Arts & Culture"
  | "Health & Wellness"
  | "Community Advocacy"
  | "Crisis & Disaster Relief";

export type Borough =
  | "Manhattan"
  | "Brooklyn"
  | "Queens"
  | "Bronx"
  | "Staten Island"
  | "Remote / Citywide";

export type CommitmentType =
  | "One-time Shift"
  | "Weekly Recurring"
  | "Monthly Recurring"
  | "Flexible Schedule"
  | "Seasonal / Multi-Week";

export type SourcePlatform =
  | "Non-Profit Direct"
  | "Idealist.org"
  | "Eventbrite"
  | "Point App"
  | "NYC Service / Community";

export interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  orgWebsite?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  orgContactPerson?: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  cause: CauseType;
  borough: Borough;
  neighborhood: string;
  address: string;
  subwayLines: string[];
  commitmentType: CommitmentType;
  dates: string;
  nextDate?: string;
  upcomingDates?: string[];
  timeDuration: string;
  shiftSchedule: string;
  whatYouWillDo: string[];
  skillsRequired: string[];
  ageRequirement: string; // e.g. "18+", "16+ with parent waiver", "All Ages"
  attire: string;
  constraints: {
    allergies: string[]; // e.g. ["Peanut/Nut Food Prep", "Pet Dander (Cats/Dogs)", "Pollen/Outdoor Dust", "None"]
    physicalDemands: string[]; // e.g. ["Lifting 25+ lbs", "Standing 3+ hours", "Walking/Steps", "Low Physical/Desk"]
    wheelchairAccessible: boolean;
    indoorOutdoor: "Indoor" | "Outdoor" | "Hybrid";
  };
  applicationMode: "direct" | "external";
  externalApplyUrl?: string;
  spotsTotal: number;
  spotsRemaining: number;
  source: SourcePlatform;
  postedDate: string;
  urgent?: boolean;
  featured?: boolean;
}

export interface ScheduleConflictInfo {
  hasConflict: boolean;
  conflictingOpportunityId?: string;
  conflictingOpportunityTitle?: string;
  conflictingShift?: string;
  conflictingDate?: string;
  bufferHours?: number;
  reason?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  borough: Borough;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experienceNotes: string;
  emergencyContact: string;
  status: "Submitted" | "Confirmed" | "Completed" | "Waitlisted" | "Cancelled";
  appliedAt: string;
  shiftSelected: string;
  hoursCompleted?: number;
  cancellationReason?: string;
  conflictDetails?: {
    conflictingOpportunityTitle: string;
    conflictingShift: string;
    cancelledAt: string;
  };
}

export interface AIMatchRequest {
  causes: CauseType[];
  boroughs: Borough[];
  commitment: CommitmentType[];
  availableDays: string[];
  maxHoursPerWeek: number;
  physicalComfort: string[];
  skillsOrInterests: string;
}

export interface AIMatchResponse {
  topMatches: {
    opportunityId: string;
    matchScore: number; // 1 - 100
    whyMatch: string;
    highlightedPros: string[];
    scoreBreakdown?: {
      boroughMatchScore: number;
      causeMatchScore: number;
      scheduleMatchScore: number;
      skillsAllergyMatchScore: number;
      calculationExplanation: string;
    };
  }[];
  personalizedAdvice: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  title?: string;
  createdAt: string;
}

export interface OrganizationAccount {
  id: string;
  orgName: string;
  ein: string; // e.g. "13-1234567"
  website: string;
  mission: string;
  borough: Borough;
  contactEmail: string;
  contactPhone?: string;
  isVerified: boolean;
  verificationBadge: string; // e.g. "Verified 501(c)(3) NYS Charities Bureau"
  verifiedAt: string;
  members: OrgMember[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'volunteer' | 'organization';
  organizationId?: string; // If role is organization
  orgMemberId?: string;    // If role is organization member
  bio?: string;
  interests?: CauseType[];
  borough?: Borough;
  skills?: string[];
  emergencyContact?: string;
}


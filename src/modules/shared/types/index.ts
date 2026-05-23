import { UserRole, ImportStatus } from "@prisma/client";

// Re-export Prisma enums
export { UserRole, ImportStatus };

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithUnits extends UserDTO {
  unitAccesses: {
    unitId: string;
    unit: {
      id: string;
      code: string;
      name: string;
    };
  }[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  unitIds: string[];
}

// Event types
export interface EventDTO {
  id: string;
  eventCode: string;
  title: string;
  description: string | null;
  unitId: string;
  eventDate: Date | null;
  year: number | null;
  activityType: string | null;
  studentCount: number;
  facultyCount: number;
  externalCount: number;
  totalParticipants: number;
  beneficiaryText: string | null;
  beneficiaryCount: number | null;
  hoursPerEvent: number | null;
  totalHoursEngaged: number | null;
  amountSpent: number | null;
  locationText: string | null;
  reportUrl: string | null;
  socialUrl: string | null;
  sourceSheet: string | null;
  sourceRowNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithRelations extends EventDTO {
  unit: {
    id: string;
    code: string;
    name: string;
  };
  goals: {
    id: string;
    sdgGoalId: string;
    isPrimary: boolean;
    sdgGoal: {
      id: string;
      goalNumber: number;
      name: string;
    };
  }[];
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CreateEventInput {
  title: string;
  description?: string;
  unitId: string;
  eventDate?: Date;
  year?: number;
  activityType?: string;
  studentCount?: number;
  facultyCount?: number;
  externalCount?: number;
  totalParticipants?: number;
  beneficiaryText?: string;
  beneficiaryCount?: number;
  hoursPerEvent?: number;
  totalHoursEngaged?: number;
  amountSpent?: number;
  locationText?: string;
  reportUrl?: string;
  socialUrl?: string;
  sdgGoalIds?: string[];
  primarySdgGoalId?: string;
}

export type UpdateEventInput = Partial<CreateEventInput>;

export interface EventFilters {
  unitId?: string;
  year?: number;
  sdgGoalId?: string;
  activityType?: string;
  search?: string;
}

// Unit types
export interface UnitDTO {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// SDG Goal types
export interface SDGGoalDTO {
  id: string;
  goalNumber: number;
  name: string;
  shortLabel: string | null;
}

// Import types
export interface ImportBatchDTO {
  id: string;
  fileName: string;
  status: ImportStatus;
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface ImportRowErrorDTO {
  id: string;
  sheetName: string;
  rowNumber: number;
  rawPayload: unknown;
  errorMessage: string;
}

// Metrics types
export interface BloodDonationMetricDTO {
  id: string;
  year: number;
  campDonors: number;
  regularDonors: number;
  totalDonors: number;
  college?: string;
}

export interface ProgramYearMetricDTO {
  id: string;
  unitId: string;
  year: number;
  metricType: string;
  valueNumber: number;
}

// Dashboard analytics types
export interface DashboardAnalytics {
  totalEvents: number;
  totalParticipants: number;
  totalBeneficiaries: number;
  totalHoursEngaged: number;
  totalAmountSpent: number;
  latestBloodDonationTotal: number;
  eventsByYear: { year: number; count: number }[];
  metricsByYear: { year: number; participants: number; hours: number; amount: number }[];
  eventsByUnit: { unitCode: string; unitName: string; count: number }[];
  eventsByActivityType: { activityType: string; count: number }[];
  participantsByUnit: {
    unitCode: string;
    unitName: string;
    students: number;
    faculty: number;
    external: number;
    total: number;
  }[];
  eventsBySDG: { goalNumber: number; goalName: string; count: number }[];
  bloodDonationHistory: {
    year: number;
    campDonors: number;
    regularDonors: number;
    totalDonors: number;
  }[];
}

// Legacy dashboard summary
export interface DashboardSummary {
  totalEvents: number;
  totalBeneficiaries: number;
  totalParticipants: number;
  totalHoursEngaged: number;
  eventsByUnit: { unitCode: string; unitName: string; count: number }[];
  eventsByYear: { year: number; count: number }[];
  eventsBySDG: { goalNumber: number; goalName: string; count: number }[];
  bloodDonationHighlight: {
    latestYear: number;
    totalDonors: number;
    campDonors: number;
    regularDonors: number;
  } | null;
}

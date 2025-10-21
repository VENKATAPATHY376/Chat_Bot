import { ReactNode } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    behaviorData: Record<string, any>;
}

export interface BookingSlot {
    trialName: ReactNode;
    contactInfo: ReactNode;
    patientName: ReactNode;
    status: string;
    id: string;
    date: string;
    time: string;
    isAvailable: boolean;
}

export interface VaccineTrial {
    eligibilityCriteria: any;
    description: ReactNode;
    endDate: ReactNode;
    startDate: ReactNode;
    participants: ReactNode;
    id: string;
    name: string;
    phase: string;
    status: string;
    details: string;
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  RESEARCHER: 'researcher'
};

export const BOOKING_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  CANCELLED: 'cancelled'
};

export const TRIAL_PHASES = {
  PHASE_1: 'Phase 1',
  PHASE_2: 'Phase 2',
  PHASE_3: 'Phase 3',
  PHASE_4: 'Phase 4'
};
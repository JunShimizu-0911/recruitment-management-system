export interface Candidate {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  source?: string;
  currentCompany?: string;
  experience?: number;
  availableDate?: string;
  preferredTime?: string;
  interviewNotes?: string;
  notes?: string;
  documents?: string[];
  status?: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
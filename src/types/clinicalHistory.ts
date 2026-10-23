export interface ClinicalSigns {
  diarrhea: boolean;
  ocular: boolean;
  respiratory: boolean;
  vomiting: boolean;
}

export interface MedicalTreatment {
  id: string;
  description: string;
  startDate: string;
  endDate: string | null;
}

export interface MedicalCondition {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

export interface MedicalTest {
  id: string;
  testDate: string;
  hasAttachment: boolean;
  testType: string;
  testTypeId: string;
}

export interface MedicalPrescription {
  id: string;
  medication: {
    id: string;
    name: string;
    laboratory: string;
    type: { id: string; name: string };
  };
  regimen: string;
  startDate: string;
  endDate: string | null;
  dose: string | null;
  frequency: string | null;
  batch: string | null;
}

export interface ClinicalHistory {
  id: string;
  clinicalSigns: ClinicalSigns;
  medicalTreatments: MedicalTreatment[];
  medicalConditions: MedicalCondition[];
  medicalTests: MedicalTest[];
  medicalPrescriptions: MedicalPrescription[];
}
import { api } from './client';
import type { ClinicalHistory, ClinicalSigns, MedicalCondition, MedicalPrescription, MedicalTest, MedicalTreatment } from '../types/clinicalHistory';

export async function getClinicalHistory(kittyId: string) {
  const { data } = await api.get<ClinicalHistory>(`/history/${kittyId}`);
  return data;
}

export async function setClinicalSigns(kittyId: string, signs: ClinicalSigns) {
  const { data } = await api.put('/history/signs', { kittyId, ...signs });
  return data;
}

export interface MedicalTreatmentPayload {
  description: string;
  startDate: string;
  endDate: string | null;
}

export async function createTreatment(historyId: string, payload: MedicalTreatmentPayload) {
  const { data } = await api.post<MedicalTreatment>('/treatment', { historyId, ...payload });
  return data;
}

export async function updateTreatment(id: string, payload: MedicalTreatmentPayload) {
  const { data } = await api.put<MedicalTreatment>('/treatment', { id, ...payload });
  return data;
}

export async function deleteTreatment(id: string) {
  const { data } = await api.delete(`/treatment/${id}`);
  return data;
}

export interface MedicalConditionPayload {
  name: string;
  description: string | null;
  type: string;
}

export async function createCondition(historyId: string, payload: MedicalConditionPayload) {
  const { data } = await api.post<MedicalCondition>('/condition', { historyId, ...payload });
  return data;
}

export async function updateCondition(id: string, payload: MedicalConditionPayload) {
  const { data } = await api.put<MedicalCondition>('/condition', { id, ...payload });
  return data;
}

export async function deleteCondition(id: string) {
  const { data } = await api.delete(`/condition/${id}`);
  return data;
}

export interface MedicalTestPayload {
  testTypeId: string;
  testDate: string;
}

export async function createMedicalTest(historyId: string, payload: MedicalTestPayload, attachment: File | null) {
  const formData = new FormData();
  formData.append('historyId', historyId);
  formData.append('testTypeId', payload.testTypeId);
  formData.append('testDate', payload.testDate);
  if (attachment) formData.append('attachment', attachment);

  const { data } = await api.post<MedicalTest>('/medical-test', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateMedicalTest(id: string, payload: MedicalTestPayload) {
  const { data } = await api.put<MedicalTest>('/medical-test', { id, ...payload });
  return data;
}

export async function deleteMedicalTest(id: string) {
  const { data } = await api.delete(`/medical-test/${id}`);
  return data;
}

export async function downloadTestDocument(id: string) {
  const { data } = await api.get<Blob>(`/medical-test/${id}/document`, { responseType: 'blob' });
  return data;
}

export async function saveTestDocument(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.put(`/medical-test/${id}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteTestDocument(id: string) {
  const { data } = await api.delete(`/medical-test/${id}/document`);
  return data;
}

export interface MedicalPrescriptionPayload {
  medicationId: string;
  regimen: string;
  startDate: string;
  endDate: string | null;
  dose: string | null;
  frequency: string | null;
  batch: string | null;
}

export async function createPrescription(historyId: string, payload: MedicalPrescriptionPayload) {
  const { data } = await api.post<MedicalPrescription>('/medical-prescription', { historyId, ...payload });
  return data;
}

export async function updatePrescription(id: string, payload: MedicalPrescriptionPayload) {
  const { data } = await api.put<MedicalPrescription>('/medical-prescription', { id, ...payload });
  return data;
}

export async function deletePrescription(id: string) {
  const { data } = await api.delete(`/medical-prescription/${id}`);
  return data;
}
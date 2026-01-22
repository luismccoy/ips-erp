/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type BillingRecord = {
  __typename: "BillingRecord",
  approvedAt?: string | null,
  createdAt: string,
  date: string,
  diagnosis: string,
  eps: string,
  glosaDefense?: string | null,
  id: string,
  patientId: string,
  procedures?: Array< string | null > | null,
  rejectionReason?: string | null,
  ripsGenerated: boolean,
  shiftId?: string | null,
  status?: BillingStatus | null,
  submittedAt?: string | null,
  tenant?: Tenant | null,
  tenantId: string,
  totalAmount: number,
  updatedAt: string,
};

export enum BillingStatus {
  APPROVED = "APPROVED",
  PAID = "PAID",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  SUBMITTED = "SUBMITTED",
}


export type Tenant = {
  __typename: "Tenant",
  billingRecords?: ModelBillingRecordConnection | null,
  createdAt: string,
  id: string,
  inventory?: ModelInventoryItemConnection | null,
  name: string,
  nit: string,
  nurses?: ModelNurseConnection | null,
  patients?: ModelPatientConnection | null,
  shifts?: ModelShiftConnection | null,
  updatedAt: string,
  vitalSigns?: ModelVitalSignsConnection | null,
};

export type ModelBillingRecordConnection = {
  __typename: "ModelBillingRecordConnection",
  items:  Array<BillingRecord | null >,
  nextToken?: string | null,
};

export type ModelInventoryItemConnection = {
  __typename: "ModelInventoryItemConnection",
  items:  Array<InventoryItem | null >,
  nextToken?: string | null,
};

export type InventoryItem = {
  __typename: "InventoryItem",
  createdAt: string,
  expiryDate?: string | null,
  id: string,
  name: string,
  quantity: number,
  reorderLevel: number,
  sku?: string | null,
  status?: InventoryStatus | null,
  tenant?: Tenant | null,
  tenantId: string,
  unit?: string | null,
  updatedAt: string,
};

export enum InventoryStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}


export type ModelNurseConnection = {
  __typename: "ModelNurseConnection",
  items:  Array<Nurse | null >,
  nextToken?: string | null,
};

export type Nurse = {
  __typename: "Nurse",
  createdAt: string,
  email?: string | null,
  id: string,
  locationLat?: number | null,
  locationLng?: number | null,
  name: string,
  role?: NurseRole | null,
  shifts?: ModelShiftConnection | null,
  skills?: Array< string | null > | null,
  tenant?: Tenant | null,
  tenantId: string,
  updatedAt: string,
};

export enum NurseRole {
  ADMIN = "ADMIN",
  COORDINATOR = "COORDINATOR",
  NURSE = "NURSE",
}


export type ModelShiftConnection = {
  __typename: "ModelShiftConnection",
  items:  Array<Shift | null >,
  nextToken?: string | null,
};

export type Shift = {
  __typename: "Shift",
  clinicalNote?: string | null,
  completedAt?: string | null,
  createdAt: string,
  id: string,
  nurse?: Nurse | null,
  nurseId: string,
  patient?: Patient | null,
  patientId: string,
  scheduledTime: string,
  startLat?: number | null,
  startLng?: number | null,
  startedAt?: string | null,
  status?: ShiftStatus | null,
  tenant?: Tenant | null,
  tenantId: string,
  updatedAt: string,
};

export type Patient = {
  __typename: "Patient",
  address?: string | null,
  age?: number | null,
  createdAt: string,
  diagnosis?: string | null,
  documentId: string,
  id: string,
  medications?:  Array<Medication | null > | null,
  name: string,
  shifts?: ModelShiftConnection | null,
  tasks?:  Array<Task | null > | null,
  tenant?: Tenant | null,
  tenantId: string,
  updatedAt: string,
  vitalSigns?: ModelVitalSignsConnection | null,
};

export type Medication = {
  __typename: "Medication",
  dosage: string,
  frequency: string,
  id: string,
  name: string,
  prescribedBy?: string | null,
  status?: MedicationStatus | null,
};

export enum MedicationStatus {
  ACTIVE = "ACTIVE",
  DISCONTINUED = "DISCONTINUED",
}


export type Task = {
  __typename: "Task",
  completed: boolean,
  description: string,
  dueDate?: string | null,
  id: string,
  patientId: string,
};

export type ModelVitalSignsConnection = {
  __typename: "ModelVitalSignsConnection",
  items:  Array<VitalSigns | null >,
  nextToken?: string | null,
};

export type VitalSigns = {
  __typename: "VitalSigns",
  createdAt: string,
  date: string,
  dia: number,
  hr: number,
  id: string,
  note?: string | null,
  patient?: Patient | null,
  patientId: string,
  spo2: number,
  sys: number,
  temperature?: number | null,
  tenant?: Tenant | null,
  tenantId: string,
  updatedAt: string,
  weight?: number | null,
};

export enum ShiftStatus {
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
}


export type ModelPatientConnection = {
  __typename: "ModelPatientConnection",
  items:  Array<Patient | null >,
  nextToken?: string | null,
};

export type ModelBillingRecordFilterInput = {
  and?: Array< ModelBillingRecordFilterInput | null > | null,
  approvedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  diagnosis?: ModelStringInput | null,
  eps?: ModelStringInput | null,
  glosaDefense?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelBillingRecordFilterInput | null,
  or?: Array< ModelBillingRecordFilterInput | null > | null,
  patientId?: ModelIDInput | null,
  procedures?: ModelStringInput | null,
  rejectionReason?: ModelStringInput | null,
  ripsGenerated?: ModelBooleanInput | null,
  shiftId?: ModelIDInput | null,
  status?: ModelBillingStatusInput | null,
  submittedAt?: ModelStringInput | null,
  tenantId?: ModelIDInput | null,
  totalAmount?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelBillingStatusInput = {
  eq?: BillingStatus | null,
  ne?: BillingStatus | null,
};

export type ModelFloatInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelInventoryItemFilterInput = {
  and?: Array< ModelInventoryItemFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  expiryDate?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelInventoryItemFilterInput | null,
  or?: Array< ModelInventoryItemFilterInput | null > | null,
  quantity?: ModelIntInput | null,
  reorderLevel?: ModelIntInput | null,
  sku?: ModelStringInput | null,
  status?: ModelInventoryStatusInput | null,
  tenantId?: ModelIDInput | null,
  unit?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelInventoryStatusInput = {
  eq?: InventoryStatus | null,
  ne?: InventoryStatus | null,
};

export type ModelNurseFilterInput = {
  and?: Array< ModelNurseFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  locationLat?: ModelFloatInput | null,
  locationLng?: ModelFloatInput | null,
  name?: ModelStringInput | null,
  not?: ModelNurseFilterInput | null,
  or?: Array< ModelNurseFilterInput | null > | null,
  role?: ModelNurseRoleInput | null,
  skills?: ModelStringInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelNurseRoleInput = {
  eq?: NurseRole | null,
  ne?: NurseRole | null,
};

export type ModelPatientFilterInput = {
  address?: ModelStringInput | null,
  age?: ModelIntInput | null,
  and?: Array< ModelPatientFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  diagnosis?: ModelStringInput | null,
  documentId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelPatientFilterInput | null,
  or?: Array< ModelPatientFilterInput | null > | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelShiftFilterInput = {
  and?: Array< ModelShiftFilterInput | null > | null,
  clinicalNote?: ModelStringInput | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelShiftFilterInput | null,
  nurseId?: ModelIDInput | null,
  or?: Array< ModelShiftFilterInput | null > | null,
  patientId?: ModelIDInput | null,
  scheduledTime?: ModelStringInput | null,
  startLat?: ModelFloatInput | null,
  startLng?: ModelFloatInput | null,
  startedAt?: ModelStringInput | null,
  status?: ModelShiftStatusInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelShiftStatusInput = {
  eq?: ShiftStatus | null,
  ne?: ShiftStatus | null,
};

export type ModelTenantFilterInput = {
  and?: Array< ModelTenantFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  nit?: ModelStringInput | null,
  not?: ModelTenantFilterInput | null,
  or?: Array< ModelTenantFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelTenantConnection = {
  __typename: "ModelTenantConnection",
  items:  Array<Tenant | null >,
  nextToken?: string | null,
};

export type ModelVitalSignsFilterInput = {
  and?: Array< ModelVitalSignsFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  dia?: ModelIntInput | null,
  hr?: ModelIntInput | null,
  id?: ModelIDInput | null,
  not?: ModelVitalSignsFilterInput | null,
  note?: ModelStringInput | null,
  or?: Array< ModelVitalSignsFilterInput | null > | null,
  patientId?: ModelIDInput | null,
  spo2?: ModelIntInput | null,
  sys?: ModelIntInput | null,
  temperature?: ModelFloatInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
  weight?: ModelFloatInput | null,
};

export type ModelBillingRecordConditionInput = {
  and?: Array< ModelBillingRecordConditionInput | null > | null,
  approvedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  diagnosis?: ModelStringInput | null,
  eps?: ModelStringInput | null,
  glosaDefense?: ModelStringInput | null,
  not?: ModelBillingRecordConditionInput | null,
  or?: Array< ModelBillingRecordConditionInput | null > | null,
  patientId?: ModelIDInput | null,
  procedures?: ModelStringInput | null,
  rejectionReason?: ModelStringInput | null,
  ripsGenerated?: ModelBooleanInput | null,
  shiftId?: ModelIDInput | null,
  status?: ModelBillingStatusInput | null,
  submittedAt?: ModelStringInput | null,
  tenantId?: ModelIDInput | null,
  totalAmount?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateBillingRecordInput = {
  approvedAt?: string | null,
  date: string,
  diagnosis: string,
  eps: string,
  glosaDefense?: string | null,
  id?: string | null,
  patientId: string,
  procedures?: Array< string | null > | null,
  rejectionReason?: string | null,
  ripsGenerated: boolean,
  shiftId?: string | null,
  status?: BillingStatus | null,
  submittedAt?: string | null,
  tenantId: string,
  totalAmount: number,
};

export type ModelInventoryItemConditionInput = {
  and?: Array< ModelInventoryItemConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  expiryDate?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelInventoryItemConditionInput | null,
  or?: Array< ModelInventoryItemConditionInput | null > | null,
  quantity?: ModelIntInput | null,
  reorderLevel?: ModelIntInput | null,
  sku?: ModelStringInput | null,
  status?: ModelInventoryStatusInput | null,
  tenantId?: ModelIDInput | null,
  unit?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateInventoryItemInput = {
  expiryDate?: string | null,
  id?: string | null,
  name: string,
  quantity: number,
  reorderLevel: number,
  sku?: string | null,
  status?: InventoryStatus | null,
  tenantId: string,
  unit?: string | null,
};

export type ModelNurseConditionInput = {
  and?: Array< ModelNurseConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  locationLat?: ModelFloatInput | null,
  locationLng?: ModelFloatInput | null,
  name?: ModelStringInput | null,
  not?: ModelNurseConditionInput | null,
  or?: Array< ModelNurseConditionInput | null > | null,
  role?: ModelNurseRoleInput | null,
  skills?: ModelStringInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateNurseInput = {
  email?: string | null,
  id?: string | null,
  locationLat?: number | null,
  locationLng?: number | null,
  name: string,
  role?: NurseRole | null,
  skills?: Array< string | null > | null,
  tenantId: string,
};

export type ModelPatientConditionInput = {
  address?: ModelStringInput | null,
  age?: ModelIntInput | null,
  and?: Array< ModelPatientConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  diagnosis?: ModelStringInput | null,
  documentId?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelPatientConditionInput | null,
  or?: Array< ModelPatientConditionInput | null > | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreatePatientInput = {
  address?: string | null,
  age?: number | null,
  diagnosis?: string | null,
  documentId: string,
  id?: string | null,
  medications?: Array< MedicationInput | null > | null,
  name: string,
  tasks?: Array< TaskInput | null > | null,
  tenantId: string,
};

export type MedicationInput = {
  dosage: string,
  frequency: string,
  id: string,
  name: string,
  prescribedBy?: string | null,
  status?: MedicationStatus | null,
};

export type TaskInput = {
  completed: boolean,
  description: string,
  dueDate?: string | null,
  id: string,
  patientId: string,
};

export type ModelShiftConditionInput = {
  and?: Array< ModelShiftConditionInput | null > | null,
  clinicalNote?: ModelStringInput | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelShiftConditionInput | null,
  nurseId?: ModelIDInput | null,
  or?: Array< ModelShiftConditionInput | null > | null,
  patientId?: ModelIDInput | null,
  scheduledTime?: ModelStringInput | null,
  startLat?: ModelFloatInput | null,
  startLng?: ModelFloatInput | null,
  startedAt?: ModelStringInput | null,
  status?: ModelShiftStatusInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateShiftInput = {
  clinicalNote?: string | null,
  completedAt?: string | null,
  id?: string | null,
  nurseId: string,
  patientId: string,
  scheduledTime: string,
  startLat?: number | null,
  startLng?: number | null,
  startedAt?: string | null,
  status?: ShiftStatus | null,
  tenantId: string,
};

export type ModelTenantConditionInput = {
  and?: Array< ModelTenantConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  name?: ModelStringInput | null,
  nit?: ModelStringInput | null,
  not?: ModelTenantConditionInput | null,
  or?: Array< ModelTenantConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateTenantInput = {
  id?: string | null,
  name: string,
  nit: string,
};

export type ModelVitalSignsConditionInput = {
  and?: Array< ModelVitalSignsConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  dia?: ModelIntInput | null,
  hr?: ModelIntInput | null,
  not?: ModelVitalSignsConditionInput | null,
  note?: ModelStringInput | null,
  or?: Array< ModelVitalSignsConditionInput | null > | null,
  patientId?: ModelIDInput | null,
  spo2?: ModelIntInput | null,
  sys?: ModelIntInput | null,
  temperature?: ModelFloatInput | null,
  tenantId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
  weight?: ModelFloatInput | null,
};

export type CreateVitalSignsInput = {
  date: string,
  dia: number,
  hr: number,
  id?: string | null,
  note?: string | null,
  patientId: string,
  spo2: number,
  sys: number,
  temperature?: number | null,
  tenantId: string,
  weight?: number | null,
};

export type DeleteBillingRecordInput = {
  id: string,
};

export type DeleteInventoryItemInput = {
  id: string,
};

export type DeleteNurseInput = {
  id: string,
};

export type DeletePatientInput = {
  id: string,
};

export type DeleteShiftInput = {
  id: string,
};

export type DeleteTenantInput = {
  id: string,
};

export type DeleteVitalSignsInput = {
  id: string,
};

export type UpdateBillingRecordInput = {
  approvedAt?: string | null,
  date?: string | null,
  diagnosis?: string | null,
  eps?: string | null,
  glosaDefense?: string | null,
  id: string,
  patientId?: string | null,
  procedures?: Array< string | null > | null,
  rejectionReason?: string | null,
  ripsGenerated?: boolean | null,
  shiftId?: string | null,
  status?: BillingStatus | null,
  submittedAt?: string | null,
  tenantId?: string | null,
  totalAmount?: number | null,
};

export type UpdateInventoryItemInput = {
  expiryDate?: string | null,
  id: string,
  name?: string | null,
  quantity?: number | null,
  reorderLevel?: number | null,
  sku?: string | null,
  status?: InventoryStatus | null,
  tenantId?: string | null,
  unit?: string | null,
};

export type UpdateNurseInput = {
  email?: string | null,
  id: string,
  locationLat?: number | null,
  locationLng?: number | null,
  name?: string | null,
  role?: NurseRole | null,
  skills?: Array< string | null > | null,
  tenantId?: string | null,
};

export type UpdatePatientInput = {
  address?: string | null,
  age?: number | null,
  diagnosis?: string | null,
  documentId?: string | null,
  id: string,
  medications?: Array< MedicationInput | null > | null,
  name?: string | null,
  tasks?: Array< TaskInput | null > | null,
  tenantId?: string | null,
};

export type UpdateShiftInput = {
  clinicalNote?: string | null,
  completedAt?: string | null,
  id: string,
  nurseId?: string | null,
  patientId?: string | null,
  scheduledTime?: string | null,
  startLat?: number | null,
  startLng?: number | null,
  startedAt?: string | null,
  status?: ShiftStatus | null,
  tenantId?: string | null,
};

export type UpdateTenantInput = {
  id: string,
  name?: string | null,
  nit?: string | null,
};

export type UpdateVitalSignsInput = {
  date?: string | null,
  dia?: number | null,
  hr?: number | null,
  id: string,
  note?: string | null,
  patientId?: string | null,
  spo2?: number | null,
  sys?: number | null,
  temperature?: number | null,
  tenantId?: string | null,
  weight?: number | null,
};

export type ModelSubscriptionBillingRecordFilterInput = {
  and?: Array< ModelSubscriptionBillingRecordFilterInput | null > | null,
  approvedAt?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  date?: ModelSubscriptionStringInput | null,
  diagnosis?: ModelSubscriptionStringInput | null,
  eps?: ModelSubscriptionStringInput | null,
  glosaDefense?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionBillingRecordFilterInput | null > | null,
  patientId?: ModelSubscriptionIDInput | null,
  procedures?: ModelSubscriptionStringInput | null,
  rejectionReason?: ModelSubscriptionStringInput | null,
  ripsGenerated?: ModelSubscriptionBooleanInput | null,
  shiftId?: ModelSubscriptionIDInput | null,
  status?: ModelSubscriptionStringInput | null,
  submittedAt?: ModelSubscriptionStringInput | null,
  tenantId?: ModelStringInput | null,
  totalAmount?: ModelSubscriptionFloatInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelSubscriptionFloatInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionInventoryItemFilterInput = {
  and?: Array< ModelSubscriptionInventoryItemFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  expiryDate?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionInventoryItemFilterInput | null > | null,
  quantity?: ModelSubscriptionIntInput | null,
  reorderLevel?: ModelSubscriptionIntInput | null,
  sku?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  tenantId?: ModelStringInput | null,
  unit?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionNurseFilterInput = {
  and?: Array< ModelSubscriptionNurseFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  locationLat?: ModelSubscriptionFloatInput | null,
  locationLng?: ModelSubscriptionFloatInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionNurseFilterInput | null > | null,
  role?: ModelSubscriptionStringInput | null,
  skills?: ModelSubscriptionStringInput | null,
  tenantId?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionPatientFilterInput = {
  address?: ModelSubscriptionStringInput | null,
  age?: ModelSubscriptionIntInput | null,
  and?: Array< ModelSubscriptionPatientFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  diagnosis?: ModelSubscriptionStringInput | null,
  documentId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionPatientFilterInput | null > | null,
  tenantId?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionShiftFilterInput = {
  and?: Array< ModelSubscriptionShiftFilterInput | null > | null,
  clinicalNote?: ModelSubscriptionStringInput | null,
  completedAt?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  nurseId?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionShiftFilterInput | null > | null,
  patientId?: ModelSubscriptionIDInput | null,
  scheduledTime?: ModelSubscriptionStringInput | null,
  startLat?: ModelSubscriptionFloatInput | null,
  startLng?: ModelSubscriptionFloatInput | null,
  startedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  tenantId?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionTenantFilterInput = {
  and?: Array< ModelSubscriptionTenantFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  nit?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionTenantFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionVitalSignsFilterInput = {
  and?: Array< ModelSubscriptionVitalSignsFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  date?: ModelSubscriptionStringInput | null,
  dia?: ModelSubscriptionIntInput | null,
  hr?: ModelSubscriptionIntInput | null,
  id?: ModelSubscriptionIDInput | null,
  note?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionVitalSignsFilterInput | null > | null,
  patientId?: ModelSubscriptionIDInput | null,
  spo2?: ModelSubscriptionIntInput | null,
  sys?: ModelSubscriptionIntInput | null,
  temperature?: ModelSubscriptionFloatInput | null,
  tenantId?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  weight?: ModelSubscriptionFloatInput | null,
};

export type GenerateGlosaDefenseQueryVariables = {
  billingRecord?: string | null,
  clinicalNotes?: string | null,
  patientHistory?: string | null,
};

export type GenerateGlosaDefenseQuery = {
  generateGlosaDefense?: string | null,
};

export type GenerateRosterQueryVariables = {
  nurses?: string | null,
  unassignedShifts?: string | null,
};

export type GenerateRosterQuery = {
  generateRoster?: string | null,
};

export type GetBillingRecordQueryVariables = {
  id: string,
};

export type GetBillingRecordQuery = {
  getBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type GetInventoryItemQueryVariables = {
  id: string,
};

export type GetInventoryItemQuery = {
  getInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type GetNurseQueryVariables = {
  id: string,
};

export type GetNurseQuery = {
  getNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type GetPatientQueryVariables = {
  id: string,
};

export type GetPatientQuery = {
  getPatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type GetShiftQueryVariables = {
  id: string,
};

export type GetShiftQuery = {
  getShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type GetTenantQueryVariables = {
  id: string,
};

export type GetTenantQuery = {
  getTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type GetVitalSignsQueryVariables = {
  id: string,
};

export type GetVitalSignsQuery = {
  getVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type ListBillingRecordsQueryVariables = {
  filter?: ModelBillingRecordFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListBillingRecordsQuery = {
  listBillingRecords?:  {
    __typename: "ModelBillingRecordConnection",
    items:  Array< {
      __typename: "BillingRecord",
      approvedAt?: string | null,
      createdAt: string,
      date: string,
      diagnosis: string,
      eps: string,
      glosaDefense?: string | null,
      id: string,
      patientId: string,
      procedures?: Array< string | null > | null,
      rejectionReason?: string | null,
      ripsGenerated: boolean,
      shiftId?: string | null,
      status?: BillingStatus | null,
      submittedAt?: string | null,
      tenantId: string,
      totalAmount: number,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListInventoryItemsQueryVariables = {
  filter?: ModelInventoryItemFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryItemsQuery = {
  listInventoryItems?:  {
    __typename: "ModelInventoryItemConnection",
    items:  Array< {
      __typename: "InventoryItem",
      createdAt: string,
      expiryDate?: string | null,
      id: string,
      name: string,
      quantity: number,
      reorderLevel: number,
      sku?: string | null,
      status?: InventoryStatus | null,
      tenantId: string,
      unit?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListNursesQueryVariables = {
  filter?: ModelNurseFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListNursesQuery = {
  listNurses?:  {
    __typename: "ModelNurseConnection",
    items:  Array< {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListPatientsQueryVariables = {
  filter?: ModelPatientFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPatientsQuery = {
  listPatients?:  {
    __typename: "ModelPatientConnection",
    items:  Array< {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListShiftsQueryVariables = {
  filter?: ModelShiftFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListShiftsQuery = {
  listShifts?:  {
    __typename: "ModelShiftConnection",
    items:  Array< {
      __typename: "Shift",
      clinicalNote?: string | null,
      completedAt?: string | null,
      createdAt: string,
      id: string,
      nurseId: string,
      patientId: string,
      scheduledTime: string,
      startLat?: number | null,
      startLng?: number | null,
      startedAt?: string | null,
      status?: ShiftStatus | null,
      tenantId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTenantsQueryVariables = {
  filter?: ModelTenantFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTenantsQuery = {
  listTenants?:  {
    __typename: "ModelTenantConnection",
    items:  Array< {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListVitalSignsQueryVariables = {
  filter?: ModelVitalSignsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListVitalSignsQuery = {
  listVitalSigns?:  {
    __typename: "ModelVitalSignsConnection",
    items:  Array< {
      __typename: "VitalSigns",
      createdAt: string,
      date: string,
      dia: number,
      hr: number,
      id: string,
      note?: string | null,
      patientId: string,
      spo2: number,
      sys: number,
      temperature?: number | null,
      tenantId: string,
      updatedAt: string,
      weight?: number | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ValidateRIPSQueryVariables = {
  billingRecord?: string | null,
};

export type ValidateRIPSQuery = {
  validateRIPS?: string | null,
};

export type CreateBillingRecordMutationVariables = {
  condition?: ModelBillingRecordConditionInput | null,
  input: CreateBillingRecordInput,
};

export type CreateBillingRecordMutation = {
  createBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type CreateInventoryItemMutationVariables = {
  condition?: ModelInventoryItemConditionInput | null,
  input: CreateInventoryItemInput,
};

export type CreateInventoryItemMutation = {
  createInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateNurseMutationVariables = {
  condition?: ModelNurseConditionInput | null,
  input: CreateNurseInput,
};

export type CreateNurseMutation = {
  createNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type CreatePatientMutationVariables = {
  condition?: ModelPatientConditionInput | null,
  input: CreatePatientInput,
};

export type CreatePatientMutation = {
  createPatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type CreateShiftMutationVariables = {
  condition?: ModelShiftConditionInput | null,
  input: CreateShiftInput,
};

export type CreateShiftMutation = {
  createShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type CreateTenantMutationVariables = {
  condition?: ModelTenantConditionInput | null,
  input: CreateTenantInput,
};

export type CreateTenantMutation = {
  createTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type CreateVitalSignsMutationVariables = {
  condition?: ModelVitalSignsConditionInput | null,
  input: CreateVitalSignsInput,
};

export type CreateVitalSignsMutation = {
  createVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type DeleteBillingRecordMutationVariables = {
  condition?: ModelBillingRecordConditionInput | null,
  input: DeleteBillingRecordInput,
};

export type DeleteBillingRecordMutation = {
  deleteBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type DeleteInventoryItemMutationVariables = {
  condition?: ModelInventoryItemConditionInput | null,
  input: DeleteInventoryItemInput,
};

export type DeleteInventoryItemMutation = {
  deleteInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteNurseMutationVariables = {
  condition?: ModelNurseConditionInput | null,
  input: DeleteNurseInput,
};

export type DeleteNurseMutation = {
  deleteNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type DeletePatientMutationVariables = {
  condition?: ModelPatientConditionInput | null,
  input: DeletePatientInput,
};

export type DeletePatientMutation = {
  deletePatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type DeleteShiftMutationVariables = {
  condition?: ModelShiftConditionInput | null,
  input: DeleteShiftInput,
};

export type DeleteShiftMutation = {
  deleteShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type DeleteTenantMutationVariables = {
  condition?: ModelTenantConditionInput | null,
  input: DeleteTenantInput,
};

export type DeleteTenantMutation = {
  deleteTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type DeleteVitalSignsMutationVariables = {
  condition?: ModelVitalSignsConditionInput | null,
  input: DeleteVitalSignsInput,
};

export type DeleteVitalSignsMutation = {
  deleteVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type UpdateBillingRecordMutationVariables = {
  condition?: ModelBillingRecordConditionInput | null,
  input: UpdateBillingRecordInput,
};

export type UpdateBillingRecordMutation = {
  updateBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type UpdateInventoryItemMutationVariables = {
  condition?: ModelInventoryItemConditionInput | null,
  input: UpdateInventoryItemInput,
};

export type UpdateInventoryItemMutation = {
  updateInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateNurseMutationVariables = {
  condition?: ModelNurseConditionInput | null,
  input: UpdateNurseInput,
};

export type UpdateNurseMutation = {
  updateNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type UpdatePatientMutationVariables = {
  condition?: ModelPatientConditionInput | null,
  input: UpdatePatientInput,
};

export type UpdatePatientMutation = {
  updatePatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type UpdateShiftMutationVariables = {
  condition?: ModelShiftConditionInput | null,
  input: UpdateShiftInput,
};

export type UpdateShiftMutation = {
  updateShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type UpdateTenantMutationVariables = {
  condition?: ModelTenantConditionInput | null,
  input: UpdateTenantInput,
};

export type UpdateTenantMutation = {
  updateTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type UpdateVitalSignsMutationVariables = {
  condition?: ModelVitalSignsConditionInput | null,
  input: UpdateVitalSignsInput,
};

export type UpdateVitalSignsMutation = {
  updateVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type OnCreateBillingRecordSubscriptionVariables = {
  filter?: ModelSubscriptionBillingRecordFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateBillingRecordSubscription = {
  onCreateBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type OnCreateInventoryItemSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryItemFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryItemSubscription = {
  onCreateInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateNurseSubscriptionVariables = {
  filter?: ModelSubscriptionNurseFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateNurseSubscription = {
  onCreateNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnCreatePatientSubscriptionVariables = {
  filter?: ModelSubscriptionPatientFilterInput | null,
  tenantId?: string | null,
};

export type OnCreatePatientSubscription = {
  onCreatePatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnCreateShiftSubscriptionVariables = {
  filter?: ModelSubscriptionShiftFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateShiftSubscription = {
  onCreateShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
};

export type OnCreateTenantSubscription = {
  onCreateTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnCreateVitalSignsSubscriptionVariables = {
  filter?: ModelSubscriptionVitalSignsFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateVitalSignsSubscription = {
  onCreateVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type OnDeleteBillingRecordSubscriptionVariables = {
  filter?: ModelSubscriptionBillingRecordFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteBillingRecordSubscription = {
  onDeleteBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type OnDeleteInventoryItemSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryItemFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryItemSubscription = {
  onDeleteInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteNurseSubscriptionVariables = {
  filter?: ModelSubscriptionNurseFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteNurseSubscription = {
  onDeleteNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnDeletePatientSubscriptionVariables = {
  filter?: ModelSubscriptionPatientFilterInput | null,
  tenantId?: string | null,
};

export type OnDeletePatientSubscription = {
  onDeletePatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnDeleteShiftSubscriptionVariables = {
  filter?: ModelSubscriptionShiftFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteShiftSubscription = {
  onDeleteShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
};

export type OnDeleteTenantSubscription = {
  onDeleteTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnDeleteVitalSignsSubscriptionVariables = {
  filter?: ModelSubscriptionVitalSignsFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteVitalSignsSubscription = {
  onDeleteVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

export type OnUpdateBillingRecordSubscriptionVariables = {
  filter?: ModelSubscriptionBillingRecordFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateBillingRecordSubscription = {
  onUpdateBillingRecord?:  {
    __typename: "BillingRecord",
    approvedAt?: string | null,
    createdAt: string,
    date: string,
    diagnosis: string,
    eps: string,
    glosaDefense?: string | null,
    id: string,
    patientId: string,
    procedures?: Array< string | null > | null,
    rejectionReason?: string | null,
    ripsGenerated: boolean,
    shiftId?: string | null,
    status?: BillingStatus | null,
    submittedAt?: string | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    totalAmount: number,
    updatedAt: string,
  } | null,
};

export type OnUpdateInventoryItemSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryItemFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryItemSubscription = {
  onUpdateInventoryItem?:  {
    __typename: "InventoryItem",
    createdAt: string,
    expiryDate?: string | null,
    id: string,
    name: string,
    quantity: number,
    reorderLevel: number,
    sku?: string | null,
    status?: InventoryStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    unit?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateNurseSubscriptionVariables = {
  filter?: ModelSubscriptionNurseFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateNurseSubscription = {
  onUpdateNurse?:  {
    __typename: "Nurse",
    createdAt: string,
    email?: string | null,
    id: string,
    locationLat?: number | null,
    locationLng?: number | null,
    name: string,
    role?: NurseRole | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    skills?: Array< string | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdatePatientSubscriptionVariables = {
  filter?: ModelSubscriptionPatientFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdatePatientSubscription = {
  onUpdatePatient?:  {
    __typename: "Patient",
    address?: string | null,
    age?: number | null,
    createdAt: string,
    diagnosis?: string | null,
    documentId: string,
    id: string,
    medications?:  Array< {
      __typename: "Medication",
      dosage: string,
      frequency: string,
      id: string,
      name: string,
      prescribedBy?: string | null,
      status?: MedicationStatus | null,
    } | null > | null,
    name: string,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    tasks?:  Array< {
      __typename: "Task",
      completed: boolean,
      description: string,
      dueDate?: string | null,
      id: string,
      patientId: string,
    } | null > | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnUpdateShiftSubscriptionVariables = {
  filter?: ModelSubscriptionShiftFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateShiftSubscription = {
  onUpdateShift?:  {
    __typename: "Shift",
    clinicalNote?: string | null,
    completedAt?: string | null,
    createdAt: string,
    id: string,
    nurse?:  {
      __typename: "Nurse",
      createdAt: string,
      email?: string | null,
      id: string,
      locationLat?: number | null,
      locationLng?: number | null,
      name: string,
      role?: NurseRole | null,
      skills?: Array< string | null > | null,
      tenantId: string,
      updatedAt: string,
    } | null,
    nurseId: string,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    scheduledTime: string,
    startLat?: number | null,
    startLng?: number | null,
    startedAt?: string | null,
    status?: ShiftStatus | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
};

export type OnUpdateTenantSubscription = {
  onUpdateTenant?:  {
    __typename: "Tenant",
    billingRecords?:  {
      __typename: "ModelBillingRecordConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    id: string,
    inventory?:  {
      __typename: "ModelInventoryItemConnection",
      nextToken?: string | null,
    } | null,
    name: string,
    nit: string,
    nurses?:  {
      __typename: "ModelNurseConnection",
      nextToken?: string | null,
    } | null,
    patients?:  {
      __typename: "ModelPatientConnection",
      nextToken?: string | null,
    } | null,
    shifts?:  {
      __typename: "ModelShiftConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    vitalSigns?:  {
      __typename: "ModelVitalSignsConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnUpdateVitalSignsSubscriptionVariables = {
  filter?: ModelSubscriptionVitalSignsFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateVitalSignsSubscription = {
  onUpdateVitalSigns?:  {
    __typename: "VitalSigns",
    createdAt: string,
    date: string,
    dia: number,
    hr: number,
    id: string,
    note?: string | null,
    patient?:  {
      __typename: "Patient",
      address?: string | null,
      age?: number | null,
      createdAt: string,
      diagnosis?: string | null,
      documentId: string,
      id: string,
      name: string,
      tenantId: string,
      updatedAt: string,
    } | null,
    patientId: string,
    spo2: number,
    sys: number,
    temperature?: number | null,
    tenant?:  {
      __typename: "Tenant",
      createdAt: string,
      id: string,
      name: string,
      nit: string,
      updatedAt: string,
    } | null,
    tenantId: string,
    updatedAt: string,
    weight?: number | null,
  } | null,
};

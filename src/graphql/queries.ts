/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const generateGlosaDefense = /* GraphQL */ `query GenerateGlosaDefense(
  $billingRecord: AWSJSON
  $clinicalNotes: AWSJSON
  $patientHistory: AWSJSON
) {
  generateGlosaDefense(
    billingRecord: $billingRecord
    clinicalNotes: $clinicalNotes
    patientHistory: $patientHistory
  )
}
` as GeneratedQuery<
  APITypes.GenerateGlosaDefenseQueryVariables,
  APITypes.GenerateGlosaDefenseQuery
>;
export const generateRoster = /* GraphQL */ `query GenerateRoster($nurses: AWSJSON, $unassignedShifts: AWSJSON) {
  generateRoster(nurses: $nurses, unassignedShifts: $unassignedShifts)
}
` as GeneratedQuery<
  APITypes.GenerateRosterQueryVariables,
  APITypes.GenerateRosterQuery
>;
export const getBillingRecord = /* GraphQL */ `query GetBillingRecord($id: ID!) {
  getBillingRecord(id: $id) {
    approvedAt
    createdAt
    date
    diagnosis
    eps
    glosaDefense
    id
    patientId
    procedures
    rejectionReason
    ripsGenerated
    shiftId
    status
    submittedAt
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    totalAmount
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBillingRecordQueryVariables,
  APITypes.GetBillingRecordQuery
>;
export const getInventoryItem = /* GraphQL */ `query GetInventoryItem($id: ID!) {
  getInventoryItem(id: $id) {
    createdAt
    expiryDate
    id
    name
    quantity
    reorderLevel
    sku
    status
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    unit
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInventoryItemQueryVariables,
  APITypes.GetInventoryItemQuery
>;
export const getNurse = /* GraphQL */ `query GetNurse($id: ID!) {
  getNurse(id: $id) {
    createdAt
    email
    id
    locationLat
    locationLng
    name
    role
    shifts {
      nextToken
      __typename
    }
    skills
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetNurseQueryVariables, APITypes.GetNurseQuery>;
export const getPatient = /* GraphQL */ `query GetPatient($id: ID!) {
  getPatient(id: $id) {
    address
    age
    createdAt
    diagnosis
    documentId
    id
    medications {
      dosage
      frequency
      id
      name
      prescribedBy
      status
      __typename
    }
    name
    shifts {
      nextToken
      __typename
    }
    tasks {
      completed
      description
      dueDate
      id
      patientId
      __typename
    }
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    updatedAt
    vitalSigns {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPatientQueryVariables,
  APITypes.GetPatientQuery
>;
export const getShift = /* GraphQL */ `query GetShift($id: ID!) {
  getShift(id: $id) {
    clinicalNote
    completedAt
    createdAt
    id
    nurse {
      createdAt
      email
      id
      locationLat
      locationLng
      name
      role
      skills
      tenantId
      updatedAt
      __typename
    }
    nurseId
    patient {
      address
      age
      createdAt
      diagnosis
      documentId
      id
      name
      tenantId
      updatedAt
      __typename
    }
    patientId
    scheduledTime
    startLat
    startLng
    startedAt
    status
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetShiftQueryVariables, APITypes.GetShiftQuery>;
export const getTenant = /* GraphQL */ `query GetTenant($id: ID!) {
  getTenant(id: $id) {
    billingRecords {
      nextToken
      __typename
    }
    createdAt
    id
    inventory {
      nextToken
      __typename
    }
    name
    nit
    nurses {
      nextToken
      __typename
    }
    patients {
      nextToken
      __typename
    }
    shifts {
      nextToken
      __typename
    }
    updatedAt
    vitalSigns {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTenantQueryVariables, APITypes.GetTenantQuery>;
export const getVitalSigns = /* GraphQL */ `query GetVitalSigns($id: ID!) {
  getVitalSigns(id: $id) {
    createdAt
    date
    dia
    hr
    id
    note
    patient {
      address
      age
      createdAt
      diagnosis
      documentId
      id
      name
      tenantId
      updatedAt
      __typename
    }
    patientId
    spo2
    sys
    temperature
    tenant {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    tenantId
    updatedAt
    weight
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetVitalSignsQueryVariables,
  APITypes.GetVitalSignsQuery
>;
export const listBillingRecords = /* GraphQL */ `query ListBillingRecords(
  $filter: ModelBillingRecordFilterInput
  $limit: Int
  $nextToken: String
) {
  listBillingRecords(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      approvedAt
      createdAt
      date
      diagnosis
      eps
      glosaDefense
      id
      patientId
      procedures
      rejectionReason
      ripsGenerated
      shiftId
      status
      submittedAt
      tenantId
      totalAmount
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBillingRecordsQueryVariables,
  APITypes.ListBillingRecordsQuery
>;
export const listInventoryItems = /* GraphQL */ `query ListInventoryItems(
  $filter: ModelInventoryItemFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      expiryDate
      id
      name
      quantity
      reorderLevel
      sku
      status
      tenantId
      unit
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryItemsQueryVariables,
  APITypes.ListInventoryItemsQuery
>;
export const listNurses = /* GraphQL */ `query ListNurses(
  $filter: ModelNurseFilterInput
  $limit: Int
  $nextToken: String
) {
  listNurses(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      email
      id
      locationLat
      locationLng
      name
      role
      skills
      tenantId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListNursesQueryVariables,
  APITypes.ListNursesQuery
>;
export const listPatients = /* GraphQL */ `query ListPatients(
  $filter: ModelPatientFilterInput
  $limit: Int
  $nextToken: String
) {
  listPatients(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      address
      age
      createdAt
      diagnosis
      documentId
      id
      name
      tenantId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPatientsQueryVariables,
  APITypes.ListPatientsQuery
>;
export const listShifts = /* GraphQL */ `query ListShifts(
  $filter: ModelShiftFilterInput
  $limit: Int
  $nextToken: String
) {
  listShifts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      clinicalNote
      completedAt
      createdAt
      id
      nurseId
      patientId
      scheduledTime
      startLat
      startLng
      startedAt
      status
      tenantId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListShiftsQueryVariables,
  APITypes.ListShiftsQuery
>;
export const listTenants = /* GraphQL */ `query ListTenants(
  $filter: ModelTenantFilterInput
  $limit: Int
  $nextToken: String
) {
  listTenants(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      id
      name
      nit
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTenantsQueryVariables,
  APITypes.ListTenantsQuery
>;
export const listVitalSigns = /* GraphQL */ `query ListVitalSigns(
  $filter: ModelVitalSignsFilterInput
  $limit: Int
  $nextToken: String
) {
  listVitalSigns(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      date
      dia
      hr
      id
      note
      patientId
      spo2
      sys
      temperature
      tenantId
      updatedAt
      weight
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListVitalSignsQueryVariables,
  APITypes.ListVitalSignsQuery
>;
export const validateRIPS = /* GraphQL */ `query ValidateRIPS($billingRecord: AWSJSON) {
  validateRIPS(billingRecord: $billingRecord)
}
` as GeneratedQuery<
  APITypes.ValidateRIPSQueryVariables,
  APITypes.ValidateRIPSQuery
>;

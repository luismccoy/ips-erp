/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createBillingRecord = /* GraphQL */ `mutation CreateBillingRecord(
  $condition: ModelBillingRecordConditionInput
  $input: CreateBillingRecordInput!
) {
  createBillingRecord(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateBillingRecordMutationVariables,
  APITypes.CreateBillingRecordMutation
>;
export const createInventoryItem = /* GraphQL */ `mutation CreateInventoryItem(
  $condition: ModelInventoryItemConditionInput
  $input: CreateInventoryItemInput!
) {
  createInventoryItem(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateInventoryItemMutationVariables,
  APITypes.CreateInventoryItemMutation
>;
export const createNurse = /* GraphQL */ `mutation CreateNurse(
  $condition: ModelNurseConditionInput
  $input: CreateNurseInput!
) {
  createNurse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateNurseMutationVariables,
  APITypes.CreateNurseMutation
>;
export const createPatient = /* GraphQL */ `mutation CreatePatient(
  $condition: ModelPatientConditionInput
  $input: CreatePatientInput!
) {
  createPatient(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreatePatientMutationVariables,
  APITypes.CreatePatientMutation
>;
export const createShift = /* GraphQL */ `mutation CreateShift(
  $condition: ModelShiftConditionInput
  $input: CreateShiftInput!
) {
  createShift(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateShiftMutationVariables,
  APITypes.CreateShiftMutation
>;
export const createTenant = /* GraphQL */ `mutation CreateTenant(
  $condition: ModelTenantConditionInput
  $input: CreateTenantInput!
) {
  createTenant(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateTenantMutationVariables,
  APITypes.CreateTenantMutation
>;
export const createVitalSigns = /* GraphQL */ `mutation CreateVitalSigns(
  $condition: ModelVitalSignsConditionInput
  $input: CreateVitalSignsInput!
) {
  createVitalSigns(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateVitalSignsMutationVariables,
  APITypes.CreateVitalSignsMutation
>;
export const deleteBillingRecord = /* GraphQL */ `mutation DeleteBillingRecord(
  $condition: ModelBillingRecordConditionInput
  $input: DeleteBillingRecordInput!
) {
  deleteBillingRecord(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteBillingRecordMutationVariables,
  APITypes.DeleteBillingRecordMutation
>;
export const deleteInventoryItem = /* GraphQL */ `mutation DeleteInventoryItem(
  $condition: ModelInventoryItemConditionInput
  $input: DeleteInventoryItemInput!
) {
  deleteInventoryItem(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteInventoryItemMutationVariables,
  APITypes.DeleteInventoryItemMutation
>;
export const deleteNurse = /* GraphQL */ `mutation DeleteNurse(
  $condition: ModelNurseConditionInput
  $input: DeleteNurseInput!
) {
  deleteNurse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteNurseMutationVariables,
  APITypes.DeleteNurseMutation
>;
export const deletePatient = /* GraphQL */ `mutation DeletePatient(
  $condition: ModelPatientConditionInput
  $input: DeletePatientInput!
) {
  deletePatient(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeletePatientMutationVariables,
  APITypes.DeletePatientMutation
>;
export const deleteShift = /* GraphQL */ `mutation DeleteShift(
  $condition: ModelShiftConditionInput
  $input: DeleteShiftInput!
) {
  deleteShift(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteShiftMutationVariables,
  APITypes.DeleteShiftMutation
>;
export const deleteTenant = /* GraphQL */ `mutation DeleteTenant(
  $condition: ModelTenantConditionInput
  $input: DeleteTenantInput!
) {
  deleteTenant(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteTenantMutationVariables,
  APITypes.DeleteTenantMutation
>;
export const deleteVitalSigns = /* GraphQL */ `mutation DeleteVitalSigns(
  $condition: ModelVitalSignsConditionInput
  $input: DeleteVitalSignsInput!
) {
  deleteVitalSigns(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteVitalSignsMutationVariables,
  APITypes.DeleteVitalSignsMutation
>;
export const updateBillingRecord = /* GraphQL */ `mutation UpdateBillingRecord(
  $condition: ModelBillingRecordConditionInput
  $input: UpdateBillingRecordInput!
) {
  updateBillingRecord(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateBillingRecordMutationVariables,
  APITypes.UpdateBillingRecordMutation
>;
export const updateInventoryItem = /* GraphQL */ `mutation UpdateInventoryItem(
  $condition: ModelInventoryItemConditionInput
  $input: UpdateInventoryItemInput!
) {
  updateInventoryItem(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateInventoryItemMutationVariables,
  APITypes.UpdateInventoryItemMutation
>;
export const updateNurse = /* GraphQL */ `mutation UpdateNurse(
  $condition: ModelNurseConditionInput
  $input: UpdateNurseInput!
) {
  updateNurse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateNurseMutationVariables,
  APITypes.UpdateNurseMutation
>;
export const updatePatient = /* GraphQL */ `mutation UpdatePatient(
  $condition: ModelPatientConditionInput
  $input: UpdatePatientInput!
) {
  updatePatient(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdatePatientMutationVariables,
  APITypes.UpdatePatientMutation
>;
export const updateShift = /* GraphQL */ `mutation UpdateShift(
  $condition: ModelShiftConditionInput
  $input: UpdateShiftInput!
) {
  updateShift(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateShiftMutationVariables,
  APITypes.UpdateShiftMutation
>;
export const updateTenant = /* GraphQL */ `mutation UpdateTenant(
  $condition: ModelTenantConditionInput
  $input: UpdateTenantInput!
) {
  updateTenant(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateTenantMutationVariables,
  APITypes.UpdateTenantMutation
>;
export const updateVitalSigns = /* GraphQL */ `mutation UpdateVitalSigns(
  $condition: ModelVitalSignsConditionInput
  $input: UpdateVitalSignsInput!
) {
  updateVitalSigns(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateVitalSignsMutationVariables,
  APITypes.UpdateVitalSignsMutation
>;

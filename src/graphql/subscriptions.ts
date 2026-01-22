/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateBillingRecord = /* GraphQL */ `subscription OnCreateBillingRecord(
  $filter: ModelSubscriptionBillingRecordFilterInput
  $tenantId: String
) {
  onCreateBillingRecord(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBillingRecordSubscriptionVariables,
  APITypes.OnCreateBillingRecordSubscription
>;
export const onCreateInventoryItem = /* GraphQL */ `subscription OnCreateInventoryItem(
  $filter: ModelSubscriptionInventoryItemFilterInput
  $tenantId: String
) {
  onCreateInventoryItem(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryItemSubscriptionVariables,
  APITypes.OnCreateInventoryItemSubscription
>;
export const onCreateNurse = /* GraphQL */ `subscription OnCreateNurse(
  $filter: ModelSubscriptionNurseFilterInput
  $tenantId: String
) {
  onCreateNurse(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateNurseSubscriptionVariables,
  APITypes.OnCreateNurseSubscription
>;
export const onCreatePatient = /* GraphQL */ `subscription OnCreatePatient(
  $filter: ModelSubscriptionPatientFilterInput
  $tenantId: String
) {
  onCreatePatient(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePatientSubscriptionVariables,
  APITypes.OnCreatePatientSubscription
>;
export const onCreateShift = /* GraphQL */ `subscription OnCreateShift(
  $filter: ModelSubscriptionShiftFilterInput
  $tenantId: String
) {
  onCreateShift(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateShiftSubscriptionVariables,
  APITypes.OnCreateShiftSubscription
>;
export const onCreateTenant = /* GraphQL */ `subscription OnCreateTenant($filter: ModelSubscriptionTenantFilterInput) {
  onCreateTenant(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTenantSubscriptionVariables,
  APITypes.OnCreateTenantSubscription
>;
export const onCreateVitalSigns = /* GraphQL */ `subscription OnCreateVitalSigns(
  $filter: ModelSubscriptionVitalSignsFilterInput
  $tenantId: String
) {
  onCreateVitalSigns(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateVitalSignsSubscriptionVariables,
  APITypes.OnCreateVitalSignsSubscription
>;
export const onDeleteBillingRecord = /* GraphQL */ `subscription OnDeleteBillingRecord(
  $filter: ModelSubscriptionBillingRecordFilterInput
  $tenantId: String
) {
  onDeleteBillingRecord(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBillingRecordSubscriptionVariables,
  APITypes.OnDeleteBillingRecordSubscription
>;
export const onDeleteInventoryItem = /* GraphQL */ `subscription OnDeleteInventoryItem(
  $filter: ModelSubscriptionInventoryItemFilterInput
  $tenantId: String
) {
  onDeleteInventoryItem(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryItemSubscriptionVariables,
  APITypes.OnDeleteInventoryItemSubscription
>;
export const onDeleteNurse = /* GraphQL */ `subscription OnDeleteNurse(
  $filter: ModelSubscriptionNurseFilterInput
  $tenantId: String
) {
  onDeleteNurse(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteNurseSubscriptionVariables,
  APITypes.OnDeleteNurseSubscription
>;
export const onDeletePatient = /* GraphQL */ `subscription OnDeletePatient(
  $filter: ModelSubscriptionPatientFilterInput
  $tenantId: String
) {
  onDeletePatient(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePatientSubscriptionVariables,
  APITypes.OnDeletePatientSubscription
>;
export const onDeleteShift = /* GraphQL */ `subscription OnDeleteShift(
  $filter: ModelSubscriptionShiftFilterInput
  $tenantId: String
) {
  onDeleteShift(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteShiftSubscriptionVariables,
  APITypes.OnDeleteShiftSubscription
>;
export const onDeleteTenant = /* GraphQL */ `subscription OnDeleteTenant($filter: ModelSubscriptionTenantFilterInput) {
  onDeleteTenant(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTenantSubscriptionVariables,
  APITypes.OnDeleteTenantSubscription
>;
export const onDeleteVitalSigns = /* GraphQL */ `subscription OnDeleteVitalSigns(
  $filter: ModelSubscriptionVitalSignsFilterInput
  $tenantId: String
) {
  onDeleteVitalSigns(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteVitalSignsSubscriptionVariables,
  APITypes.OnDeleteVitalSignsSubscription
>;
export const onUpdateBillingRecord = /* GraphQL */ `subscription OnUpdateBillingRecord(
  $filter: ModelSubscriptionBillingRecordFilterInput
  $tenantId: String
) {
  onUpdateBillingRecord(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBillingRecordSubscriptionVariables,
  APITypes.OnUpdateBillingRecordSubscription
>;
export const onUpdateInventoryItem = /* GraphQL */ `subscription OnUpdateInventoryItem(
  $filter: ModelSubscriptionInventoryItemFilterInput
  $tenantId: String
) {
  onUpdateInventoryItem(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryItemSubscriptionVariables,
  APITypes.OnUpdateInventoryItemSubscription
>;
export const onUpdateNurse = /* GraphQL */ `subscription OnUpdateNurse(
  $filter: ModelSubscriptionNurseFilterInput
  $tenantId: String
) {
  onUpdateNurse(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateNurseSubscriptionVariables,
  APITypes.OnUpdateNurseSubscription
>;
export const onUpdatePatient = /* GraphQL */ `subscription OnUpdatePatient(
  $filter: ModelSubscriptionPatientFilterInput
  $tenantId: String
) {
  onUpdatePatient(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePatientSubscriptionVariables,
  APITypes.OnUpdatePatientSubscription
>;
export const onUpdateShift = /* GraphQL */ `subscription OnUpdateShift(
  $filter: ModelSubscriptionShiftFilterInput
  $tenantId: String
) {
  onUpdateShift(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateShiftSubscriptionVariables,
  APITypes.OnUpdateShiftSubscription
>;
export const onUpdateTenant = /* GraphQL */ `subscription OnUpdateTenant($filter: ModelSubscriptionTenantFilterInput) {
  onUpdateTenant(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTenantSubscriptionVariables,
  APITypes.OnUpdateTenantSubscription
>;
export const onUpdateVitalSigns = /* GraphQL */ `subscription OnUpdateVitalSigns(
  $filter: ModelSubscriptionVitalSignsFilterInput
  $tenantId: String
) {
  onUpdateVitalSigns(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateVitalSignsSubscriptionVariables,
  APITypes.OnUpdateVitalSignsSubscription
>;

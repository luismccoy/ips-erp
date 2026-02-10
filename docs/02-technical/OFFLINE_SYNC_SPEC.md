# IPS-ERP Offline Sync Specification

**Version:** 1.0  
**Date:** 2026-01-26  
**Author:** Offline Architecture Specialist  
**Status:** Draft - Pending Review

---

## Executive Summary

This specification defines the offline-first architecture for the IPS-ERP Nurse App. Nurses working in remote Colombian areas with unreliable internet need to document patient visits (KARDEX, vital signs, medications, clinical assessments) while offline, with automatic synchronization when connectivity returns.

### Key Requirements
- **Zero data loss** during offline periods
- **Automatic sync** when connectivity returns
- **Conflict resolution** for concurrent edits
- **Clear UI feedback** for offline/syncing states
- **PWA installation** for mobile devices

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Service Worker Setup (Workbox)](#2-service-worker-setup-workbox)
3. [IndexedDB Schema](#3-indexeddb-schema)
4. [Models Requiring Offline Support](#4-models-requiring-offline-support)
5. [Sync Strategy](#5-sync-strategy)
6. [Conflict Resolution](#6-conflict-resolution)
7. [Network Status Detection](#7-network-status-detection)
8. [UI Indicators](#8-ui-indicators)
9. [Implementation Plan](#9-implementation-plan)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Architecture Overview

### Current State Analysis

The IPS-ERP Nurse App currently uses:
- **Frontend:** React + Vite + TypeScript
- **Backend:** AWS Amplify Gen 2 with AppSync GraphQL
- **Data Layer:** Direct GraphQL client (`aws-amplify/data`)
- **Auth:** Cognito User Pools with custom claims (`custom:tenantId`)

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NURSE APP (PWA)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   React UI  │◄──►│ Offline     │◄──►│   IndexedDB         │  │
│  │ Components  │    │ Service     │    │   (Local Store)     │  │
│  └─────────────┘    │ Layer       │    └─────────────────────┘  │
│                     └──────┬──────┘                              │
│                            │                                     │
│                     ┌──────▼──────┐                              │
│                     │  Sync Queue │                              │
│                     │  (Pending   │                              │
│                     │   Mutations)│                              │
│                     └──────┬──────┘                              │
├────────────────────────────┼────────────────────────────────────┤
│  Service Worker (Workbox)  │                                     │
│  ┌─────────────────────────┼────────────────────────────────┐   │
│  │  Cache Strategy         │  Background Sync               │   │
│  │  - App Shell (Cache)    │  - Mutation Queue              │   │
│  │  - API (Network First)  │  - Retry Logic                 │   │
│  │  - Assets (Stale-While) │  - Conflict Detection          │   │
│  └─────────────────────────┼────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    ═════════▼═════════  (Network Boundary)
                             │
            ┌────────────────┴────────────────┐
            │        AWS AppSync              │
            │    (GraphQL + Real-time)        │
            └────────────────┬────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │        DynamoDB Tables          │
            │   (Multi-tenant, GSI-enabled)   │
            └─────────────────────────────────┘
```

### Technology Decision: AWS Amplify DataStore vs Custom IndexedDB

| Aspect | Amplify DataStore | Custom IndexedDB + Workbox |
|--------|-------------------|----------------------------|
| **Setup Complexity** | Low (managed) | Medium (custom code) |
| **Control** | Limited | Full control |
| **Conflict Resolution** | Built-in (Auto-merge, Optimistic, Custom) | Must implement |
| **Gen 2 Support** | Partial (Gen 1 patterns) | N/A |
| **Bundle Size** | ~100KB | ~40KB |
| **Offline Mutations** | Automatic queue | Manual queue |
| **Schema Coupling** | Requires code generation | Flexible |

**Recommendation:** **AWS Amplify DataStore** for the following reasons:
1. Built-in conflict resolution critical for healthcare data
2. Automatic sync queue management
3. Works with existing Amplify Gen 2 backend
4. Proven in production healthcare apps
5. Reduces custom code maintenance

---

## 2. Service Worker Setup (Workbox)

### 2.1 Installation

```bash
npm install workbox-webpack-plugin workbox-window --save-dev
npm install workbox-precaching workbox-routing workbox-strategies --save
```

### 2.2 Vite Configuration

Create `vite.config.ts` updates:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'IPS ERP - Nurse App',
        short_name: 'IPS Nurse',
        description: 'Home care nursing documentation app',
        theme_color: '#2563eb',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?app=nurse',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // App Shell - Cache First
            urlPattern: /^https:\/\/main\.d2wwgecog8smmr\.amplifyapp\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // GraphQL API - Network First with Offline Fallback
            urlPattern: /^https:\/\/.*\.appsync-api\..*\.amazonaws\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Static Assets - Stale While Revalidate
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Fonts
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

### 2.3 Service Worker Registration

```typescript
// src/sw-register.ts
import { registerSW } from 'virtual:pwa-register';

export const updateSW = registerSW({
  onNeedRefresh() {
    // Show "New version available" toast
    if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // Show "App ready for offline use" toast
    console.log('🟢 App lista para uso sin conexión');
  },
  onRegistered(r) {
    // Check for updates every hour
    r && setInterval(() => {
      r.update();
    }, 60 * 60 * 1000);
  },
  onRegisterError(error) {
    console.error('SW registration error:', error);
  }
});
```

---

## 3. IndexedDB Schema

### 3.1 Database Structure

Using Amplify DataStore, the following IndexedDB structure will be created automatically:

```
IPS_ERP_DB
├── Patients (local cache)
├── Shifts (local cache)
├── Visits (local + pending mutations)
├── VitalSigns (local + pending mutations)
├── PatientAssessments (local + pending mutations)
├── MutationQueue (pending sync operations)
└── SyncMetadata (sync state tracking)
```

### 3.2 Manual IndexedDB Schema (If Custom Implementation)

```typescript
// src/offline/db-schema.ts
export interface OfflineDBSchema {
  // Readonly cache (synced from cloud)
  patients: {
    key: string; // id
    value: Patient;
    indexes: {
      'by-tenant': string; // tenantId
    };
  };
  
  shifts: {
    key: string; // id
    value: Shift;
    indexes: {
      'by-tenant': string;
      'by-nurse': string; // nurseId
      'by-date': string; // scheduledTime
    };
  };
  
  // Read-write (nurse creates/edits)
  visits: {
    key: string; // id (same as shiftId)
    value: Visit & { _localVersion: number; _syncStatus: SyncStatus };
    indexes: {
      'by-tenant': string;
      'by-shift': string;
      'by-status': string;
      'by-sync-status': SyncStatus;
    };
  };
  
  vitalSigns: {
    key: string; // id
    value: VitalSigns & { _localVersion: number; _syncStatus: SyncStatus };
    indexes: {
      'by-tenant': string;
      'by-patient': string;
      'by-date': string;
    };
  };
  
  patientAssessments: {
    key: string; // id
    value: PatientAssessment & { _localVersion: number; _syncStatus: SyncStatus };
    indexes: {
      'by-tenant': string;
      'by-patient': string;
      'by-assessed-at': string;
    };
  };
  
  // Sync management
  mutationQueue: {
    key: string; // uuid
    value: PendingMutation;
    indexes: {
      'by-model': string;
      'by-created-at': string;
    };
  };
  
  syncMetadata: {
    key: string; // model name
    value: {
      lastSyncTime: string;
      lastSyncToken: string | null;
    };
  };
}

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface PendingMutation {
  id: string;
  modelName: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}
```

### 3.3 Storage Limits

| Browser | IndexedDB Limit | Recommended Max |
|---------|-----------------|-----------------|
| Chrome | 80% of disk | 50MB |
| Safari | 1GB | 50MB |
| Firefox | 50% of disk | 50MB |

**Retention Policy:**
- Keep last 30 days of visits locally
- Keep last 7 days of vital signs
- Keep last 14 days of assessments
- Purge synced data older than retention period

---

## 4. Models Requiring Offline Support

### 4.1 Priority Matrix

| Model | Read Offline | Write Offline | Sync Priority | Rationale |
|-------|--------------|---------------|---------------|-----------|
| **Shift** | ✅ Required | ❌ Admin only | High | Nurse needs to see assigned shifts |
| **Patient** | ✅ Required | ❌ Admin only | High | Patient info for visit documentation |
| **Visit** | ✅ Required | ✅ **Critical** | **Immediate** | Core nursing documentation |
| **VitalSigns** | ✅ Required | ✅ **Critical** | **Immediate** | Clinical measurements |
| **PatientAssessment** | ✅ Required | ✅ **Critical** | **Immediate** | Clinical scales (Glasgow, Braden, etc.) |
| Nurse | ✅ Required | ❌ No | Medium | Self-profile reference |
| Notification | ✅ Required | ❌ Read-only | Low | Approval/rejection alerts |
| InventoryItem | ⚪ Optional | ❌ No | Low | Not critical for field work |
| BillingRecord | ❌ No | ❌ No | N/A | Admin function only |

### 4.2 Data Flow by Model

#### Visit Model (Critical Path)

```
┌──────────────────────────────────────────────────────────────────┐
│                    VISIT OFFLINE WORKFLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Nurse completes shift (status: COMPLETED)                    │
│     │                                                             │
│     ▼                                                             │
│  2. Nurse clicks "Start Documentation"                           │
│     │                                                             │
│     ├──► [ONLINE] Call createVisitDraftFromShift mutation        │
│     │              Save response to IndexedDB                     │
│     │                                                             │
│     └──► [OFFLINE] Create local Visit with _syncStatus: 'pending'│
│                    Add to MutationQueue                          │
│                    Show optimistic UI                            │
│     │                                                             │
│     ▼                                                             │
│  3. Nurse fills KARDEX, vitals, medications, tasks               │
│     │ (Auto-save every 30 seconds to IndexedDB)                  │
│     │                                                             │
│     ▼                                                             │
│  4. Nurse clicks "Submit for Review"                             │
│     │                                                             │
│     ├──► [ONLINE] Call submitVisit mutation                      │
│     │              Update IndexedDB status to SUBMITTED          │
│     │                                                             │
│     └──► [OFFLINE] Update local Visit.status to SUBMITTED        │
│                    Add submitVisit to MutationQueue              │
│                    Show "Will sync when online" message          │
│     │                                                             │
│     ▼                                                             │
│  5. Connection restored                                          │
│     │                                                             │
│     ▼                                                             │
│  6. Background Sync processes MutationQueue                      │
│     - Execute mutations in order                                 │
│     - Handle conflicts (see Section 6)                           │
│     - Update _syncStatus to 'synced'                             │
│     - Show success notification                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### VitalSigns Model

```typescript
// Offline-capable vital signs creation
async function recordVitals(vitals: VitalsInput): Promise<VitalSigns> {
  const record = {
    id: uuid(),
    ...vitals,
    date: new Date().toISOString(),
    _localVersion: 1,
    _syncStatus: 'pending' as SyncStatus,
    _createdOffline: true
  };
  
  // Save to IndexedDB immediately
  await db.vitalSigns.add(record);
  
  // Queue for sync
  await db.mutationQueue.add({
    id: uuid(),
    modelName: 'VitalSigns',
    operation: 'create',
    data: record,
    createdAt: new Date().toISOString(),
    retryCount: 0
  });
  
  return record;
}
```

---

## 5. Sync Strategy

### 5.1 Initial Sync (Cold Start)

When the app first loads or after `DataStore.clear()`:

```typescript
// src/offline/initial-sync.ts
async function performInitialSync(nurseId: string, tenantId: string): Promise<void> {
  // 1. Sync nurse's assigned shifts (today + next 7 days)
  const shifts = await DataStore.query(Shift, (s) =>
    s.and(shift => [
      shift.nurseId.eq(nurseId),
      shift.tenantId.eq(tenantId),
      shift.scheduledTime.ge(getStartOfDay()),
      shift.scheduledTime.le(addDays(new Date(), 7).toISOString())
    ])
  );
  
  // 2. Sync patients for those shifts
  const patientIds = [...new Set(shifts.map(s => s.patientId))];
  for (const patientId of patientIds) {
    await DataStore.query(Patient, patientId);
  }
  
  // 3. Sync existing visits for those shifts
  for (const shift of shifts) {
    await DataStore.query(Visit, (v) => v.shiftId.eq(shift.id));
  }
  
  // 4. Sync recent vital signs for patients
  for (const patientId of patientIds) {
    await DataStore.query(VitalSigns, (vs) =>
      vs.and(v => [
        v.patientId.eq(patientId),
        v.date.ge(addDays(new Date(), -30).toISOString())
      ])
    );
  }
}
```

### 5.2 Delta Sync (Incremental Updates)

Using AppSync subscriptions when online:

```typescript
// src/offline/delta-sync.ts
function setupDeltaSync(): () => void {
  const subscriptions: (() => void)[] = [];
  
  // Subscribe to shift changes
  subscriptions.push(
    DataStore.observe(Shift).subscribe(msg => {
      if (msg.opType === 'UPDATE' && msg.element.nurseId === currentNurseId) {
        // Shift assigned/updated - refresh UI
        notifyShiftChange(msg.element);
      }
    }).unsubscribe
  );
  
  // Subscribe to visit status changes (approval/rejection)
  subscriptions.push(
    DataStore.observe(Visit).subscribe(msg => {
      if (msg.opType === 'UPDATE' && msg.element.nurseId === currentNurseId) {
        if (msg.element.status === 'APPROVED') {
          showNotification('✅ Visita aprobada');
        } else if (msg.element.status === 'REJECTED') {
          showNotification(`❌ Visita rechazada: ${msg.element.rejectionReason}`);
        }
      }
    }).unsubscribe
  );
  
  return () => subscriptions.forEach(unsub => unsub());
}
```

### 5.3 Background Sync Implementation

```typescript
// src/offline/background-sync.ts
class BackgroundSyncManager {
  private isProcessing = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  async processMutationQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;
    
    this.isProcessing = true;
    
    try {
      const pendingMutations = await db.mutationQueue
        .where('retryCount')
        .below(5) // Max retries
        .sortBy('createdAt');
      
      for (const mutation of pendingMutations) {
        try {
          await this.executeMutation(mutation);
          await db.mutationQueue.delete(mutation.id);
          
          // Update sync status on the model
          await this.updateSyncStatus(mutation.modelName, mutation.data.id, 'synced');
          
        } catch (error) {
          await this.handleMutationError(mutation, error);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  private async executeMutation(mutation: PendingMutation): Promise<void> {
    switch (mutation.modelName) {
      case 'Visit':
        if (mutation.operation === 'create') {
          await client.models.Visit.create(mutation.data);
        } else if (mutation.operation === 'update') {
          await client.models.Visit.update(mutation.data);
        }
        break;
        
      case 'VitalSigns':
        await client.models.VitalSigns.create(mutation.data);
        break;
        
      case 'PatientAssessment':
        await client.models.PatientAssessment.create(mutation.data);
        break;
    }
  }
  
  private async handleMutationError(mutation: PendingMutation, error: any): Promise<void> {
    const isConflict = error?.message?.includes('ConflictUnhandled');
    const isAuthError = error?.message?.includes('Unauthorized');
    
    if (isConflict) {
      // Handle conflict - see Section 6
      await this.resolveConflict(mutation, error);
    } else if (isAuthError) {
      // Don't retry auth errors
      await db.mutationQueue.delete(mutation.id);
      await this.updateSyncStatus(mutation.modelName, mutation.data.id, 'error');
    } else {
      // Increment retry counter with exponential backoff
      await db.mutationQueue.update(mutation.id, {
        retryCount: mutation.retryCount + 1,
        lastError: error?.message
      });
      
      // Schedule retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, mutation.retryCount), 60000);
      this.retryTimeouts.set(mutation.id, setTimeout(() => {
        this.processMutationQueue();
      }, delay));
    }
  }
}
```

---

## 6. Conflict Resolution

### 6.1 Conflict Scenarios

| Scenario | Description | Resolution Strategy |
|----------|-------------|---------------------|
| **Same-field edit** | Nurse A and Nurse B edit same KARDEX field offline | Last-Write-Wins (timestamp) |
| **Status transition race** | Nurse submits, Admin rejects, Nurse submits again offline | Server state wins |
| **Deleted record edit** | Admin deletes patient, Nurse adds vitals offline | Reject mutation, notify nurse |
| **Version mismatch** | Local version < server version | Merge non-conflicting fields |

### 6.2 Amplify DataStore Conflict Resolution Configuration

```typescript
// src/offline/datastore-config.ts
import { DataStore, syncExpression } from 'aws-amplify/datastore';
import { Visit, VitalSigns, PatientAssessment } from '../models';

DataStore.configure({
  // Custom conflict handler
  conflictHandler: async (data) => {
    const { modelConstructor, localModel, remoteModel, operation } = data;
    
    // For Visits - CRITICAL: Server state wins for status field
    if (modelConstructor.name === 'Visit') {
      // If server has status APPROVED or REJECTED, don't overwrite
      if (['APPROVED', 'REJECTED'].includes(remoteModel.status)) {
        return {
          type: 'DISCARD', // Discard local changes
        };
      }
      
      // Otherwise, merge: keep local clinical data, server metadata
      return {
        type: 'RETRY',
        newModel: {
          ...remoteModel,
          kardex: localModel.kardex, // Keep local clinical notes
          vitalsRecorded: localModel.vitalsRecorded,
          medicationsAdministered: localModel.medicationsAdministered,
          tasksCompleted: localModel.tasksCompleted,
          _version: remoteModel._version // Use server version
        }
      };
    }
    
    // For VitalSigns - Always keep local (nurse measurements are authoritative)
    if (modelConstructor.name === 'VitalSigns') {
      return {
        type: 'RETRY',
        newModel: {
          ...localModel,
          _version: remoteModel._version
        }
      };
    }
    
    // For PatientAssessments - Same as VitalSigns
    if (modelConstructor.name === 'PatientAssessment') {
      return {
        type: 'RETRY',
        newModel: {
          ...localModel,
          _version: remoteModel._version
        }
      };
    }
    
    // Default: Auto-merge
    return { type: 'AUTOMERGE' };
  },
  
  // Selective sync - only nurse's data
  syncExpressions: [
    syncExpression(Visit, () => {
      return (v) => v.nurseId.eq(getCurrentNurseId());
    }),
    syncExpression(Shift, () => {
      return (s) => s.nurseId.eq(getCurrentNurseId());
    })
  ],
  
  // Error handler
  errorHandler: (error) => {
    console.error('DataStore sync error:', error);
    
    if (error.errorType === 'Unauthorized') {
      // Token expired - trigger re-auth
      signOut();
    }
  },
  
  // Full sync when app starts
  fullSyncInterval: 24 * 60, // 24 hours
});
```

### 6.3 Manual Conflict Resolution UI

For edge cases where automatic resolution isn't appropriate:

```typescript
// src/components/ConflictResolutionModal.tsx
interface ConflictResolutionModalProps {
  localData: Visit;
  remoteData: Visit;
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void;
}

function ConflictResolutionModal({ localData, remoteData, onResolve }: ConflictResolutionModalProps) {
  return (
    <Modal title="Conflicto de Sincronización">
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
        <AlertTriangle className="text-yellow-400" />
        <p>Esta visita fue modificada por otro usuario mientras estabas desconectado.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <h4 className="font-bold mb-2">Tu versión (local)</h4>
          <p className="text-sm text-slate-400">
            Última modificación: {formatDate(localData.updatedAt)}
          </p>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(localData.kardex, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-slate-800 rounded-lg">
          <h4 className="font-bold mb-2">Versión del servidor</h4>
          <p className="text-sm text-slate-400">
            Última modificación: {formatDate(remoteData.updatedAt)}
          </p>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(remoteData.kardex, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onResolve('local')} variant="primary">
          Usar Mi Versión
        </Button>
        <Button onClick={() => onResolve('remote')} variant="secondary">
          Usar Versión del Servidor
        </Button>
        <Button onClick={() => onResolve('merge')} variant="outline">
          Combinar Cambios
        </Button>
      </div>
    </Modal>
  );
}
```

---

## 7. Network Status Detection

### 7.1 Network Status Hook

```typescript
// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'slow';

interface NetworkState {
  status: NetworkStatus;
  effectiveType: string | null; // '4g', '3g', '2g', 'slow-2g'
  downlink: number | null; // Mbps
  rtt: number | null; // Round-trip time in ms
  saveData: boolean;
}

export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>(() => ({
    status: navigator.onLine ? 'online' : 'offline',
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false
  }));
  
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    let status: NetworkStatus = navigator.onLine ? 'online' : 'offline';
    
    if (connection && navigator.onLine) {
      // Detect slow connection
      if (connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.rtt > 500 ||
          connection.downlink < 0.5) {
        status = 'slow';
      }
    }
    
    setState({
      status,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false
    });
  }, []);
  
  useEffect(() => {
    updateNetworkInfo();
    
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);
  
  return state;
}
```

### 7.2 Network-Aware Data Fetching

```typescript
// src/hooks/useOfflineFirst.ts
import { useNetworkStatus } from './useNetworkStatus';
import { useCallback, useState } from 'react';

interface UseOfflineFirstOptions<T> {
  queryFn: () => Promise<T>;
  localFallback: () => Promise<T>;
  cacheKey: string;
}

export function useOfflineFirst<T>({ queryFn, localFallback, cacheKey }: UseOfflineFirstOptions<T>) {
  const { status } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<'network' | 'cache' | null>(null);
  
  const fetch = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (status === 'online') {
        // Try network first
        try {
          const result = await Promise.race([
            queryFn(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]);
          
          setData(result);
          setSource('network');
          
          // Cache for offline
          await cacheData(cacheKey, result);
          
          return result;
        } catch (networkError) {
          // Fall back to cache
          console.warn('Network failed, using cache:', networkError);
        }
      }
      
      // Offline or network failed - use local
      const cached = await localFallback();
      setData(cached);
      setSource('cache');
      
      return cached;
    } finally {
      setIsLoading(false);
    }
  }, [status, queryFn, localFallback, cacheKey]);
  
  return { data, isLoading, source, fetch };
}
```

---

## 8. UI Indicators

### 8.1 Global Offline Banner

```typescript
// src/components/OfflineBanner.tsx
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';

export function OfflineBanner() {
  const { status: network } = useNetworkStatus();
  const { pendingCount, isSyncing, lastSyncTime } = useSyncStatus();
  
  if (network === 'online' && pendingCount === 0) {
    return null; // Don't show when fully synced
  }
  
  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium
      ${network === 'offline' 
        ? 'bg-red-600 text-white' 
        : network === 'slow'
        ? 'bg-yellow-600 text-white'
        : 'bg-blue-600 text-white'}
    `}>
      <div className="flex items-center justify-center gap-2">
        {network === 'offline' ? (
          <>
            <WifiOff size={16} />
            <span>Sin conexión - Los cambios se guardan localmente</span>
          </>
        ) : network === 'slow' ? (
          <>
            <Wifi size={16} className="opacity-50" />
            <span>Conexión lenta - Modo ahorro de datos activado</span>
          </>
        ) : isSyncing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Sincronizando {pendingCount} cambios...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <Cloud size={16} />
            <span>{pendingCount} cambios pendientes de sincronizar</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
```

### 8.2 Sync Status Badge

```typescript
// src/components/SyncStatusBadge.tsx
interface SyncStatusBadgeProps {
  syncStatus: 'synced' | 'pending' | 'error';
  size?: 'sm' | 'md';
}

export function SyncStatusBadge({ syncStatus, size = 'sm' }: SyncStatusBadgeProps) {
  const config = {
    synced: {
      icon: <CloudCheck size={size === 'sm' ? 12 : 16} />,
      label: 'Sincronizado',
      className: 'text-green-400'
    },
    pending: {
      icon: <CloudUpload size={size === 'sm' ? 12 : 16} />,
      label: 'Pendiente',
      className: 'text-yellow-400'
    },
    error: {
      icon: <CloudOff size={size === 'sm' ? 12 : 16} />,
      label: 'Error de sync',
      className: 'text-red-400'
    }
  };
  
  const { icon, label, className } = config[syncStatus];
  
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={label}>
      {icon}
      {size === 'md' && <span className="text-xs">{label}</span>}
    </span>
  );
}
```

### 8.3 Visit Card with Sync Status

```typescript
// Enhanced shift card showing sync status
function ShiftCard({ shift }: { shift: ShiftWithVisit }) {
  const visit = shift.visit;
  const syncStatus = visit?._syncStatus || 'synced';
  
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <div className="flex justify-between items-start">
        <h3 className="font-bold">{shift.patientName}</h3>
        <div className="flex items-center gap-2">
          <SyncStatusBadge syncStatus={syncStatus} />
          <VisitStatusBadge status={visit?.status || 'DRAFT'} />
        </div>
      </div>
      
      {/* Show pending indicator */}
      {syncStatus === 'pending' && (
        <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
          <CloudUpload size={12} />
          <span>Se sincronizará cuando haya conexión</span>
        </div>
      )}
      
      {/* Show error with retry button */}
      {syncStatus === 'error' && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
          <div className="flex items-center gap-1 text-red-400 mb-1">
            <AlertCircle size={12} />
            <span>Error al sincronizar</span>
          </div>
          <button 
            onClick={() => retrySync(visit.id)}
            className="text-red-300 underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {/* ... rest of card */}
    </div>
  );
}
```

### 8.4 Sync Progress Indicator

```typescript
// src/components/SyncProgressIndicator.tsx
export function SyncProgressIndicator() {
  const { pendingCount, syncedCount, totalCount, isSyncing } = useSyncStatus();
  
  if (!isSyncing || totalCount === 0) return null;
  
  const progress = Math.round((syncedCount / totalCount) * 100);
  
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 p-4 rounded-xl shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 size={16} className="animate-spin text-blue-400" />
        <span className="text-sm font-medium">Sincronizando...</span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-slate-400 mt-1">
        {syncedCount} de {totalCount} completados
      </div>
    </div>
  );
}
```

---

## 9. Implementation Plan

### 9.1 Phase Breakdown

| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| **Phase 1** | PWA Setup (Workbox + Manifest) | 2 days | None |
| **Phase 2** | Amplify DataStore Integration | 3 days | Phase 1 |
| **Phase 3** | Offline Service Layer | 4 days | Phase 2 |
| **Phase 4** | UI Components (Banners, Badges) | 2 days | Phase 3 |
| **Phase 5** | Conflict Resolution | 3 days | Phase 3 |
| **Phase 6** | Testing & QA | 3 days | All |
| **Buffer** | Bug fixes, edge cases | 2 days | Phase 6 |

**Total Estimated Effort: 19 days (~4 weeks)**

### 9.2 Detailed Task Breakdown

#### Phase 1: PWA Setup (2 days)
- [ ] Install vite-plugin-pwa
- [ ] Configure workbox strategies
- [ ] Create PWA manifest
- [ ] Generate app icons (192x192, 512x512)
- [ ] Add apple-touch-icon for iOS
- [ ] Test PWA installation on Android/iOS
- [ ] Add "Install App" prompt

#### Phase 2: Amplify DataStore Integration (3 days)
- [ ] Install @aws-amplify/datastore
- [ ] Generate DataStore models from schema
- [ ] Configure DataStore with auth
- [ ] Set up selective sync expressions
- [ ] Configure conflict handler
- [ ] Add DataStore.start() to app initialization
- [ ] Test basic CRUD operations

#### Phase 3: Offline Service Layer (4 days)
- [ ] Create useNetworkStatus hook
- [ ] Create useSyncStatus hook
- [ ] Implement offline-first data fetching
- [ ] Add mutation queue management
- [ ] Implement background sync logic
- [ ] Add retry with exponential backoff
- [ ] Handle sync errors gracefully

#### Phase 4: UI Components (2 days)
- [ ] Create OfflineBanner component
- [ ] Create SyncStatusBadge component
- [ ] Update ShiftCard with sync status
- [ ] Add sync progress indicator
- [ ] Add "Last synced" timestamp
- [ ] Style for dark mode

#### Phase 5: Conflict Resolution (3 days)
- [ ] Implement conflict detection
- [ ] Create ConflictResolutionModal
- [ ] Add field-level diff view
- [ ] Implement merge logic
- [ ] Add conflict resolution logging
- [ ] Test concurrent edit scenarios

#### Phase 6: Testing & QA (3 days)
- [ ] Unit tests for offline hooks
- [ ] Integration tests with mock network
- [ ] Manual testing on slow networks
- [ ] Test airplane mode scenarios
- [ ] Test large data sync
- [ ] Performance profiling
- [ ] Battery usage testing

### 9.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| DataStore Gen 2 compatibility issues | Medium | High | Fall back to custom IndexedDB if needed |
| iOS Safari IndexedDB bugs | Low | Medium | Implement fallback to localStorage |
| Large dataset sync timeout | Medium | Medium | Implement pagination, selective sync |
| Conflict resolution UX confusion | Medium | Low | User testing, clear messaging |
| Service Worker cache invalidation | Low | High | Version-based cache busting |

---

## 10. Testing Strategy

### 10.1 Test Scenarios

```typescript
// src/__tests__/offline/offline-sync.test.ts
describe('Offline Sync', () => {
  describe('Network Status Detection', () => {
    it('should detect offline state', async () => {
      // Mock navigator.onLine = false
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.status).toBe('offline');
    });
    
    it('should detect slow connection', async () => {
      // Mock connection.effectiveType = '2g'
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.status).toBe('slow');
    });
  });
  
  describe('Mutation Queue', () => {
    it('should queue mutations when offline', async () => {
      // Go offline
      simulateOffline();
      
      // Create visit
      const visit = await createVisitDraft('shift-1');
      
      // Verify queued
      const queue = await db.mutationQueue.toArray();
      expect(queue).toHaveLength(1);
      expect(queue[0].modelName).toBe('Visit');
    });
    
    it('should process queue when online', async () => {
      // Setup: offline mutation
      simulateOffline();
      await createVisitDraft('shift-1');
      
      // Go online
      simulateOnline();
      await backgroundSync.processMutationQueue();
      
      // Verify synced
      const queue = await db.mutationQueue.toArray();
      expect(queue).toHaveLength(0);
    });
  });
  
  describe('Conflict Resolution', () => {
    it('should preserve server status for approved visits', async () => {
      // Server has APPROVED status
      mockServerVisit({ id: 'visit-1', status: 'APPROVED' });
      
      // Local has SUBMITTED status
      await db.visits.put({ id: 'visit-1', status: 'SUBMITTED' });
      
      // Sync
      await backgroundSync.processMutationQueue();
      
      // Server wins
      const visit = await db.visits.get('visit-1');
      expect(visit.status).toBe('APPROVED');
    });
  });
});
```

### 10.2 Manual Test Checklist

#### Offline Creation
- [ ] Create visit while offline → Shows "pending" badge
- [ ] Create vital signs while offline → Shows "pending" badge
- [ ] Create assessment while offline → Shows "pending" badge

#### Sync on Reconnect
- [ ] Go offline → Create visit → Go online → Syncs automatically
- [ ] Multiple offline changes sync in order
- [ ] Sync progress indicator shows correctly

#### Conflict Handling
- [ ] Edit visit offline → Admin edits same visit → Shows conflict modal
- [ ] Conflict resolution keeps correct data

#### Edge Cases
- [ ] App closed while offline → Reopen → Pending changes still there
- [ ] Slow network → Timeout → Falls back to cache
- [ ] Auth token expired during sync → Shows re-login prompt

---

## Appendix A: File Structure

```
src/
├── offline/
│   ├── datastore-config.ts      # DataStore configuration
│   ├── background-sync.ts       # Sync queue management
│   ├── db-schema.ts             # IndexedDB types (fallback)
│   ├── initial-sync.ts          # Cold start sync
│   └── delta-sync.ts            # Subscription handlers
├── hooks/
│   ├── useNetworkStatus.ts      # Network detection
│   ├── useSyncStatus.ts         # Sync state
│   └── useOfflineFirst.ts       # Offline-first fetching
├── components/
│   ├── OfflineBanner.tsx        # Global offline indicator
│   ├── SyncStatusBadge.tsx      # Per-item sync status
│   ├── SyncProgressIndicator.tsx
│   └── ConflictResolutionModal.tsx
└── sw-register.ts               # Service worker registration
```

---

## Appendix B: Environment Configuration

```bash
# .env.production
VITE_ENABLE_OFFLINE=true
VITE_SYNC_INTERVAL_MS=60000
VITE_MAX_OFFLINE_DAYS=30
VITE_CONFLICT_STRATEGY=auto  # auto | prompt | server-wins
```

---

## Appendix C: References

1. [AWS Amplify DataStore Documentation](https://docs.amplify.aws/gen1/react/build-a-backend/more-features/datastore/)
2. [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
3. [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
4. [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
5. [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

---

**Document Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Offline Architect | Initial specification |

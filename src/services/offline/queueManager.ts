/**
 * Mutation Queue Manager
 * 
 * Handles persistence and retry logic for offline mutations.
 * Uses IndexedDB for persistence, with fallback to localStorage.
 * 
 * Features:
 * - Queue mutations when offline
 * - Persist queue across sessions
 * - Retry with exponential backoff
 * - Priority-based processing
 * - Error tracking and recovery
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 5.3: Background Sync Implementation
 */

import type {
  PendingMutation,
  MutationOperation,
  OfflineModelName,
  MutationResult,
  QueueStats,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUEUE_STORAGE_KEY = 'ips-erp-mutation-queue';
const MAX_RETRY_COUNT = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;

// Priority levels (lower = higher priority)
const MODEL_PRIORITY: Record<OfflineModelName, number> = {
  Visit: 1,           // Visits are highest priority
  VitalSigns: 2,      // Vitals are second priority
  PatientAssessment: 3, // Assessments are third
};

// ============================================================================
// INTERNAL STATE
// ============================================================================

/** In-memory queue (synced with storage) */
let mutationQueue: PendingMutation[] = [];

/** Processing lock to prevent concurrent processing */
let isProcessing = false;

/** Retry timeout references for cleanup */
const retryTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/** Listeners for queue state changes */
type QueueListener = (queue: PendingMutation[]) => void;
const listeners = new Set<QueueListener>();

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Save queue to persistent storage (localStorage as fallback)
 * In production, should use IndexedDB for larger capacity
 */
function persistQueue(): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(mutationQueue));
  } catch (error) {
    console.error('Failed to persist mutation queue:', error);
  }
}

/**
 * Load queue from persistent storage
 */
function loadQueue(): PendingMutation[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PendingMutation[];
    }
  } catch (error) {
    console.error('Failed to load mutation queue:', error);
  }
  return [];
}

/**
 * Generate a unique mutation ID
 */
function generateMutationId(): string {
  return `mutation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Notify all listeners of queue change
 */
function notifyListeners(): void {
  const queueCopy = [...mutationQueue];
  listeners.forEach(listener => listener(queueCopy));
}

// ============================================================================
// QUEUE MANAGEMENT API
// ============================================================================

/**
 * Initialize the queue manager
 * Call on app startup
 */
export function initializeQueueManager(): void {
  mutationQueue = loadQueue();
  console.log(`📋 Queue manager initialized with ${mutationQueue.length} pending mutations`);
  notifyListeners();
}

/**
 * Subscribe to queue changes
 */
export function subscribeToQueue(listener: QueueListener): () => void {
  listeners.add(listener);
  // Immediately notify with current state
  listener([...mutationQueue]);
  
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Add a mutation to the queue
 */
export function enqueueMutation<T>(
  modelName: OfflineModelName,
  operation: MutationOperation,
  data: T
): string {
  const mutation: PendingMutation<T> = {
    id: generateMutationId(),
    modelName,
    operation,
    data,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    priority: MODEL_PRIORITY[modelName],
  };
  
  mutationQueue.push(mutation);
  
  // Sort by priority (lower = higher priority), then by creation time
  mutationQueue.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  persistQueue();
  notifyListeners();
  
  console.log(`📝 Queued ${operation} for ${modelName}:`, mutation.id);
  
  return mutation.id;
}

/**
 * Remove a mutation from the queue (after successful sync)
 */
export function dequeueMutation(mutationId: string): boolean {
  const index = mutationQueue.findIndex(m => m.id === mutationId);
  if (index === -1) return false;
  
  mutationQueue.splice(index, 1);
  persistQueue();
  notifyListeners();
  
  // Clear any pending retry timeout
  const timeout = retryTimeouts.get(mutationId);
  if (timeout) {
    clearTimeout(timeout);
    retryTimeouts.delete(mutationId);
  }
  
  console.log(`✅ Dequeued mutation:`, mutationId);
  return true;
}

/**
 * Update a mutation's retry status after failure
 */
export function markMutationRetry(mutationId: string, error: Error): void {
  const mutation = mutationQueue.find(m => m.id === mutationId);
  if (!mutation) return;
  
  mutation.retryCount++;
  mutation.lastError = error.message;
  mutation.lastRetryAt = new Date().toISOString();
  
  persistQueue();
  notifyListeners();
  
  console.warn(`⚠️ Mutation retry ${mutation.retryCount}/${MAX_RETRY_COUNT}:`, mutationId, error.message);
}

/**
 * Get a specific mutation by ID
 */
export function getMutation(mutationId: string): PendingMutation | undefined {
  return mutationQueue.find(m => m.id === mutationId);
}

/**
 * Get all pending mutations
 */
export function getPendingMutations(): PendingMutation[] {
  return [...mutationQueue];
}

/**
 * Get mutations that can be retried (not exceeded max retries)
 */
export function getRetryableMutations(): PendingMutation[] {
  return mutationQueue.filter(m => m.retryCount < MAX_RETRY_COUNT);
}

/**
 * Get mutations that have exceeded max retries (need manual intervention)
 */
export function getFailedMutations(): PendingMutation[] {
  return mutationQueue.filter(m => m.retryCount >= MAX_RETRY_COUNT);
}

/**
 * Get queue statistics
 */
export function getQueueStats(): QueueStats {
  const byModel: Record<OfflineModelName, number> = {
    Visit: 0,
    VitalSigns: 0,
    PatientAssessment: 0,
  };
  
  const byOperation: Record<MutationOperation, number> = {
    create: 0,
    update: 0,
    delete: 0,
  };
  
  let errorCount = 0;
  let oldestTimestamp: string | null = null;
  
  for (const mutation of mutationQueue) {
    byModel[mutation.modelName]++;
    byOperation[mutation.operation]++;
    
    if (mutation.lastError) errorCount++;
    
    if (!oldestTimestamp || mutation.createdAt < oldestTimestamp) {
      oldestTimestamp = mutation.createdAt;
    }
  }
  
  return {
    totalPending: mutationQueue.length,
    byModel,
    byOperation,
    oldestMutation: oldestTimestamp,
    errorCount,
  };
}

/**
 * Clear the entire queue (use with caution!)
 */
export function clearQueue(): void {
  // Clear all retry timeouts
  retryTimeouts.forEach(timeout => clearTimeout(timeout));
  retryTimeouts.clear();
  
  mutationQueue = [];
  persistQueue();
  notifyListeners();
  
  console.log('🧹 Mutation queue cleared');
}

/**
 * Clear only failed mutations (exceeded max retries)
 */
export function clearFailedMutations(): number {
  const failedCount = mutationQueue.filter(m => m.retryCount >= MAX_RETRY_COUNT).length;
  mutationQueue = mutationQueue.filter(m => m.retryCount < MAX_RETRY_COUNT);
  persistQueue();
  notifyListeners();
  
  console.log(`🧹 Cleared ${failedCount} failed mutations`);
  return failedCount;
}

// ============================================================================
// SYNC PROCESSING
// ============================================================================

/** Mutation executor function type */
export type MutationExecutor = (mutation: PendingMutation) => Promise<MutationResult>;

/** Registered executors for each model */
const executors = new Map<OfflineModelName, MutationExecutor>();

/**
 * Register a mutation executor for a model
 */
export function registerExecutor(modelName: OfflineModelName, executor: MutationExecutor): void {
  executors.set(modelName, executor);
  console.log(`📝 Registered executor for ${modelName}`);
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(retryCount: number): number {
  const delay = Math.min(
    BASE_RETRY_DELAY_MS * Math.pow(2, retryCount),
    MAX_RETRY_DELAY_MS
  );
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.floor(delay + jitter);
}

/**
 * Process a single mutation
 */
async function processMutation(mutation: PendingMutation): Promise<boolean> {
  const executor = executors.get(mutation.modelName);
  
  if (!executor) {
    console.error(`No executor registered for ${mutation.modelName}`);
    return false;
  }
  
  try {
    const result = await executor(mutation);
    
    if (result.success) {
      dequeueMutation(mutation.id);
      return true;
    }
    
    if (result.retryable && mutation.retryCount < MAX_RETRY_COUNT) {
      markMutationRetry(mutation.id, result.error || new Error('Unknown error'));
      
      // Schedule retry with backoff
      const delay = calculateRetryDelay(mutation.retryCount);
      console.log(`⏰ Scheduling retry for ${mutation.id} in ${delay}ms`);
      
      const timeout = setTimeout(() => {
        retryTimeouts.delete(mutation.id);
        // Re-trigger processing
        processQueue();
      }, delay);
      
      retryTimeouts.set(mutation.id, timeout);
    } else {
      markMutationRetry(mutation.id, result.error || new Error('Max retries exceeded'));
    }
    
    return false;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    markMutationRetry(mutation.id, err);
    return false;
  }
}

/**
 * Process all pending mutations
 * Called automatically when online, or manually
 */
export async function processQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (isProcessing) {
    console.log('⏳ Queue processing already in progress');
    return { processed: 0, succeeded: 0, failed: 0 };
  }
  
  if (!navigator.onLine) {
    console.log('📴 Offline - skipping queue processing');
    return { processed: 0, succeeded: 0, failed: 0 };
  }
  
  isProcessing = true;
  
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  
  try {
    const retryable = getRetryableMutations();
    console.log(`🔄 Processing ${retryable.length} pending mutations`);
    
    for (const mutation of retryable) {
      processed++;
      const success = await processMutation(mutation);
      
      if (success) {
        succeeded++;
      } else {
        failed++;
      }
    }
    
    console.log(`✅ Queue processing complete: ${succeeded}/${processed} succeeded`);
  } finally {
    isProcessing = false;
  }
  
  return { processed, succeeded, failed };
}

/**
 * Check if queue processing is in progress
 */
export function isQueueProcessing(): boolean {
  return isProcessing;
}

// ============================================================================
// NETWORK LISTENER
// ============================================================================

/**
 * Setup automatic queue processing when network comes online
 */
export function setupNetworkListener(): () => void {
  const handleOnline = () => {
    console.log('🌐 Network online - processing mutation queue');
    // Small delay to allow network to stabilize
    setTimeout(() => {
      processQueue();
    }, 1000);
  };
  
  window.addEventListener('online', handleOnline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Cleanup queue manager (call on logout)
 */
export function cleanupQueueManager(): void {
  // Clear all retry timeouts
  retryTimeouts.forEach(timeout => clearTimeout(timeout));
  retryTimeouts.clear();
  
  // Clear listeners
  listeners.clear();
  
  isProcessing = false;
  
  console.log('🧹 Queue manager cleaned up');
}

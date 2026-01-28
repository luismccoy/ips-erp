import type { Shift } from '../../types';
import type { Visit } from '../../types/workflow';
import type { SyncStatusType } from '../SyncStatusBadge';

export interface ShiftWithVisit extends Shift {
    visit?: Visit | null;
    /** Sync status for offline support */
    _syncStatus?: SyncStatusType;
}

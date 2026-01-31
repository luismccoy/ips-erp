/**
 * Navigation State Manager
 * Persists nurse app navigation state across refreshes and browser back/forward
 */

interface NavigationState {
  showDocumentationForm: boolean;
  selectedShiftId: string | null;
  activeTab: string;
  showOnlyToday: boolean;
  timestamp: number;
}

const NAV_STATE_KEY = 'nurse_navigation_state';
const STATE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

export class NavigationStateManager {
  
  /**
   * Save current navigation state to localStorage
   */
  static save(state: Omit<NavigationState, 'timestamp'>): void {
    try {
      const stateWithTimestamp: NavigationState = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem(NAV_STATE_KEY, JSON.stringify(stateWithTimestamp));
      
      // Also update URL hash for browser back/forward support
      if (state.showDocumentationForm && state.selectedShiftId) {
        window.history.pushState(
          { shiftId: state.selectedShiftId },
          '',
          `#visit/${state.selectedShiftId}`
        );
      } else {
        window.history.pushState({}, '', '#route');
      }
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }

  /**
   * Restore navigation state from localStorage
   * Returns null if state is expired or invalid
   */
  static restore(): NavigationState | null {
    try {
      const stored = localStorage.getItem(NAV_STATE_KEY);
      if (!stored) return null;

      const state: NavigationState = JSON.parse(stored);
      
      // Check if state is expired
      if (Date.now() - state.timestamp > STATE_EXPIRY_MS) {
        this.clear();
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      return null;
    }
  }

  /**
   * Clear navigation state
   */
  static clear(): void {
    try {
      localStorage.removeItem(NAV_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear navigation state:', error);
    }
  }

  /**
   * Handle browser back button
   */
  static setupPopStateHandler(onBack: () => void): () => void {
    const handler = () => {
      const hash = window.location.hash;
      if (hash === '#route' || hash === '') {
        onBack();
      }
    };

    window.addEventListener('popstate', handler);
    
    // Return cleanup function
    return () => window.removeEventListener('popstate', handler);
  }
}

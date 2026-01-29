/**
 * Centralized Authentication Utilities
 * 
 * P0-1 Security Fix: Complete session teardown on logout
 */

import { signOut } from 'aws-amplify/auth';
import { cleanupOfflineServices } from '../services/offline';
import { isUsingRealBackend } from '../amplify-utils';

/**
 * Complete logout with full session teardown
 * 
 * SECURITY: This function ensures ALL session state is cleared:
 * 1. Signs out from Amplify/Cognito (invalidates tokens)
 * 2. Clears ALL localStorage keys (app data + Amplify cache)
 * 3. Clears ALL sessionStorage keys (demo state + tour state)
 * 4. Cleans up offline service caches
 * 5. Forces hard redirect to landing page
 * 
 * This prevents session restoration attacks where:
 * - User logs out
 * - Attacker uses back button or direct URL to access protected routes
 * - Stale tokens/state allow unauthorized access
 */
export async function logout(): Promise<void> {
  try {
    console.log('🔐 Starting secure logout...');
    
    // 1. Sign out from Amplify/Cognito (invalidate server-side session)
    if (isUsingRealBackend()) {
      console.log('   - Signing out from Cognito...');
      await signOut({ global: true }); // global: true signs out from all devices
    }
    
    // 2. Clear ALL localStorage (app data + Amplify tokens)
    console.log('   - Clearing localStorage...');
    const localStorageKeys = Object.keys(localStorage);
    
    // Clear all ips-* keys (app storage)
    localStorageKeys
      .filter(key => key.startsWith('ips-'))
      .forEach(key => {
        console.log(`     ✓ Removed: ${key}`);
        localStorage.removeItem(key);
      });
    
    // Clear all Amplify/Cognito keys (auth cache)
    localStorageKeys
      .filter(key => 
        key.startsWith('CognitoIdentityServiceProvider.') ||
        key.includes('amplify-') ||
        key.includes('aws.')
      )
      .forEach(key => {
        console.log(`     ✓ Removed: ${key}`);
        localStorage.removeItem(key);
      });
    
    // 3. Clear ALL sessionStorage (demo state, tour state, etc.)
    console.log('   - Clearing sessionStorage...');
    sessionStorage.clear();
    
    // 4. Cleanup offline service caches (IndexedDB, in-memory caches)
    console.log('   - Cleaning up offline services...');
    try {
      cleanupOfflineServices();
    } catch (err) {
      console.warn('   ⚠️  Offline cleanup failed (non-critical):', err);
    }
    
    console.log('✅ Logout complete - redirecting to landing page');
    
    // 5. Force hard redirect to landing page
    // This ensures:
    // - All React state is reset
    // - No cached components remain in memory
    // - User cannot use back button to restore session
    window.location.href = '/';
    
  } catch (error) {
    console.error('❌ Logout failed:', error);
    
    // Even if logout fails, still clear local state and redirect
    // (defensive programming - prefer to clear everything than leave session active)
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}

/**
 * Check if user is authenticated (for route guards)
 * 
 * This performs a lightweight check without triggering a full auth flow.
 * Used by route guards to decide whether to redirect to login.
 * 
 * @returns true if user appears to be authenticated
 */
export function isAuthenticated(): boolean {
  // In demo mode, check for demo role in sessionStorage
  const demoMode = sessionStorage.getItem('ips-erp-demo-mode');
  if (demoMode === 'true') {
    return !!sessionStorage.getItem('ips-erp-demo-role');
  }
  
  // In real mode, check for Cognito tokens in localStorage
  // (Amplify stores tokens as CognitoIdentityServiceProvider.*.accessToken)
  const hasAmplifyTokens = Object.keys(localStorage).some(key =>
    key.startsWith('CognitoIdentityServiceProvider.') && key.includes('accessToken')
  );
  
  return hasAmplifyTokens;
}

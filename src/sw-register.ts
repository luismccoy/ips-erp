/**
 * Service Worker Registration for PWA
 * 
 * This module handles PWA service worker registration with:
 * - Auto-update capability
 * - Offline readiness notification
 * - Periodic update checks (every hour)
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 2.3
 */

import { registerSW } from 'virtual:pwa-register';

// Store the update function for external access
let updateSWInstance: ((reloadPage?: boolean) => Promise<void>) | null = null;

// Callback functions that can be set by the app
type UpdateCallback = () => void;
let onNeedRefreshCallback: UpdateCallback | null = null;
let onOfflineReadyCallback: UpdateCallback | null = null;

/**
 * Initialize the service worker registration
 */
export function initServiceWorker(): void {
  updateSWInstance = registerSW({
    /**
     * Called when a new version is available and waiting to activate.
     * The app should prompt the user to refresh.
     */
    onNeedRefresh() {
      console.log('🔄 Nueva versión de la app disponible');
      
      if (onNeedRefreshCallback) {
        onNeedRefreshCallback();
      } else {
        // Default behavior: auto-prompt
        const shouldUpdate = window.confirm(
          '¡Nueva versión disponible!\n\n¿Desea actualizar ahora?'
        );
        if (shouldUpdate && updateSWInstance) {
          updateSWInstance(true);
        }
      }
    },

    /**
     * Called when the app has been cached and is ready for offline use.
     */
    onOfflineReady() {
      console.log('✅ App lista para uso sin conexión');
      
      if (onOfflineReadyCallback) {
        onOfflineReadyCallback();
      }
    },

    /**
     * Called when the service worker is successfully registered.
     * Sets up periodic update checks.
     */
    onRegistered(registration) {
      console.log('📦 Service Worker registrado');
      
      if (registration) {
        // Check for updates every hour
        setInterval(() => {
          console.log('🔍 Verificando actualizaciones...');
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },

    /**
     * Called when service worker registration fails.
     */
    onRegisterError(error) {
      console.error('❌ Error al registrar Service Worker:', error);
    }
  });
}

/**
 * Manually trigger an app update (reload with new SW)
 */
export function updateApp(): void {
  if (updateSWInstance) {
    updateSWInstance(true);
  }
}

/**
 * Check if there's a pending update
 */
export function hasPendingUpdate(): boolean {
  return updateSWInstance !== null;
}

/**
 * Set custom callback for when app needs refresh
 */
export function setOnNeedRefresh(callback: UpdateCallback): void {
  onNeedRefreshCallback = callback;
}

/**
 * Set custom callback for when app is offline-ready
 */
export function setOnOfflineReady(callback: UpdateCallback): void {
  onOfflineReadyCallback = callback;
}

/**
 * Get PWA install prompt (for custom install button)
 * This captures the beforeinstallprompt event
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default prompt
    e.preventDefault();
    // Store the event for later
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('📱 App puede ser instalada');
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ App instalada correctamente');
    deferredPrompt = null;
  });
}

/**
 * Check if the app can be installed
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Prompt user to install the app
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  // Show the install prompt
  await deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  
  // Clear the prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

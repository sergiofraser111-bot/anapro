/**
 * Utility functions for mobile device detection and optimization
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android/i.test(navigator.userAgent);
}

export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;

  // Use visual viewport if available (better for mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }

  return window.innerHeight;
}

export function preventZoom(): void {
  if (typeof document === 'undefined') return;

  // Prevent double-tap zoom on iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

export function openWalletApp(walletName: string): void {
  const walletUrls: Record<string, string> = {
    phantom: 'https://phantom.app/ul/browse/',
    solflare: 'https://solflare.com/ul/browse/',
    backpack: 'https://backpack.app/',
  };

  const url = walletUrls[walletName.toLowerCase()];
  if (url && isMobileDevice()) {
    window.location.href = url + window.location.href;
  }
}

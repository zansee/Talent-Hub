import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const isMobilePlatform = () => {
  // Returns true if on Android/iOS native, or if screen is mobile-width,
  // or if testing with ?platform=mobile query parameter.
  if (isNativePlatform()) return true;
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('platform') === 'mobile') return true;
  if (urlParams.get('platform') === 'desktop') return false;
  
  // Fallback to screen width check for responsive browser development
  return window.innerWidth < 1024;
};

export const getPlatformName = () => {
  if (isNativePlatform()) {
    return Capacitor.getPlatform(); // 'ios' or 'android'
  }
  return 'web';
};

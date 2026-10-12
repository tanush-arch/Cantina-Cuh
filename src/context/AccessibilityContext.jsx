import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

const DEFAULT_SETTINGS = {
  textSize: 'normal', // 'normal', 'large', 'x-large'
  highContrast: false,
  speechRate: 1.0, // 0.75, 1.0, 1.25, 1.5
  speechLanguage: 'en-US', // 'en-US', 'ta-IN'
  spokenFeedback: true, // auto announcements
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('cantina_a11y_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // LocalStorage might be disabled or throw
    }
    return DEFAULT_SETTINGS;
  });

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Persist only non-sensitive visual/speech preferences
  useEffect(() => {
    try {
      localStorage.setItem('cantina_a11y_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Apply root CSS classes for accessibility modes
  useEffect(() => {
    const root = document.documentElement;
    
    // Text size classes
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${settings.textSize}`);

    // Contrast classes
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.textSize, settings.highContrast]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const announce = (message) => {
    setLiveAnnouncement(message);
    // Clear after timeout so repeated messages re-trigger if needed
    setTimeout(() => {
      setLiveAnnouncement('');
    }, 4000);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        announce,
        liveAnnouncement
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

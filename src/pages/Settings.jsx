import React from 'react';
import { Sliders, RotateCcw, Volume2, Check } from 'lucide-react';
import AccessibleButton from '../components/AccessibleButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { speechService } from '../services/speechService';

export default function Settings() {
  const { settings, updateSetting, resetSettings, announce } = useAccessibility();

  const handleTestSpeech = () => {
    const sample = settings.speechLanguage === 'ta-IN'
      ? 'கண்டீனா குஹ் அணுகல்தன்மை அமைப்பு பரிசோதனை வெற்றி.'
      : 'This is a sample test of speech synthesis for Cantina Cuhh.';

    announce('Playing speech rate and voice test');
    speechService.speak(sample, {
      rate: settings.speechRate,
      lang: settings.speechLanguage,
    });
  };

  const handleReset = () => {
    resetSettings();
    announce('Accessibility settings have been reset to default values.');
  };

  return (
    <div className="settings-page">
      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: '8px' }}>
        Accessibility Settings
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: 'var(--font-lg)' }}>
        Customize text scaling, visual contrast, speech feedback speed, and language to suit your needs.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '750px' }}>
        {/* 1. Text Size Scaling */}
        <div className="callout" style={{ margin: 0 }}>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>Text Size</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
            Choose the interface text magnification that is easiest to read.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <AccessibleButton
              onClick={() => {
                updateSetting('textSize', 'normal');
                announce('Text size set to Normal');
              }}
              variant={settings.textSize === 'normal' ? 'primary' : 'secondary'}
              ariaLabel="Set text size to normal"
            >
              Normal (18px)
            </AccessibleButton>
            <AccessibleButton
              onClick={() => {
                updateSetting('textSize', 'large');
                announce('Text size set to Large');
              }}
              variant={settings.textSize === 'large' ? 'primary' : 'secondary'}
              ariaLabel="Set text size to large"
            >
              Large (22px)
            </AccessibleButton>
            <AccessibleButton
              onClick={() => {
                updateSetting('textSize', 'xlarge');
                announce('Text size set to Extra Large');
              }}
              variant={settings.textSize === 'xlarge' ? 'primary' : 'secondary'}
              ariaLabel="Set text size to extra large"
            >
              Extra Large (26px)
            </AccessibleButton>
          </div>
        </div>

        {/* 2. High Contrast Mode */}
        <div className="callout" style={{ margin: 0 }}>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>Display Contrast</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
            High-contrast mode switches the palette to solid dark black with vibrant yellow and white elements to maximize edge distinction.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <AccessibleButton
              onClick={() => {
                updateSetting('highContrast', false);
                announce('Standard contrast activated');
              }}
              variant={!settings.highContrast ? 'primary' : 'secondary'}
              ariaLabel="Use standard color theme"
            >
              Standard Contrast
            </AccessibleButton>
            <AccessibleButton
              onClick={() => {
                updateSetting('highContrast', true);
                announce('High contrast mode activated');
              }}
              variant={settings.highContrast ? 'primary' : 'secondary'}
              ariaLabel="Activate high contrast mode"
            >
              High Contrast (Black / Yellow)
            </AccessibleButton>
          </div>
        </div>

        {/* 3. Speech Rate */}
        <div className="callout" style={{ margin: 0 }}>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>Speech Speed (Playback Rate)</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
            Adjust how rapidly synthesized speech reads content and button confirmations aloud.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Slow (0.75x)', val: 0.75 },
              { label: 'Normal (1.0x)', val: 1.0 },
              { label: 'Fast (1.25x)', val: 1.25 },
              { label: 'Very Fast (1.5x)', val: 1.5 },
            ].map((rate) => (
              <AccessibleButton
                key={rate.val}
                onClick={() => {
                  updateSetting('speechRate', rate.val);
                  announce(`Speech rate set to ${rate.label}`);
                }}
                variant={settings.speechRate === rate.val ? 'primary' : 'secondary'}
                ariaLabel={`Set speech speed to ${rate.label}`}
              >
                {rate.label}
              </AccessibleButton>
            ))}
          </div>
        </div>

        {/* 4. Language Selection */}
        <div className="callout" style={{ margin: 0 }}>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>Language & Recognition</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select your preferred language for text-to-speech synthesis and voice commands.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <AccessibleButton
              onClick={() => {
                updateSetting('speechLanguage', 'en-US');
                announce('Language set to English (United States)');
              }}
              variant={settings.speechLanguage === 'en-US' ? 'primary' : 'secondary'}
              ariaLabel="Set speech language to English"
            >
              English (US)
            </AccessibleButton>
            <AccessibleButton
              onClick={() => {
                updateSetting('speechLanguage', 'ta-IN');
                announce('Language set to Tamil (தமிழ்)');
              }}
              variant={settings.speechLanguage === 'ta-IN' ? 'primary' : 'secondary'}
              ariaLabel="Set speech language to Tamil"
            >
              Tamil (தமிழ் - India)
            </AccessibleButton>
          </div>
        </div>

        {/* 5. Spoken Feedback Switch */}
        <div className="callout" style={{ margin: 0 }}>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>Spoken Action Feedback</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
            Automatically speak out confirmations when commands or button operations succeed.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <AccessibleButton
              onClick={() => {
                updateSetting('spokenFeedback', true);
                announce('Spoken feedback enabled');
              }}
              variant={settings.spokenFeedback ? 'primary' : 'secondary'}
              ariaLabel="Enable spoken action feedback"
            >
              Feedback Enabled (On)
            </AccessibleButton>
            <AccessibleButton
              onClick={() => {
                updateSetting('spokenFeedback', false);
                announce('Spoken feedback disabled');
              }}
              variant={!settings.spokenFeedback ? 'primary' : 'secondary'}
              ariaLabel="Disable spoken action feedback"
            >
              Feedback Disabled (Off)
            </AccessibleButton>
          </div>
        </div>

        {/* Actions Group: Test & Reset */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
          <AccessibleButton
            onClick={handleTestSpeech}
            variant="primary"
            icon={Volume2}
            ariaLabel="Test speech playback settings"
          >
            Test Speech Playback
          </AccessibleButton>

          <AccessibleButton
            onClick={handleReset}
            variant="secondary"
            icon={RotateCcw}
            ariaLabel="Reset all accessibility settings to default"
          >
            Reset Settings to Defaults
          </AccessibleButton>
        </div>
      </div>
    </div>
  );
}

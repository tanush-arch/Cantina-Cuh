import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, FileText, Settings, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';
import AccessibleButton from '../components/AccessibleButton';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Home() {
  const { settings, announce } = useAccessibility();

  const handleReadIntro = () => {
    const introText =
      'Welcome to Cantina Cuhh. An accessible web application created for blind and low-vision individuals. You can extract text from photos and documents using the Camera Reader, complete accessible digital forms using the Form Assistant, or customize visual and speech preferences in Accessibility Settings.';
    announce('Reading application introduction');
    speechService.speak(introText, {
      rate: settings.speechRate,
      lang: settings.speechLanguage,
    });
  };

  return (
    <div className="home-page">
      <section className="welcome-hero" aria-labelledby="hero-title">
        <h1 id="hero-title" style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: '12px' }}>
          Welcome to Cantina Cuhh
        </h1>
        <p style={{ fontSize: 'var(--font-lg)', color: 'var(--text-muted)', maxWidth: '750px', marginBottom: '20px' }}>
          An accessibility-first assistant that helps you read printed documents, complete forms, and navigate effortlessly using voice controls and accessible keyboard navigation.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <AccessibleButton
            onClick={handleReadIntro}
            variant="primary"
            icon={Volume2}
            ariaLabel="Listen to introduction of Cantina Cuhh"
          >
            Listen to Introduction
          </AccessibleButton>
          <AccessibleButton
            onClick={() => speechService.stopSpeaking()}
            variant="secondary"
            ariaLabel="Stop reading introduction"
          >
            Stop Audio
          </AccessibleButton>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section aria-labelledby="features-title" style={{ marginTop: '40px' }}>
        <h2 id="features-title" style={{ fontSize: 'var(--font-2xl)', marginBottom: '16px' }}>
          Core Modules
        </h2>

        <div className="cards-grid">
          {/* Card 1: Camera Reader */}
          <Link to="/reader" className="feature-card" aria-label="Open Camera Reader feature">
            <div>
              <div className="card-icon" aria-hidden="true">
                <Camera size={32} />
              </div>
              <h3 className="card-title">Camera Reader</h3>
              <p className="card-description">
                Extract printed or handwritten text from uploaded photos or live camera captures. Review, edit, and listen with speech synthesis.
              </p>
            </div>
            <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Launch Reader &rarr;
            </span>
          </Link>

          {/* Card 2: Form Assistant */}
          <Link to="/forms" className="feature-card" aria-label="Open Form Assistant feature">
            <div>
              <div className="card-icon" aria-hidden="true">
                <FileText size={32} />
              </div>
              <h3 className="card-title">Form Assistant</h3>
              <p className="card-description">
                Fill out digital forms step-by-step with voice input or keyboard. Review answers, catch errors, and export an accessible PDF document.
              </p>
            </div>
            <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Launch Form Assistant &rarr;
            </span>
          </Link>

          {/* Card 3: Accessibility Settings */}
          <Link to="/settings" className="feature-card" aria-label="Open Accessibility Settings">
            <div>
              <div className="card-icon" aria-hidden="true">
                <Settings size={32} />
              </div>
              <h3 className="card-title">Accessibility Settings</h3>
              <p className="card-description">
                Tailor font sizes, switch to high-contrast mode, adjust speech rate, and select language (English or Tamil) to match your preferences.
              </p>
            </div>
            <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Open Settings &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Voice Help & Instructions Section */}
      <section className="callout" style={{ marginTop: '40px' }} aria-labelledby="voice-commands-help-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HelpCircle size={24} color="var(--primary)" aria-hidden="true" />
          <h2 id="voice-commands-help-heading" style={{ fontSize: 'var(--font-xl)' }}>
            Available Voice Commands
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
          Press the <strong>Voice Command</strong> button at any time and speak one of the following commands:
        </p>
        <ul style={{ paddingLeft: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          <li><strong>"Go home"</strong> — Return to home page</li>
          <li><strong>"Open camera reader"</strong> — OCR reader page</li>
          <li><strong>"Open form assistant"</strong> — Form completion</li>
          <li><strong>"Open accessibility settings"</strong> — Preferences</li>
          <li><strong>"Read this page"</strong> — Read content aloud</li>
          <li><strong>"Pause speaking"</strong> — Pause playback</li>
          <li><strong>"Resume speaking"</strong> — Continue playback</li>
          <li><strong>"Stop speaking"</strong> — Halt audio immediately</li>
          <li><strong>"Help"</strong> — Hear command list</li>
        </ul>
      </section>

      {/* Privacy Notice */}
      <section className="callout callout-success" style={{ marginTop: '24px' }} aria-label="Privacy Commitment">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <strong>100% Client-Side Privacy:</strong> All OCR processing and form conversions run right in your browser. We never upload your personal documents or sensitive answers to external servers.
          </div>
        </div>
      </section>
    </div>
  );
}

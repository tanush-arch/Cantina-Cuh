import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import VoiceControls from './components/VoiceControls';
import Home from './pages/Home';
import CameraReader from './pages/CameraReader';
import FormAssistant from './pages/FormAssistant';
import Settings from './pages/Settings';
import { useAccessibility } from './context/AccessibilityContext';

export default function App() {
  const { liveAnnouncement } = useAccessibility();

  return (
    <div className="app-container">
      {/* Skip to Main Content Link for screen readers and keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen Reader ARIA Live Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-announcements"
      >
        {liveAnnouncement}
      </div>

      {/* Visible Announcement Banner if announcement is present */}
      {liveAnnouncement && (
        <div className="announcement-banner" role="status">
          {liveAnnouncement}
        </div>
      )}

      {/* Application Header Navigation */}
      <Header />

      {/* Dedicated Voice Controls Strip */}
      <VoiceControls />

      {/* Main Routed Content */}
      <main id="main-content" className="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reader" element={<CameraReader />} />
          <Route path="/forms" element={<FormAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Semantic Accessible Footer */}
      <footer className="app-footer" role="contentinfo">
        <p>
          <strong>Cantina Cuhh</strong> &bull; Accessible Reading & Form Assistance Web Application
        </p>
        <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>
          Designed with accessibility first: WCAG-conscious contrast, screen-reader compatibility, keyboard navigability, and client-side privacy.
        </p>
      </footer>
    </div>
  );
}

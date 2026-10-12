import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, FileText, Settings, Volume2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <NavLink to="/" className="brand-link" aria-label="Cantina Cuhh Home">
          <div className="brand-logo-icon" aria-hidden="true">
            <Volume2 size={28} />
          </div>
          <div>
            <span className="brand-title">Cantina Cuhh</span>
            <div className="brand-tagline">Accessibility Reading & Form Assistant</div>
          </div>
        </NavLink>

        <nav aria-label="Main Navigation">
          <ul className="nav-list">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <Home size={20} aria-hidden="true" />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reader"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Camera size={20} aria-hidden="true" />
                <span>Camera Reader</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/forms"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FileText size={20} aria-hidden="true" />
                <span>Form Assistant</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Settings size={20} aria-hidden="true" />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

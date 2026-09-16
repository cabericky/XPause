import React from 'react';
import { Activity, ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import logoUrl from '../../../assets/logo.png';

interface PrivacyViewProps {
  onBack: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <main className="popup-shell privacy-shell">
      <header className="app-header">
        <button
          type="button"
          className="icon-button secondary-icon"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="brand privacy-brand">
          <img src={logoUrl} alt="" aria-hidden="true" />
          <div>
            <strong>Privacy Policy</strong>
            <small>XPause - Micro-Break Recommender</small>
          </div>
        </div>
      </header>

      <section className="panel privacy-panel">
        <h2>
          <ShieldCheck size={16} />
          Local-first privacy
        </h2>
        <p>
          XPause helps users notice fatigue patterns and take guided micro-breaks. The extension
          stores settings, reminder progress, fatigue scores, XP, and local usage summaries in the
          browser using chrome.storage.local.
        </p>
        <p>
          XPause does not collect names, email addresses, payment information, authentication
          information, personal communications, precise location, or page contents. It does not send
          browsing activity, scores, settings, or uploaded custom sounds to a server.
        </p>
      </section>

      <section className="panel privacy-panel">
        <h2>
          <Activity size={16} />
          Data used
        </h2>
        <ul className="privacy-list">
          <li>Pointer movement, clicks, keyboard activity counts, scrolling, idle time, and tab visibility.</li>
          <li>Local screen-time summaries, active/passive time, social-site visits, and broad usage categories.</li>
          <li>Break completions, skipped reminders, XP, badges, exercise choices, sounds, and theme settings.</li>
        </ul>
      </section>

      <section className="panel privacy-panel">
        <h2>
          <FileText size={16} />
          Data sharing
        </h2>
        <p>
          XPause does not sell, rent, transfer, or share user data with third parties. User data is
          used only to provide the extension's single purpose: local fatigue-aware micro-break
          reminders and related progress tracking.
        </p>
        <p>
          Users can remove locally stored XPause data at any time by uninstalling the extension or
          clearing the extension's site and storage data from the browser.
        </p>
      </section>
    </main>
  );
};


import React from 'react';
import { Play } from 'lucide-react';
import logoUrl from '../../../assets/logo.png';

interface AppHeaderProps {
  onStartBreak: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onStartBreak }) => {
  return (
    <header className="app-header">
      <div className="brand">
        <img src={logoUrl} alt="" aria-hidden="true" />
        <div>
          <strong>XPause</strong>
          <small>Local fatigue assistant</small>
        </div>
      </div>
      <button
        type="button"
        className="icon-button start-button"
        onClick={onStartBreak}
        aria-label="Start break"
        title="Start break"
      >
        <Play size={16} fill="currentColor" />
      </button>
    </header>
  );
};

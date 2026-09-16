/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  InsightsPanel,
  UsageAnalyticsPanel
} from '../features/analytics';
import {
  AppHeader,
  BadgesSection,
  ScoreGrid,
  StatGrid,
  StatusStrip,
  useExtensionState
} from '../features/dashboard';
import { PrivacyView } from '../features/privacy';
import { SettingsPanel } from '../features/settings';
import './popup.css';

const Popup = () => {
  const {
    settings,
    stats,
    runtime,
    insights,
    privacyOpen,
    saveSettings,
    startBreak,
    openPrivacy,
    closePrivacy
  } = useExtensionState();

  if (privacyOpen) {
    return <PrivacyView onBack={closePrivacy} />;
  }

  return (
    <main className="popup-shell">
      <AppHeader onStartBreak={startBreak} />
      <StatusStrip urgency={runtime.urgency} category={insights.category} />
      <ScoreGrid
        fatigueScore={runtime.fatigueScore}
        urgency={runtime.urgency}
        primaryReason={runtime.reasons[0]}
        socialFatigueScore={insights.socialFatigueScore}
        disconnectSuggestion={insights.disconnectSuggestion}
      />
      <StatGrid stats={stats} />
      <UsageAnalyticsPanel stats={stats} />
      <InsightsPanel insights={insights} />
      <SettingsPanel
        settings={settings}
        onSaveSettings={saveSettings}
        onOpenPrivacy={openPrivacy}
      />
      <BadgesSection stats={stats} />
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { StudioOverview } from './components/StudioOverview';
import { PracticeBooth } from './components/PracticeBooth';
import { FeedbackReport } from './components/FeedbackReport';
import { DrillCatalog } from './components/DrillCatalog';
import { SessionHistory } from './components/SessionHistory';
import { PracticePrompt, SpeechFeedback, SpeechSession, PracticeMode } from './types/speech';
import { DEFAULT_PROMPT, CURATED_DRILLS } from './data/drills';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('studio');
  const [selectedPrompt, setSelectedPrompt] = useState<PracticePrompt>(DEFAULT_PROMPT);
  
  // Active session feedback report state (if viewing report)
  const [activeReportData, setActiveReportData] = useState<{
    promptTitle: string;
    mode: PracticeMode;
    durationSeconds: number;
    transcript: string;
    feedback: SpeechFeedback;
    audioBlobUrl?: string;
    sessionId?: string;
  } | null>(null);

  // Saved sessions stored in localStorage
  const [savedSessions, setSavedSessions] = useState<SpeechSession[]>(() => {
    try {
      const stored = localStorage.getItem('speakeasy_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('speakeasy_sessions', JSON.stringify(savedSessions));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [savedSessions]);

  // Handle drill selection from overview or drills catalog
  const handleSelectDrill = (prompt: PracticePrompt) => {
    setSelectedPrompt(prompt);
    setActiveReportData(null);
    setCurrentTab('practice');
  };

  // Handle analysis completion in Practice Booth
  const handleAnalysisComplete = (data: {
    promptTitle: string;
    mode: PracticeMode;
    durationSeconds: number;
    transcript: string;
    feedback: SpeechFeedback;
    audioBlobUrl?: string;
  }) => {
    setActiveReportData(data);
    // Auto-save session to archive
    const newSession: SpeechSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      promptTitle: data.promptTitle,
      mode: data.mode,
      durationSeconds: data.durationSeconds,
      transcript: data.transcript,
      feedback: data.feedback,
      audioBlobUrl: data.audioBlobUrl,
    };
    setSavedSessions(prev => [newSession, ...prev]);
  };

  // Re-record speech
  const handleReRecord = () => {
    setActiveReportData(null);
    setCurrentTab('practice');
  };

  // Launch next recommended drill
  const handleNextDrill = () => {
    const nextIndex = Math.floor(Math.random() * CURATED_DRILLS.length);
    setSelectedPrompt(CURATED_DRILLS[nextIndex].prompt);
    setActiveReportData(null);
    setCurrentTab('practice');
  };

  // Save or bookmark current session explicitly
  const handleSaveCurrentSession = () => {
    if (!activeReportData) return;
    const exists = savedSessions.some(s => s.id === activeReportData.sessionId);
    if (!exists) {
      const newSession: SpeechSession = {
        id: activeReportData.sessionId || `session-${Date.now()}`,
        date: new Date().toISOString(),
        promptTitle: activeReportData.promptTitle,
        mode: activeReportData.mode,
        durationSeconds: activeReportData.durationSeconds,
        transcript: activeReportData.transcript,
        feedback: activeReportData.feedback,
        audioBlobUrl: activeReportData.audioBlobUrl,
      };
      setSavedSessions(prev => [newSession, ...prev]);
    }
  };

  // Select historical session to view report
  const handleSelectHistoricalSession = (session: SpeechSession) => {
    setActiveReportData({
      promptTitle: session.promptTitle,
      mode: session.mode,
      durationSeconds: session.durationSeconds,
      transcript: session.transcript,
      feedback: session.feedback,
      audioBlobUrl: session.audioBlobUrl,
      sessionId: session.id,
    });
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear your entire speech history?')) {
      setSavedSessions([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans selection:bg-[#fc8274]/20 selection:text-[#1c1917]">
      {/* Editorial Navigation */}
      <Navbar
        currentTab={activeReportData ? 'practice' : currentTab}
        onSelectTab={(tab) => {
          setActiveReportData(null);
          setCurrentTab(tab);
        }}
        savedSessionsCount={savedSessions.length}
        onQuickStart={() => {
          setActiveReportData(null);
          setCurrentTab('practice');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* If user is viewing a fresh or historical diagnostic report */}
        {activeReportData ? (
          <FeedbackReport
            promptTitle={activeReportData.promptTitle}
            mode={activeReportData.mode}
            durationSeconds={activeReportData.durationSeconds}
            transcript={activeReportData.transcript}
            feedback={activeReportData.feedback}
            audioBlobUrl={activeReportData.audioBlobUrl}
            onReRecord={handleReRecord}
            onNextDrill={handleNextDrill}
            onSaveSession={handleSaveCurrentSession}
            isSaved={savedSessions.some(s => s.transcript === activeReportData.transcript)}
          />
        ) : (
          <>
            {currentTab === 'studio' && (
              <StudioOverview
                onStartPracticing={(prompt) => {
                  if (prompt) setSelectedPrompt(prompt);
                  setCurrentTab('practice');
                }}
                onExploreDrills={() => setCurrentTab('drills')}
              />
            )}

            {currentTab === 'practice' && (
              <PracticeBooth
                initialPrompt={selectedPrompt}
                onAnalysisComplete={handleAnalysisComplete}
                onBrowseDrills={() => setCurrentTab('drills')}
              />
            )}

            {currentTab === 'drills' && (
              <DrillCatalog
                onSelectDrill={handleSelectDrill}
              />
            )}

            {currentTab === 'history' && (
              <SessionHistory
                sessions={savedSessions}
                onSelectSession={handleSelectHistoricalSession}
                onDeleteSession={handleDeleteSession}
                onClearAll={handleClearAllSessions}
                onStartPracticing={() => {
                  setSelectedPrompt(DEFAULT_PROMPT);
                  setCurrentTab('practice');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Editorial Studio Footer */}
      <footer className="border-t border-[#e5ded5] py-10 bg-[#faf8f5] text-xs text-[#8c7e72]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-medium text-[#1c1917]">SpeakEasy Lab</span>
            <span>·</span>
            <span>Communication & Voice Intelligence Studio</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.8 Flash Speech Analysis</span>
            <span>·</span>
            <span>Confidential & Private Audio Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

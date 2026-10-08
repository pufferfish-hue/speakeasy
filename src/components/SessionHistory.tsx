import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Trash2, 
  Play, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Mic, 
  Sparkles 
} from 'lucide-react';
import { SpeechSession } from '../types/speech';

interface SessionHistoryProps {
  sessions: SpeechSession[];
  onSelectSession: (session: SpeechSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  onStartPracticing: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onStartPracticing
}) => {
  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#f3efe8] border border-[#e5ded5] flex items-center justify-center mx-auto text-[#8c7e72]">
          <BarChart3 className="w-8 h-8 text-[#e06c5f]" />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-medium text-[#1c1917]">
            Your Practice Archive is Empty
          </h2>
          <p className="text-sm text-[#4d4540] max-w-md mx-auto mt-2 leading-relaxed">
            Every session you record in the Practice Booth can be saved here to track your filler reduction, pacing cadence, and structural polish over time.
          </p>
        </div>
        <button
          onClick={onStartPracticing}
          className="inline-flex items-center gap-2 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-sm font-medium py-3 px-6 rounded-full shadow transition-all cursor-pointer"
        >
          <Mic className="w-4 h-4" />
          <span>Record Your First Speech</span>
        </button>
      </div>
    );
  }

  // Calculate statistics
  const avgScore = Math.round(
    sessions.reduce((acc, s) => acc + s.feedback.overallScore, 0) / sessions.length
  );
  const avgWpm = Math.round(
    sessions.reduce((acc, s) => acc + s.feedback.wordsPerMinute, 0) / sessions.length
  );
  const totalFillers = sessions.reduce((acc, s) => acc + s.feedback.totalFillers, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[#e5ded5] pb-6">
        <div>
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
            Longitudinal Progress
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mt-1">
            Speech & Vocal Archive
          </h1>
          <p className="text-xs text-[#8c7e72] mt-1">
            Track your cadence stability and filler word elimination over time
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="text-xs text-[#8c7e72] hover:text-[#ba1a1a] transition-colors self-start sm:self-center"
        >
          Clear All History
        </button>
      </div>

      {/* Aggregate Metric Pods */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Average Poise Score
          </div>
          <div className="font-serif text-4xl font-medium text-[#1c1917] mt-2">
            {avgScore}
            <span className="text-sm font-normal text-[#8c7e72] ml-1">/100</span>
          </div>
          <div className="text-xs text-[#8c7e72] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Across {sessions.length} recorded session{sessions.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Average Delivery Speed
          </div>
          <div className="font-serif text-4xl font-medium text-[#1c1917] mt-2">
            {avgWpm}
            <span className="text-sm font-normal text-[#8c7e72] ml-1">WPM</span>
          </div>
          <div className="text-xs text-[#8c7e72] mt-1">
            {avgWpm >= 125 && avgWpm <= 160 ? 'Optimal executive range' : 'Calibrating cadence'}
          </div>
        </div>

        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Total Fillers Flagged
          </div>
          <div className="font-serif text-4xl font-medium text-[#1c1917] mt-2">
            {totalFillers}
          </div>
          <div className="text-xs text-[#8c7e72] mt-1">
            Avg {(totalFillers / sessions.length).toFixed(1)} per session
          </div>
        </div>

      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
          Recorded Rehearsals
        </h2>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-[#faf8f5] border border-[#e5ded5] hover:border-[#1c1917] rounded-2xl p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#8c7e72]">
                  <span>{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{session.mode.replace('_', ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.durationSeconds}s</span>
                </div>

                <h3 className="font-serif text-xl font-medium text-[#1c1917] group-hover:text-[#e06c5f] transition-colors truncate">
                  {session.promptTitle}
                </h3>

                <p className="font-serif italic text-xs text-[#4d4540] line-clamp-1">
                  "{session.transcript}"
                </p>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="font-serif text-2xl font-medium text-[#1c1917]">
                    {session.feedback.overallScore}
                  </div>
                  <div className="text-[10px] text-[#8c7e72] uppercase tracking-wider">
                    {session.feedback.wordsPerMinute} WPM
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSession(session)}
                    className="py-2 px-3.5 bg-[#f3efe8] hover:bg-[#1c1917] hover:text-white text-[#1c1917] text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-2 text-[#8c7e72] hover:text-[#ba1a1a] transition-colors rounded-full hover:bg-[#f3efe8] cursor-pointer"
                    title="Delete recording from archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

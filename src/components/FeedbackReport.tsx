import React, { useState } from 'react';
import { 
  Award, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  ArrowRight, 
  Play, 
  Pause, 
  MessageSquare, 
  Lightbulb, 
  Zap,
  BookmarkPlus,
  BookmarkCheck
} from 'lucide-react';
import { SpeechFeedback, PracticeMode } from '../types/speech';
import { getFollowUpQuestion } from '../services/api';

interface FeedbackReportProps {
  promptTitle: string;
  mode: PracticeMode;
  durationSeconds: number;
  transcript: string;
  feedback: SpeechFeedback;
  audioBlobUrl?: string;
  onReRecord: () => void;
  onNextDrill: () => void;
  onSaveSession: () => void;
  isSaved?: boolean;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  promptTitle,
  mode,
  durationSeconds,
  transcript,
  feedback,
  audioBlobUrl,
  onReRecord,
  onNextDrill,
  onSaveSession,
  isSaved = false
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Simulated Q&A panel state
  const [panelQuestion, setPanelQuestion] = useState<{
    question: string;
    interviewerPersona: string;
    focusTip: string;
  } | null>(null);
  const [isLoadingQA, setIsLoadingQA] = useState(false);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleFetchPanelQA = async () => {
    setIsLoadingQA(true);
    try {
      const q = await getFollowUpQuestion({
        transcript,
        promptTopic: promptTitle
      });
      setPanelQuestion(q);
    } catch (e) {
      console.warn('Failed to get panel question', e);
    } finally {
      setIsLoadingQA(false);
    }
  };

  // Split transcript to highlight filler words visually
  const renderHighlightedTranscript = () => {
    const fillerWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'basically', 'sort of'];
    const words = transcript.split(/\s+/);

    return words.map((w, index) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      const isFiller = fillerWords.includes(clean);

      if (isFiller) {
        return (
          <span 
            key={index} 
            className="bg-[#fc8274]/25 text-[#93000a] font-medium px-1 rounded mx-0.5 line-through decoration-[#ba1a1a]/40"
            title="Filler word: replace with a silent pause"
          >
            {w}{' '}
          </span>
        );
      }
      return <span key={index}>{w} </span>;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 space-y-10">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[#e5ded5] pb-6">
        <div>
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
            Diagnostic Report · SpeakEasy Speech Intelligence
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mt-1">
            {promptTitle}
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8c7e72] mt-2">
            <span>Duration: {durationSeconds}s</span>
            <span aria-hidden="true">·</span>
            <span>Words: {feedback.totalWords}</span>
            <span aria-hidden="true">·</span>
            <span>Cadence: {feedback.wordsPerMinute} WPM</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSaveSession}
            disabled={isSaved}
            className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-medium transition-colors ${
              isSaved 
                ? 'bg-[#f3efe8] text-[#8c7e72] cursor-default' 
                : 'bg-[#faf8f5] border border-[#e5ded5] hover:bg-[#f3efe8] text-[#1c1917] cursor-pointer'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#e06c5f]" />
                <span>Saved to Archive</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5 text-[#8c7e72]" />
                <span>Save Session</span>
              </>
            )}
          </button>

          <button
            onClick={onReRecord}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-medium rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-Record</span>
          </button>
        </div>
      </div>

      {/* Primary Score & Metric Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Overall Score */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Overall Poise
          </div>
          <div className="font-serif text-4xl sm:text-5xl font-medium text-[#1c1917] mt-2">
            {feedback.overallScore}
            <span className="text-base font-normal text-[#8c7e72] ml-1">/100</span>
          </div>
          <div className="text-xs text-[#8c7e72] mt-2">
            Weighted composite
          </div>
        </div>

        {/* Cadence & Pacing */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Pacing & Cadence
          </div>
          <div className="font-serif text-4xl sm:text-5xl font-medium text-[#1c1917] mt-2">
            {feedback.wordsPerMinute}
            <span className="text-base font-normal text-[#8c7e72] ml-1">WPM</span>
          </div>
          <div className="text-xs text-[#4d4540] font-medium mt-2 truncate">
            {feedback.pacingVerdict}
          </div>
        </div>

        {/* Filler Word Control */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Filler Control
          </div>
          <div className="font-serif text-4xl sm:text-5xl font-medium text-[#1c1917] mt-2">
            {feedback.totalFillers}
            <span className="text-base font-normal text-[#8c7e72] ml-1">fillers</span>
          </div>
          <div className="text-xs text-[#8c7e72] mt-2">
            {feedback.fillerScore >= 90 ? 'Near zero fillers' : 'Opportunity for pauses'}
          </div>
        </div>

        {/* Structural Clarity */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Clarity & Impact
          </div>
          <div className="font-serif text-4xl sm:text-5xl font-medium text-[#1c1917] mt-2">
            {feedback.clarityScore}
            <span className="text-base font-normal text-[#8c7e72] ml-1">/100</span>
          </div>
          <div className="text-xs text-[#8c7e72] mt-2">
            Framework adherence
          </div>
        </div>

      </div>

      {/* Audio Playback Bar if audio exists */}
      {audioBlobUrl && (
        <div className="bg-[#faf8f5] border border-[#e5ded5] rounded-2xl p-4 flex items-center justify-between gap-4">
          <audio
            ref={audioRef}
            src={audioBlobUrl}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-[#1c1917] hover:bg-[#292524] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 text-[#e06c5f]" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 text-[#e06c5f]" />
              )}
            </button>
            <div>
              <div className="text-xs font-semibold text-[#1c1917]">
                Voice Recording Playback
              </div>
              <div className="text-[11px] text-[#8c7e72]">
                Listen back to analyze your vocal inflection, downward pitch, and silent breath marks.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8c7e72]">{durationSeconds}s</span>
        </div>
      )}

      {/* Editorial Coach Summary */}
      <div className="bg-[#faf8f5] border-l-4 border-[#e06c5f] border-t border-r border-b border-[#e5ded5] rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#e06c5f]" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e06c5f]">
            Head Coach Evaluation
          </span>
        </div>
        <p className="font-serif text-lg sm:text-xl text-[#1c1917] leading-relaxed">
          "{feedback.summary}"
        </p>
      </div>

      {/* Strengths & Growth Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identified Strengths */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1917] flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
            <span>Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#4d4540]">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#2e7d32] font-serif font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1917] flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#e06c5f]" />
            <span>Target Growth Areas</span>
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#4d4540]">
            {feedback.growthAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#e06c5f] font-serif font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* SpeakEasy Polish: Sentence-by-Sentence Rewrites */}
      {feedback.rewriteSuggestions && feedback.rewriteSuggestions.length > 0 && (
        <div className="bg-[#faf8f5] border border-[#e5ded5] rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
              The SpeakEasy Polish
            </span>
            <h2 className="font-serif text-2xl font-normal text-[#1c1917] mt-1">
              Elevating your phrasing for authority & punch
            </h2>
          </div>

          <div className="space-y-4">
            {feedback.rewriteSuggestions.map((item, idx) => (
              <div key={idx} className="bg-[#f3efe8] rounded-xl p-5 border border-[#e5ded5] space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c7e72]">
                    What You Said
                  </span>
                  <div className="font-serif italic text-sm text-[#4d4540] mt-1">
                    "{item.original}"
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5ded5]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e06c5f]">
                    SpeakEasy Recommendation
                  </span>
                  <div className="font-serif text-base text-[#1c1917] font-medium mt-1">
                    "{item.polished}"
                  </div>
                </div>

                <div className="text-xs text-[#8c7e72] bg-[#faf8f5] p-2.5 rounded-lg border border-[#e5ded5]">
                  <span className="font-medium text-[#1c1917]">Why this works: </span>
                  {item.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Speech Transcript with Inline Highlights */}
      <div className="bg-[#faf8f5] border border-[#e5ded5] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72]">
            Verbatim Transcript Diagnostic
          </span>
          <div className="flex items-center gap-3 text-xs text-[#8c7e72]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#fc8274]/40" />
              <span>Filler word flagged</span>
            </span>
          </div>
        </div>

        <div className="p-5 bg-[#f3efe8] rounded-xl text-sm sm:text-base leading-relaxed text-[#1c1917] font-serif">
          {renderHighlightedTranscript()}
        </div>

        {feedback.fillerWordsFound && feedback.fillerWordsFound.length > 0 && (
          <div className="text-xs text-[#8c7e72] flex flex-wrap items-center gap-2 pt-2">
            <span>Detected fillers:</span>
            {feedback.fillerWordsFound.map((f, i) => (
              <span key={i} className="bg-[#faf8f5] border border-[#e5ded5] px-2 py-0.5 rounded-full text-[#1c1917]">
                "{f.word}" ({f.count}x)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Vocal Conditioning & Delivery Tips */}
      <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-6 sm:p-8">
        <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#e06c5f]" />
          <span>Vocal Conditioning & Breath Work</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {feedback.deliveryTips.map((tip, idx) => (
            <div key={idx} className="bg-[#faf8f5] p-4 rounded-xl border border-[#e5ded5] text-xs leading-relaxed text-[#4d4540]">
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Executive Q&A Follow-up */}
      <div className="bg-[#1c1917] text-[#faf8f5] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e06c5f]">
              Simulated Executive Q&A
            </span>
            <h3 className="font-serif text-2xl font-normal text-white mt-1">
              Test your thinking on your feet
            </h3>
            <p className="text-xs sm:text-sm text-[#d4cbc0] mt-1 max-w-xl">
              In high-stakes meetings, the presentation is only half the battle. Can you handle the unscripted follow-up question?
            </p>
          </div>

          <button
            onClick={handleFetchPanelQA}
            disabled={isLoadingQA}
            className="shrink-0 inline-flex items-center gap-2 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-xs font-medium py-2.5 px-5 rounded-full shadow transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isLoadingQA ? 'Generating Question...' : 'Ask Follow-up Question'}</span>
          </button>
        </div>

        {panelQuestion && (
          <div className="bg-[#292524] rounded-xl p-5 border border-[#3e3835] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#e06c5f]">
              <span>Interviewer: {panelQuestion.interviewerPersona}</span>
            </div>
            <div className="font-serif text-lg text-white">
              "{panelQuestion.question}"
            </div>
            <div className="text-xs text-[#d4cbc0] bg-[#1c1917] p-3 rounded-lg border border-[#3e3835]">
              <span className="font-medium text-white">Coach's Handling Tip: </span>
              {panelQuestion.focusTip}
            </div>
          </div>
        )}
      </div>

      {/* Next Drill Action Banner */}
      <div className="bg-[#faf8f5] border border-[#1c1917] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#e06c5f]">
            Recommended Follow-Up Drill
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1c1917] mt-1">
            {feedback.nextDrillChallenge}
          </h3>
          <p className="text-xs text-[#8c7e72] mt-1">
            Targeted micro-rehearsal builds muscle memory faster than broad speeches.
          </p>
        </div>

        <button
          onClick={onNextDrill}
          className="inline-flex items-center gap-2 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-sm font-medium py-3 px-6 rounded-full shadow transition-all shrink-0 cursor-pointer"
        >
          <span>Launch Next Drill</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

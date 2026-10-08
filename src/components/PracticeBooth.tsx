import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Sliders, 
  Check, 
  Wand2,
  Volume2,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { PracticeMode, PracticePrompt, SpeechFeedback } from '../types/speech';
import { DEFAULT_PROMPT, CURATED_DRILLS } from '../data/drills';
import { analyzeSpeech, generateAiPrompt, getFollowUpQuestion } from '../services/api';

interface PracticeBoothProps {
  initialPrompt?: PracticePrompt | null;
  onAnalysisComplete: (sessionData: {
    promptTitle: string;
    mode: PracticeMode;
    durationSeconds: number;
    transcript: string;
    feedback: SpeechFeedback;
    audioBlobUrl?: string;
  }) => void;
  onBrowseDrills: () => void;
}

export const PracticeBooth: React.FC<PracticeBoothProps> = ({
  initialPrompt,
  onAnalysisComplete,
  onBrowseDrills
}) => {
  // Current prompt state
  const [activePrompt, setActivePrompt] = useState<PracticePrompt>(initialPrompt || DEFAULT_PROMPT);
  const [activeMode, setActiveMode] = useState<PracticeMode>(initialPrompt?.category || 'impromptu');
  
  // Custom prompt modal/toggle
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  const [isGeneratingAiPrompt, setIsGeneratingAiPrompt] = useState(false);

  // Recording & Speech state
  const [isRecording, setIsRecording] = useState(false);
  const [isPrepping, setIsPrepping] = useState(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Teleprompter state
  const [teleprompterScript, setTeleprompterScript] = useState<string>(
    activePrompt.sampleScript || activePrompt.challengeQuestion
  );
  const [teleprompterWpm, setTeleprompterWpm] = useState(135);
  const [isTeleprompterScrolling, setIsTeleprompterScrolling] = useState(false);
  const teleprompterContainerRef = useRef<HTMLDivElement | null>(null);

  // Audio stream & recorder references
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | undefined>(undefined);
  const [streamForVisualizer, setStreamForVisualizer] = useState<MediaStream | null>(null);

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);

  // Real-time metric counters
  const wordsSpoken = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
  const currentWpm = elapsedSeconds > 4 ? Math.round((wordsSpoken / elapsedSeconds) * 60) : 0;
  
  // Detect fillers live
  const detectedFillers = (liveTranscript.toLowerCase().match(/\b(um|uh|er|ah|like|you know|actually|basically|sort of)\b/g) || []).length;

  // Sync initialPrompt changes
  useEffect(() => {
    if (initialPrompt) {
      setActivePrompt(initialPrompt);
      setActiveMode(initialPrompt.category);
      if (initialPrompt.sampleScript) {
        setTeleprompterScript(initialPrompt.sampleScript);
      }
    }
  }, [initialPrompt]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  // Timer interval for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Timer interval for 30s prep countdown
  useEffect(() => {
    let interval: any;
    if (isPrepping && prepTimeLeft > 0) {
      interval = setInterval(() => {
        setPrepTimeLeft(prev => {
          if (prev <= 1) {
            setIsPrepping(false);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPrepping, prepTimeLeft]);

  // Teleprompter auto-scroll logic
  useEffect(() => {
    let scrollInterval: any;
    if (isRecording && isTeleprompterScrolling && teleprompterContainerRef.current) {
      // Calculate scroll speed in px/sec based on WPM
      const pixelsPerSecond = (teleprompterWpm / 60) * 18;
      scrollInterval = setInterval(() => {
        if (teleprompterContainerRef.current) {
          teleprompterContainerRef.current.scrollTop += pixelsPerSecond / 10;
        }
      }, 100);
    }
    return () => clearInterval(scrollInterval);
  }, [isRecording, isTeleprompterScrolling, teleprompterWpm]);

  // Stop media & recognition helper
  const stopAllMedia = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setStreamForVisualizer(null);
  };

  // Start actual recording
  const startRecording = async () => {
    setAnalysisError(null);
    setElapsedSeconds(0);
    setLiveTranscript('');
    audioChunksRef.current = [];
    setAudioBlobUrl(undefined);

    try {
      // 1. Microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setStreamForVisualizer(stream);

      // 2. Audio Recorder for playback
      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
        };
        recorder.start(500);
      } catch (recErr) {
        console.warn('MediaRecorder not supported on this device/format', recErr);
      }

      // 3. Web Speech Recognition for live transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalAccumulated = '';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalAccumulated += ' ' + event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setLiveTranscript((finalAccumulated + ' ' + interimTranscript).trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
        };

        recognition.onend = () => {
          // If still recording, restart recognition
          if (isRecording && recognitionRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
        setSpeechRecognitionSupported(true);
      } else {
        setSpeechRecognitionSupported(false);
      }

      setIsRecording(true);
      if (activeMode === 'teleprompter') {
        setIsTeleprompterScrolling(true);
      }
    } catch (err: any) {
      console.error('Microphone access denied or error:', err);
      setAnalysisError('Microphone permission was not granted or microphone is unavailable. You can still type or paste your speech below to get complete AI coaching.');
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setIsTeleprompterScrolling(false);
    stopAllMedia();
  };

  // Cancel prep
  const cancelPrep = () => {
    setIsPrepping(false);
    setPrepTimeLeft(30);
  };

  // Trigger analysis
  const handleAnalyze = async () => {
    const textToAnalyze = liveTranscript.trim() || teleprompterScript.trim();
    if (!textToAnalyze || textToAnalyze.length < 5) {
      setAnalysisError('Please speak or type at least a short sentence before requesting AI feedback.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const duration = Math.max(elapsedSeconds, 15);

    try {
      const feedback = await analyzeSpeech({
        transcript: textToAnalyze,
        durationSeconds: duration,
        mode: activeMode,
        promptTopic: activePrompt.title,
        drillGoal: activePrompt.framework
      });

      onAnalysisComplete({
        promptTitle: activePrompt.title,
        mode: activeMode,
        durationSeconds: duration,
        transcript: textToAnalyze,
        feedback,
        audioBlobUrl
      });
    } catch (err: any) {
      setAnalysisError(err.message || 'Speech analysis encountered an error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate new AI prompt scenario
  const handleGenerateAiPrompt = async (category: string) => {
    setIsGeneratingAiPrompt(true);
    try {
      const generated = await generateAiPrompt({
        category,
        difficulty: 'intermediate'
      });

      if (generated.title) {
        const newPrompt: PracticePrompt = {
          id: `gen-${Date.now()}`,
          title: generated.title || 'Dynamic Communication Challenge',
          category: (category as PracticeMode) || 'impromptu',
          context: generated.context || 'Executive Meeting',
          scenario: generated.scenario || 'Deliver a clear, decisive message.',
          challengeQuestion: generated.challengeQuestion || 'Answer with clarity and poise.',
          framework: generated.framework || 'PREP Method',
          timeLimitSeconds: generated.timeLimitSeconds || 90,
          tips: generated.tips || ['Breathe', 'Pause', 'Decide']
        };
        setActivePrompt(newPrompt);
        setActiveMode(newPrompt.category);
        if (newPrompt.sampleScript) {
          setTeleprompterScript(newPrompt.sampleScript);
        }
      }
    } catch (err) {
      console.warn('Error generating prompt:', err);
    } finally {
      setIsGeneratingAiPrompt(false);
    }
  };

  // Quick-load demo speech text for instant testing
  const loadSampleSpeech = (type: 'executive' | 'prep' | 'keynote') => {
    let sample = '';
    if (type === 'executive') {
      sample = "My recommendation is that we postpone the regional rollout by three weeks. The fundamental rationale is regulatory security and brand integrity. In our previous pilot, taking extra time to stress-test our data privacy protocols saved us over six months of support escalations. By locking down these safeguards now, we ensure our long-term client trust remains unassailable.";
    } else if (type === 'prep') {
      sample = "We need to focus our Q3 engineering resources entirely on platform resilience. When our customers rely on us for mission-critical operations, a single hour of unplanned downtime erodes millions in relationship equity. Last month, our incident response team resolved three Sev-1 tickets that could have been avoided with proactive refactoring. Investing here now creates the unshakeable foundation we need to scale.";
    } else {
      sample = "Over the past decade, our industry has prioritized raw execution speed over human clarity. Today, seventy percent of knowledge workers feel constantly overwhelmed by fragmented communications. We stand at a pivotal crossroad: true leadership tomorrow will not belong to the fastest responders, but to those who speak with intentional presence and deep empathy. That is why we are rethinking our core operating rhythm.";
    }
    setLiveTranscript(sample);
    setElapsedSeconds(42);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 space-y-8">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[#e5ded5] pb-6">
        <div>
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
            Speech Studio Booth
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mt-1">
            {activePrompt.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8c7e72] mt-2">
            <span>Context: {activePrompt.context}</span>
            <span aria-hidden="true">·</span>
            <span>Target: {activePrompt.timeLimitSeconds}s</span>
            <span aria-hidden="true">·</span>
            <span>Framework: {activePrompt.framework}</span>
          </div>
        </div>

        {/* Prompt switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateAiPrompt(activeMode)}
            disabled={isGeneratingAiPrompt || isRecording}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#f3efe8] hover:bg-[#eae4da] text-[#1c1917] text-xs font-medium rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            title="Generate a brand new challenge using Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e06c5f]" />
            <span>{isGeneratingAiPrompt ? 'Generating...' : 'New AI Scenario'}</span>
          </button>

          <button
            onClick={onBrowseDrills}
            disabled={isRecording}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 border border-[#e5ded5] hover:bg-[#f3efe8] text-[#1c1917] text-xs font-medium rounded-full transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8c7e72]" />
            <span>Drill Catalog</span>
          </button>
        </div>
      </div>

      {/* Challenge Scenario & Framework Instruction Card */}
      <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="space-y-3 max-w-2xl">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c7e72]">
                The Situation
              </span>
              <p className="text-sm sm:text-base text-[#1c1917] font-medium leading-relaxed mt-1">
                {activePrompt.scenario}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e06c5f]">
                Your Speaking Task
              </span>
              <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed mt-0.5">
                {activePrompt.challengeQuestion}
              </p>
            </div>
          </div>

          {/* Coach Advice Box */}
          <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e5ded5] w-full md:w-72 shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1c1917] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#e06c5f]" />
              SpeakEasy Coach Tips
            </span>
            <ul className="space-y-1.5 text-xs text-[#4d4540]">
              {activePrompt.tips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#e06c5f] font-serif">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-[#e5ded5] pb-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('impromptu')}
            disabled={isRecording}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeMode === 'impromptu'
                ? 'bg-[#1c1917] text-white'
                : 'text-[#8c7e72] hover:text-[#1c1917] bg-[#f3efe8]'
            }`}
          >
            Impromptu / Live Speech
          </button>

          <button
            onClick={() => setActiveMode('teleprompter')}
            disabled={isRecording}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeMode === 'teleprompter'
                ? 'bg-[#1c1917] text-white'
                : 'text-[#8c7e72] hover:text-[#1c1917] bg-[#f3efe8]'
            }`}
          >
            Teleprompter Script
          </button>
        </div>

        {/* Quick sample loader for users testing without talking out loud */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8c7e72]">
          <span>Load sample speech:</span>
          <button
            onClick={() => loadSampleSpeech('executive')}
            disabled={isRecording}
            className="hover:text-[#1c1917] hover:underline cursor-pointer"
          >
            Executive
          </button>
          <span>·</span>
          <button
            onClick={() => loadSampleSpeech('prep')}
            disabled={isRecording}
            className="hover:text-[#1c1917] hover:underline cursor-pointer"
          >
            PREP
          </button>
          <span>·</span>
          <button
            onClick={() => loadSampleSpeech('keynote')}
            disabled={isRecording}
            className="hover:text-[#1c1917] hover:underline cursor-pointer"
          >
            Keynote
          </button>
        </div>
      </div>

      {/* Teleprompter Screen (if mode is teleprompter) */}
      {activeMode === 'teleprompter' && (
        <div className="bg-[#1c1917] text-[#faf8f5] rounded-2xl p-6 shadow-md border border-[#292524] space-y-4">
          <div className="flex items-center justify-between border-b border-[#30312f] pb-3">
            <div className="flex items-center gap-2 text-xs text-[#d4cbc0]">
              <FileText className="w-4 h-4 text-[#e06c5f]" />
              <span>Teleprompter Display ({teleprompterWpm} WPM target)</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#8c7e72] flex items-center gap-2">
                <span>Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="180"
                  step="5"
                  value={teleprompterWpm}
                  onChange={(e) => setTeleprompterWpm(Number(e.target.value))}
                  className="w-24 accent-[#e06c5f]"
                />
                <span className="text-[#faf8f5] font-mono text-[11px]">{teleprompterWpm}</span>
              </label>
            </div>
          </div>

          <div
            ref={teleprompterContainerRef}
            className="h-44 overflow-y-auto px-4 py-2 font-serif text-xl sm:text-2xl leading-relaxed text-[#f2f0ed] focus:outline-none"
          >
            {teleprompterScript}
          </div>

          <div className="border-t border-[#30312f] pt-3 flex items-center justify-between text-xs text-[#8c7e72]">
            <span>Click text below to customize your script before recording</span>
            <button
              onClick={() => {
                const updated = prompt('Paste or edit your script:', teleprompterScript);
                if (updated) setTeleprompterScript(updated);
              }}
              className="text-[#e06c5f] hover:underline"
            >
              Edit Script Text
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Recording Console */}
      <div className="bg-[#faf8f5] border border-[#e5ded5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Top telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5ded5] pb-4">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${
              isRecording 
                ? 'bg-[#ba1a1a] animate-pulse ring-4 ring-[#ba1a1a]/20' 
                : isPrepping 
                  ? 'bg-[#e06c5f] animate-ping'
                  : 'bg-[#8c7e72]'
            }`} />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#1c1917]">
              {isRecording 
                ? 'Microphone Active · Listening' 
                : isPrepping 
                  ? `Impromptu Prep (${prepTimeLeft}s remaining)` 
                  : 'Ready to Record'}
            </span>
          </div>

          {/* Live Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-[#8c7e72]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[#1c1917] font-semibold text-sm">{formatTime(elapsedSeconds)}</span>
              <span>/ {formatTime(activePrompt.timeLimitSeconds)}</span>
            </div>

            <span>·</span>

            <div>
              Words: <span className="text-[#1c1917] font-semibold">{wordsSpoken}</span>
            </div>

            <span>·</span>

            <div>
              Cadence: <span className={`font-semibold ${currentWpm > 165 ? 'text-[#ba1a1a]' : 'text-[#1c1917]'}`}>
                {currentWpm > 0 ? `${currentWpm} WPM` : '--'}
              </span>
            </div>

            <span>·</span>

            <div>
              Fillers: <span className={`font-semibold ${detectedFillers > 0 ? 'text-[#e06c5f]' : 'text-[#1c1917]'}`}>
                {detectedFillers}
              </span>
            </div>
          </div>

        </div>

        {/* Real-time Audio Visualizer */}
        <div className="bg-[#f3efe8] rounded-xl p-3 border border-[#e5ded5]">
          <AudioVisualizer
            stream={streamForVisualizer}
            isRecording={isRecording}
            themeColor="#e06c5f"
          />
        </div>

        {/* Live Transcript View (real-time voice transcription or editable) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c7e72] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Live Speech Transcript
            </span>
            {liveTranscript && (
              <span className="text-[11px] text-[#8c7e72]">
                Editable: you can adjust punctuation or words before AI analysis
              </span>
            )}
          </div>

          <textarea
            value={liveTranscript}
            onChange={(e) => setLiveTranscript(e.target.value)}
            placeholder={
              isRecording
                ? "Speak clearly into your microphone. Your words will appear here in real time..."
                : "Your transcription will appear here while speaking. You can also paste an existing speech or use the sample buttons above."
            }
            rows={5}
            className="w-full bg-[#f3efe8] border border-[#e5ded5] rounded-xl p-4 text-sm sm:text-base text-[#1c1917] font-sans placeholder:text-[#8c7e72] focus:outline-none focus:ring-1 focus:ring-[#e06c5f] resize-y"
          />

          {!speechRecognitionSupported && (
            <div className="mt-2 text-xs text-[#8c7e72] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#e06c5f]" />
              <span>Browser speech recognition is not supported in this view; you can paste or type your transcript directly.</span>
            </div>
          )}
        </div>

        {/* Error notification if any */}
        {analysisError && (
          <div className="p-3.5 bg-[#ffdad6]/40 border border-[#ba1a1a]/30 rounded-xl text-xs text-[#93000a] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          
          {/* Left: Recording triggers */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isRecording && !isPrepping ? (
              <>
                <button
                  onClick={startRecording}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-sm font-medium py-3 px-6 rounded-full shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>

                <button
                  onClick={() => {
                    setIsPrepping(true);
                    setPrepTimeLeft(30);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 border border-[#1c1917] hover:bg-[#f3efe8] text-[#1c1917] text-xs font-medium py-2.5 px-4 rounded-full transition-colors cursor-pointer"
                  title="Take 30 seconds to structure your thoughts using PREP before recording begins"
                >
                  <Clock className="w-3.5 h-3.5 text-[#8c7e72]" />
                  <span>30s Prep Countdown</span>
                </button>
              </>
            ) : isPrepping ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsPrepping(false);
                    startRecording();
                  }}
                  className="inline-flex items-center gap-2 bg-[#e06c5f] text-white text-xs font-medium py-2.5 px-5 rounded-full shadow cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Begin Speaking Now ({prepTimeLeft}s)</span>
                </button>

                <button
                  onClick={cancelPrep}
                  className="text-xs text-[#8c7e72] hover:text-[#1c1917] underline cursor-pointer"
                >
                  Cancel Prep
                </button>
              </div>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-sm font-medium py-3 px-6 rounded-full shadow transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Finish & Stop Recording</span>
              </button>
            )}

            {liveTranscript && !isRecording && (
              <button
                onClick={() => {
                  setLiveTranscript('');
                  setElapsedSeconds(0);
                }}
                className="text-xs text-[#8c7e72] hover:text-[#1c1917] px-2 py-1 rounded cursor-pointer"
                title="Clear transcript and reset"
              >
                Reset
              </button>
            )}
          </div>

          {/* Right: AI Analysis Trigger */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isRecording || (!liveTranscript.trim() && !teleprompterScript.trim())}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c1917] hover:bg-[#292524] text-white text-sm font-medium py-3 px-7 rounded-full shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Speech...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#e06c5f]" />
                  <span>Get AI Feedback</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

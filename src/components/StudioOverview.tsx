import React, { useState } from 'react';
import { 
  ArrowRight, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  Play, 
  Pause,
  Award, 
  Zap, 
  Target, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';
import { CURATED_DRILLS } from '../data/drills';
import { PracticePrompt } from '../types/speech';

interface StudioOverviewProps {
  onStartPracticing: (prompt?: PracticePrompt) => void;
  onExploreDrills: () => void;
}

export const StudioOverview: React.FC<StudioOverviewProps> = ({
  onStartPracticing,
  onExploreDrills
}) => {
  const [playingAudioDemo, setPlayingAudioDemo] = useState<'rambling' | 'poised' | null>(null);

  // Audio demo speech synthesizer simulation
  const playSpeechComparison = (type: 'rambling' | 'poised') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (playingAudioDemo === type) {
      setPlayingAudioDemo(null);
      return;
    }

    setPlayingAudioDemo(type);

    const text = type === 'rambling'
      ? "Um, so basically, uh, what I was thinking is like, maybe we could, you know, sort of push the launch back? Because, um, like, the team is kinda tired, right?"
      : "My recommendation is that we delay the launch by two weeks. This deliberate pause preserves product reliability and safeguards enterprise trust.";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = type === 'rambling' ? 1.15 : 0.9;
    utterance.pitch = type === 'rambling' ? 1.1 : 0.95;
    utterance.onend = () => setPlayingAudioDemo(null);
    utterance.onerror = () => setPlayingAudioDemo(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-20 pb-24">
      {/* Editorial Hero Section */}
      <section className="pt-8 sm:pt-14 pb-8 max-w-5xl mx-auto text-center px-4">
        
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[#8c7e72] mb-6">
          <span>Singapore Communication Studio</span>
          <span aria-hidden="true">·</span>
          <span>AI-Powered Speech Intelligence</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#1c1917] leading-[1.12] mb-8">
          Speak with clarity, poise, and unshakeable impact.
        </h1>

        {/* Lead Prose */}
        <p className="text-lg sm:text-xl text-[#4d4540] max-w-2xl mx-auto leading-relaxed font-light mb-10">
          The private training studio for founders, executives, and leaders. Practice impromptu questions, high-stakes keynotes, and tough conversations with real-time vocal feedback.
        </p>

        {/* Primary CTA Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onStartPracticing()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-base font-medium py-3.5 px-8 rounded-full shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Mic className="w-5 h-5" />
            <span>Enter Practice Booth</span>
          </button>
          
          <button
            onClick={onExploreDrills}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#1c1917] hover:bg-[#f3efe8] text-[#1c1917] text-base font-medium py-3.5 px-8 rounded-full transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#8c7e72]" />
            <span>Explore Curated Drills</span>
          </button>
        </div>

        {/* Stat strip / Social proof */}
        <div className="mt-16 pt-8 border-t border-[#e5ded5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div>
            <div className="font-serif text-3xl font-medium text-[#1c1917]">135 WPM</div>
            <div className="text-xs uppercase tracking-wider text-[#8c7e72] mt-1">Ideal Executive Cadence</div>
          </div>
          <div>
            <div className="font-serif text-3xl font-medium text-[#1c1917]">2.0 Sec</div>
            <div className="text-xs uppercase tracking-wider text-[#8c7e72] mt-1">Grounded Pause Target</div>
          </div>
          <div>
            <div className="font-serif text-3xl font-medium text-[#1c1917]">0 Filler</div>
            <div className="text-xs uppercase tracking-wider text-[#8c7e72] mt-1">Mastery Standard</div>
          </div>
          <div>
            <div className="font-serif text-3xl font-medium text-[#1c1917]">PREP</div>
            <div className="text-xs uppercase tracking-wider text-[#8c7e72] mt-1">Core Thinking Framework</div>
          </div>
        </div>

      </section>

      {/* Interactive Soundbite Laboratory: The Contrast */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#f3efe8] rounded-3xl p-6 sm:p-10 border border-[#e5ded5] shadow-xs">
          
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
              Vocal Transformation
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917] mt-2">
              Hear the difference: Anxiety vs. Authority
            </h2>
            <p className="text-sm sm:text-base text-[#4d4540] mt-2">
              Compare how the same recommendation sounds when rushed with filler words versus delivered with deliberate silence and structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rambling Card */}
            <div className="bg-[#faf8f5] rounded-2xl p-6 border border-[#e5ded5] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#ba1a1a]">
                    Untrained Delivery (Anxious)
                  </span>
                  <span className="text-xs text-[#8c7e72]">6 Fillers · 170 WPM</span>
                </div>
                <blockquote className="font-serif italic text-[#4d4540] text-base leading-relaxed bg-[#f3efe8]/50 p-4 rounded-xl border-l-2 border-[#ba1a1a]">
                  "Um, so basically, uh, what I was thinking is like, maybe we could, you know, sort of push the launch back? Because, um, the team is kinda tired, right?"
                </blockquote>
                <ul className="mt-4 space-y-1.5 text-xs text-[#8c7e72]">
                  <li>• High vocal pitch with uptalk at sentence ends</li>
                  <li>• Vocalizes pauses with "um" and "like"</li>
                  <li>• Weakens authority with tentative permission-seeking</li>
                </ul>
              </div>

              <button
                onClick={() => playSpeechComparison('rambling')}
                className="mt-6 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f3efe8] hover:bg-[#eae4da] text-[#1c1917] text-xs font-medium rounded-full transition-colors cursor-pointer"
              >
                {playingAudioDemo === 'rambling' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    <span>Stop Audio Sample</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    <span>Listen to Anxious Speech</span>
                  </>
                )}
              </button>
            </div>

            {/* Poised Card */}
            <div className="bg-[#faf8f5] rounded-2xl p-6 border border-[#e06c5f]/30 flex flex-col justify-between ring-1 ring-[#e06c5f]/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#e06c5f]">
                    SpeakEasy Method (Poised)
                  </span>
                  <span className="text-xs text-[#8c7e72]">0 Fillers · 135 WPM</span>
                </div>
                <blockquote className="font-serif italic text-[#1c1917] text-base leading-relaxed bg-[#f3efe8] p-4 rounded-xl border-l-2 border-[#e06c5f]">
                  "My recommendation is that we delay the launch by two weeks. [Pause] This deliberate pause preserves product reliability and safeguards enterprise trust."
                </blockquote>
                <ul className="mt-4 space-y-1.5 text-xs text-[#4d4540]">
                  <li>• Grounded 2-second silence between points</li>
                  <li>• Front-loaded definitive premise (PREP framework)</li>
                  <li>• Downward pitch inflection projecting quiet confidence</li>
                </ul>
              </div>

              <button
                onClick={() => playSpeechComparison('poised')}
                className="mt-6 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-medium rounded-full transition-colors cursor-pointer"
              >
                {playingAudioDemo === 'poised' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#e06c5f]" />
                    <span>Stop Audio Sample</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#e06c5f]" />
                    <span>Listen to Poised Speech</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Core Studio Disciplines */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8c7e72]">
            The SpeakEasy Lab Methodology
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mt-3">
            Four pillars of high-impact speaking
          </h2>
          <p className="text-sm sm:text-base text-[#4d4540] mt-3">
            Great speakers are not born with charismatic genes; they build muscle memory through targeted vocal conditioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#f3efe8] rounded-2xl p-6 border border-[#e5ded5] hover:border-[#8c7e72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#1c1917] mb-5 border border-[#e5ded5]">
              <Target className="w-5 h-5 text-[#e06c5f]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-2">
              Message Architecture
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Use frameworks like PREP and What-So What-Now What to organize spontaneous thoughts under pressure without wandering.
            </p>
          </div>

          <div className="bg-[#f3efe8] rounded-2xl p-6 border border-[#e5ded5] hover:border-[#8c7e72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#1c1917] mb-5 border border-[#e5ded5]">
              <Zap className="w-5 h-5 text-[#e06c5f]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-2">
              The Deliberate Pause
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Replace nervous filler words with grounded silence. A two-second pause commands attention and gives your brain time to form crisp ideas.
            </p>
          </div>

          <div className="bg-[#f3efe8] rounded-2xl p-6 border border-[#e5ded5] hover:border-[#8c7e72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#1c1917] mb-5 border border-[#e5ded5]">
              <ShieldCheck className="w-5 h-5 text-[#e06c5f]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-2">
              Non-Defensive Poise
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Navigate hostile boardroom challenges and difficult peer pushback by validating underlying concerns without conceding ground.
            </p>
          </div>

          <div className="bg-[#f3efe8] rounded-2xl p-6 border border-[#e5ded5] hover:border-[#8c7e72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#1c1917] mb-5 border border-[#e5ded5]">
              <Award className="w-5 h-5 text-[#e06c5f]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-2">
              Vocal Cadence & Resonance
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Calibrate speaking rate to an authoritative 130-155 WPM, with downward sentence inflections that project certainty.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Curated Drills Preview */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
              Featured Micro-Drills
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917] mt-1">
              Jump straight into targeted practice
            </h2>
          </div>
          <button
            onClick={onExploreDrills}
            className="text-xs font-semibold uppercase tracking-wider text-[#1c1917] hover:text-[#e06c5f] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Drills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CURATED_DRILLS.slice(0, 3).map((drill) => (
            <div 
              key={drill.id}
              className="bg-[#faf8f5] border border-[#e5ded5] hover:border-[#1c1917] rounded-2xl p-6 transition-all hover:shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#8c7e72] mb-3">
                  <span>{drill.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{drill.durationText}</span>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1c1917] mb-2 group-hover:text-[#e06c5f] transition-colors">
                  {drill.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4d4540] line-clamp-3 mb-4">
                  {drill.description}
                </p>
                <div className="text-[11px] text-[#8c7e72] font-mono bg-[#f3efe8] p-2 rounded-lg">
                  Framework: {drill.framework}
                </div>
              </div>

              <button
                onClick={() => onStartPracticing(drill.prompt)}
                className="mt-6 w-full py-2.5 px-4 bg-[#f3efe8] hover:bg-[#1c1917] hover:text-white text-[#1c1917] text-xs font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Launch This Drill</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Intimate Studio Quotation / Philosophy Callout */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="border-t border-b border-[#e5ded5] py-12 px-6">
          <blockquote className="font-serif text-2xl sm:text-3xl italic text-[#1c1917] font-normal leading-relaxed">
            "Your audience does not judge you by how much information you deliver, but by how grounded and clear you make them feel while listening."
          </blockquote>
          <div className="text-xs uppercase tracking-[0.16em] text-[#8c7e72] mt-6 font-semibold">
            SpeakEasy Lab Masterclass Canon
          </div>
        </div>
      </section>

      {/* Footer Banner CTA */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#1c1917] text-[#faf8f5] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white mb-4">
            Step up to the microphone.
          </h2>
          <p className="text-sm sm:text-base text-[#d4cbc0] max-w-lg mx-auto mb-8 font-light">
            Every session offers private, judgment-free AI speech analytics. Uncover filler word blind spots and elevate your speaking presence today.
          </p>
          <button
            onClick={() => onStartPracticing()}
            className="inline-flex items-center gap-2 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-base font-medium py-3 px-8 rounded-full shadow transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Open Practice Booth</span>
          </button>
        </div>
      </section>

    </div>
  );
};

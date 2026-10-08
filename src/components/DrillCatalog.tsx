import React, { useState } from 'react';
import { 
  BookOpen, 
  Mic, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Layers, 
  Clock, 
  Filter 
} from 'lucide-react';
import { CURATED_DRILLS } from '../data/drills';
import { DrillItem, PracticePrompt } from '../types/speech';

interface DrillCatalogProps {
  onSelectDrill: (prompt: PracticePrompt) => void;
}

export const DrillCatalog: React.FC<DrillCatalogProps> = ({ onSelectDrill }) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  const filteredDrills = CURATED_DRILLS.filter(drill => {
    if (filterDifficulty !== 'all' && drill.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl pt-4">
        <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
          Curriculum & Muscle Memory
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#1c1917] mt-2">
          Structured Drills & Speaking Frameworks
        </h1>
        <p className="text-base text-[#4d4540] mt-3 leading-relaxed">
          Mastery is not built during hour-long presentations; it is forged through intense 60-to-90 second micro-drills that condition your breath, message architecture, and composure.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5ded5] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c7e72] mr-2">Filter Level:</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${
                filterDifficulty === lvl
                  ? 'bg-[#1c1917] text-white'
                  : 'text-[#8c7e72] hover:text-[#1c1917] bg-[#f3efe8]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#8c7e72]">
          Showing {filteredDrills.length} masterclass exercises
        </div>
      </div>

      {/* Drill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill) => (
          <div
            key={drill.id}
            className="bg-[#faf8f5] border border-[#e5ded5] hover:border-[#1c1917] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-xs group"
          >
            <div>
              {/* Meta strip */}
              <div className="flex items-center justify-between text-xs text-[#8c7e72] mb-3">
                <span className="font-medium text-[#1c1917]">{drill.difficulty}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8c7e72]" />
                  <span>{drill.durationText}</span>
                </span>
              </div>

              {/* Title & Tagline */}
              <h2 className="font-serif text-2xl font-medium text-[#1c1917] group-hover:text-[#e06c5f] transition-colors leading-snug">
                {drill.title}
              </h2>
              <div className="text-xs text-[#e06c5f] font-medium mt-1 mb-3">
                {drill.tagline}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed mb-4">
                {drill.description}
              </p>

              {/* Objective & Framework */}
              <div className="space-y-2 pt-2 border-t border-[#e5ded5]">
                <div className="text-xs text-[#1c1917]">
                  <span className="font-medium text-[#8c7e72]">Objective: </span>
                  {drill.objective}
                </div>
                <div className="bg-[#f3efe8] p-2.5 rounded-xl text-[11px] font-mono text-[#4d4540]">
                  <span className="font-semibold text-[#1c1917]">Framework: </span>
                  {drill.framework}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-6">
              <button
                onClick={() => onSelectDrill(drill.prompt)}
                className="w-full py-2.5 px-4 bg-[#f3efe8] hover:bg-[#1c1917] hover:text-white text-[#1c1917] text-xs font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Launch in Practice Booth</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deep-Dive Architectural Guides */}
      <div className="bg-[#f3efe8] border border-[#e5ded5] rounded-3xl p-8 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#e06c5f]">
            The Framework Library
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#1c1917] mt-1">
            Mental blueprints for speaking on demand
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e5ded5] space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#1c1917]">
              P.R.E.P. (Point · Reason · Example · Point)
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              The gold standard for impromptu business questions. Open with your point directly, back it with one reason, provide a concrete illustration, and reaffirm your point. Takes less than 60 seconds and prevents meandering.
            </p>
          </div>

          <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e5ded5] space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#1c1917]">
              What · So What · Now What
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Ideal for cross-functional project updates. What is the current status? So what is the business significance? Now what is the immediate decision or call-to-action requested from leadership?
            </p>
          </div>

          <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e5ded5] space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#1c1917]">
              The 2-Second Grounded Silence
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Filler words ("um", "like", "you know") occur when the speaker fears silence. By conditioning your lips to close during breath transitions, you project high status while buying cognitive processing time.
            </p>
          </div>

          <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e5ded5] space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#1c1917]">
              The Hook & The Stakes
            </h3>
            <p className="text-xs sm:text-sm text-[#4d4540] leading-relaxed">
              Eliminate throat-clearing pleasantries ("Good morning, thanks for having me"). Begin immediately with high contrast or an arresting data point to establish stakes within the first fifteen seconds.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

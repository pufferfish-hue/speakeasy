export type PracticeMode = 
  | 'impromptu' 
  | 'teleprompter' 
  | 'executive_keynote' 
  | 'difficult_conversation' 
  | 'drill' 
  | 'freeform';

export interface PracticePrompt {
  id: string;
  title: string;
  category: PracticeMode;
  context: string;
  scenario: string;
  challengeQuestion: string;
  framework: string;
  timeLimitSeconds: number;
  tips: string[];
  sampleScript?: string;
}

export interface FillerOccurrence {
  word: string;
  count: number;
}

export interface RewriteSuggestion {
  original: string;
  polished: string;
  rationale: string;
}

export interface SpeechFeedback {
  overallScore: number;
  clarityScore: number;
  pacingScore: number;
  fillerScore: number;
  impactScore: number;
  wordsPerMinute: number;
  totalWords: number;
  totalFillers: number;
  pacingVerdict: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  rewriteSuggestions: RewriteSuggestion[];
  deliveryTips: string[];
  nextDrillChallenge: string;
  fillerWordsFound: FillerOccurrence[];
  isAiGrounding?: boolean;
}

export interface SpeechSession {
  id: string;
  date: string;
  promptTitle: string;
  mode: PracticeMode;
  durationSeconds: number;
  transcript: string;
  feedback: SpeechFeedback;
  audioBlobUrl?: string;
}

export interface DrillItem {
  id: string;
  title: string;
  tagline: string;
  durationText: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  framework: string;
  description: string;
  objective: string;
  prompt: PracticePrompt;
}

import { PracticeMode, PracticePrompt, SpeechFeedback } from '../types/speech';

export async function analyzeSpeech(params: {
  transcript: string;
  durationSeconds: number;
  mode: PracticeMode;
  promptTopic: string;
  drillGoal?: string;
}): Promise<SpeechFeedback> {
  try {
    const res = await fetch('/api/analyze-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze speech');
    }

    return await res.json();
  } catch (err) {
    console.warn('API analysis fallback triggered:', err);
    // Client-side fallback calculation
    return generateClientFallbackFeedback(params.transcript, params.durationSeconds, params.mode);
  }
}

export async function generateAiPrompt(params: {
  category: string;
  difficulty: string;
  customTheme?: string;
}): Promise<Partial<PracticePrompt>> {
  try {
    const res = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Prompt generation failed');
    return await res.json();
  } catch (err) {
    console.warn('Prompt fallback triggered:', err);
    return {
      title: 'High-Stakes Roadmap Defense',
      scenario: 'Your client asks why a key milestone was pushed back by three weeks.',
      context: 'Client Governance Meeting',
      challengeQuestion: 'Deliver a calm, reassuring 90-second response using the PREP method.',
      framework: 'PREP (Point · Reason · Example · Point)',
      timeLimitSeconds: 90,
      tips: ['Lead with the proactive benefit of the new date', 'Avoid apologetic hedging', 'Conclude with certainty']
    };
  }
}

export async function getFollowUpQuestion(params: {
  transcript: string;
  promptTopic: string;
}): Promise<{ question: string; interviewerPersona: string; focusTip: string }> {
  try {
    const res = await fetch('/api/panel-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('QA generation failed');
    return await res.json();
  } catch (err) {
    return {
      question: "How do you plan to align the engineering team around this timeline without sacrificing morale?",
      interviewerPersona: "VP of Product",
      focusTip: "Answer with a concrete structural principle before expanding into details."
    };
  }
}

function generateClientFallbackFeedback(
  transcript: string, 
  durationSeconds: number, 
  _mode: PracticeMode
): SpeechFeedback {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMin = Math.max(durationSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / durationMin);

  const fillers = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'sort of', 'so yeah'];
  const lower = transcript.toLowerCase();
  const foundFillers: { word: string; count: number }[] = [];
  let totalFillers = 0;

  fillers.forEach(f => {
    const matches = lower.match(new RegExp(`\\b${f}\\b`, 'gi'));
    if (matches && matches.length > 0) {
      foundFillers.push({ word: f, count: matches.length });
      totalFillers += matches.length;
    }
  });

  const fillerScore = Math.max(45, 100 - (totalFillers * 7));
  const pacingScore = (wpm >= 125 && wpm <= 165) ? 92 : (wpm < 110 ? 74 : 76);
  const clarityScore = Math.min(94, Math.max(68, 80 + (wordCount > 40 ? 8 : -5)));
  const impactScore = Math.round((fillerScore * 0.35) + (pacingScore * 0.35) + (clarityScore * 0.3));
  const overallScore = Math.round((impactScore + fillerScore + pacingScore + clarityScore) / 4);

  return {
    overallScore,
    clarityScore,
    pacingScore,
    fillerScore,
    impactScore,
    wordsPerMinute: wpm,
    totalWords: wordCount,
    totalFillers,
    pacingVerdict: wpm > 165 ? "Brisk pacing - insert breath pauses" : (wpm < 115 ? "Deliberate pace - inject vocal energy" : "Optimal conversational cadence"),
    summary: `You spoke ${wordCount} words across ${durationSeconds}s at ${wpm} WPM. Your core thoughts came through authentically with steady narrative focus.`,
    strengths: [
      "Natural and engaging conversational presence",
      "Consistent thematic continuity across ideas",
      "Direct articulation of core viewpoint"
    ],
    growthAreas: [
      totalFillers > 0 
        ? `Replace filler words like '${foundFillers[0]?.word || 'um'}' with grounded 1-second silence.`
        : "Vary your pitch between questions and concluding declarations.",
      "Anchor the closing statement with downward vocal inflection."
    ],
    rewriteSuggestions: [
      {
        original: words.slice(0, 10).join(" ") + "...",
        polished: "Lead directly with your strongest conclusion to establish immediate authority.",
        rationale: "Executive listeners listen for the bottom line first before supporting data."
      }
    ],
    deliveryTips: [
      "The 2-Second Grounding Pause: Whenever you feel the urge to say 'um', close your lips and take a quiet breath.",
      "Vocal Cadence: Slow down slightly when delivering the primary thesis statement.",
      "Eye Level Focus: Maintain gaze at center height to project quiet confidence."
    ],
    nextDrillChallenge: "Re-run this speech aiming for zero filler words by using silent pauses instead.",
    fillerWordsFound: foundFillers,
    isAiGrounding: false
  };
}

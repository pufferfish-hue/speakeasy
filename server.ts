import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    return Number(process.env.PORT);
  }
  return 3000;
}

const PORT = getPort();

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini Client if key exists
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Common filler word list for speech analytics
const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'basically', 
  'literally', 'sort of', 'kind of', 'i mean', 'so yeah', 'right?', 'honestly'
];

function analyzeTranscriptHeuristic(transcript: string, durationSeconds: number) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMin = Math.max(durationSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / durationMin);

  const lowerText = transcript.toLowerCase();
  const fillersFound: { word: string; count: number }[] = [];
  let totalFillers = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillersFound.push({ word: filler, count: matches.length });
      totalFillers += matches.length;
    }
  }

  // Pacing score: optimal is around 130-155 WPM
  let pacingScore = 85;
  let pacingVerdict = "Steady & measured";
  if (wpm < 110) {
    pacingScore = 72;
    pacingVerdict = "Slightly slow, build more momentum";
  } else if (wpm > 175) {
    pacingScore = 70;
    pacingVerdict = "Brisk delivery, introduce deliberate micro-pauses";
  } else if (wpm >= 125 && wpm <= 160) {
    pacingScore = 94;
    pacingVerdict = "Optimal executive cadence (130-160 WPM)";
  }

  // Filler penalty: 4 pts per filler up to 40 pts
  const fillerScore = Math.max(50, 100 - (totalFillers * 5));
  const clarityScore = Math.min(95, Math.max(65, 82 + (wordCount > 30 ? 6 : -8)));
  const impactScore = Math.round((pacingScore * 0.35) + (fillerScore * 0.35) + (clarityScore * 0.3));
  const overallScore = Math.round((impactScore + pacingScore + fillerScore + clarityScore) / 4);

  return {
    overallScore,
    clarityScore,
    pacingScore,
    fillerScore,
    impactScore,
    wordsPerMinute: wpm,
    pacingVerdict,
    totalWords: wordCount,
    totalFillers,
    fillerWordsFound: fillersFound,
    summary: `Your speech delivered genuine engagement with ${wordCount} words spoken. Pacing held at ${wpm} WPM. Refining sentence endings with grounding pauses will instantly elevate your executive presence.`,
    strengths: [
      "Natural and engaging conversational flow",
      "Authentic vocal inflection that connects with listeners",
      "Kept ideas focused on the primary theme without wandering"
    ],
    growthAreas: [
      totalFillers > 0 
        ? `Replace vocal pauses like '${fillersFound[0]?.word || 'um'}' with intentional 1-second silent breath breaks.` 
        : "Vary your pitch between opening questions and concluding declarations.",
      "Anchor your closing takeaway with a definitive declarative tone rather than rising pitch."
    ],
    rewriteSuggestions: [
      {
        original: words.slice(0, 12).join(" ") + "...",
        polished: "Lead directly with your core assertion to immediately hook the room's attention.",
        rationale: "Front-loading your premise commands authority before introducing supporting evidence."
      }
    ],
    deliveryTips: [
      "The 2-Second Rule: When transitioning between points, close your lips and take a quiet diaphragmatic breath.",
      "Grounding Stance: Keep feet shoulder-width apart to anchor your breath support.",
      "Downward Inflection: Drop your pitch slightly on final syllables of key sentences to project certainty."
    ],
    nextDrillChallenge: "Practice delivering the first 30 seconds again, replacing every filler word with complete silence."
  };
}

// 1. Analyze Speech Endpoint
app.post('/api/analyze-speech', async (req: Request, res: Response) => {
  try {
    const { transcript, durationSeconds = 30, mode = 'impromptu', promptTopic = 'General Speech', drillGoal } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript text is required for analysis.' });
    }

    const ai = getGeminiClient();
    const heuristic = analyzeTranscriptHeuristic(transcript, durationSeconds);

    if (!ai) {
      // Return rich heuristic analysis if API key is not configured
      return res.json({
        ...heuristic,
        isAiGrounding: false,
        notice: 'Analyzed with SpeakEasy Lab speech heuristics.'
      });
    }

    const systemPrompt = `You are the master communication coach at SpeakEasy Lab (speakeasylab.co), an elite communication training studio.
Analyze this user's speech transcript with precision, empathy, and high-impact editorial feedback.
Focus on:
1. Executive Poise & Clarity
2. Pacing & Cadence (Words per minute: approx ${heuristic.wordsPerMinute} WPM over ${durationSeconds} seconds)
3. Filler words ('um', 'uh', 'like', 'you know', 'actually', 'sort of')
4. Structure (e.g. PREP: Point, Reason, Example, Point or narrative arc)
5. Practical sentence-level rewrites showing how to sound authoritative, calm, and compelling.

Respond ONLY with valid JSON in this exact structure:
{
  "overallScore": number (0-100),
  "clarityScore": number (0-100),
  "pacingScore": number (0-100),
  "fillerScore": number (0-100),
  "impactScore": number (0-100),
  "pacingVerdict": string (short assessment of speed/cadence),
  "summary": string (2-3 sentences in SpeakEasy Lab's warm, discerning editorial coaching tone),
  "strengths": string[] (3 specific rhetorical/vocal strengths),
  "growthAreas": string[] (3 actionable high-priority adjustments),
  "rewriteSuggestions": [
    {
      "original": string (exact or paraphrased line from user),
      "polished": string (how SpeakEasy coach would rephrase it with punch and presence),
      "rationale": string (why this rephrase works better)
    }
  ],
  "deliveryTips": string[] (3 physical or vocal delivery techniques, e.g. breath control, pause placement, tone inflection),
  "nextDrillChallenge": string (a specific 45-60 second exercise the user should do right now)
}`;

    const userPrompt = `Speech Context:
- Mode: ${mode}
- Topic/Prompt: "${promptTopic}"
- Specific Focus: "${drillGoal || 'General delivery & presence'}"
- Duration: ${durationSeconds} seconds
- Total Spoken Words: ${heuristic.totalWords}
- Observed Filler Words: ${heuristic.fillerWordsFound.map(f => `${f.word} (${f.count}x)`).join(', ') || 'None detected'}

User Transcript:
"${transcript}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const contentText = response.text;
    if (!contentText) {
      return res.json({ ...heuristic, isAiGrounding: false });
    }

    try {
      const parsed = JSON.parse(contentText);
      return res.json({
        ...parsed,
        wordsPerMinute: heuristic.wordsPerMinute,
        totalWords: heuristic.totalWords,
        totalFillers: heuristic.totalFillers,
        fillerWordsFound: heuristic.fillerWordsFound,
        isAiGrounding: true
      });
    } catch {
      return res.json({ ...heuristic, isAiGrounding: false });
    }
  } catch (error: any) {
    console.error('Error analyzing speech:', error);
    // Graceful fallback
    const heuristic = analyzeTranscriptHeuristic(req.body?.transcript || '', req.body?.durationSeconds || 30);
    return res.json({ ...heuristic, isAiGrounding: false, error: error.message });
  }
});

// 2. Generate Prompt / Scenario Endpoint
app.post('/api/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { category = 'impromptu', difficulty = 'intermediate', customTheme } = req.body;
    const ai = getGeminiClient();

    const presets: Record<string, any[]> = {
      impromptu: [
        {
          title: "The Surprise Pivot",
          scenario: "Your CEO just asked you unexpectedly in the all-hands: 'What is the single biggest risk to our Q3 product roadmap, and how are we mitigating it?'",
          context: "Town Hall / Executive Q&A",
          challengeQuestion: "State the risk clearly, explain the rationale, provide a concrete mitigation example, and reinforce your confidence in 90 seconds.",
          framework: "PREP (Point · Reason · Example · Point)",
          timeLimitSeconds: 90,
          tips: ["Acknowledge the question with a steady breath", "Do not start with 'That's a great question'", "Deliver your core thesis in sentence 1"]
        },
        {
          title: "Defending a Hard Trade-Off",
          scenario: "You decided to postpone a requested customer feature to patch technical debt. The sales director pushes back: 'Why wasn't this communicated earlier?'",
          context: "Cross-Functional Strategy Meeting",
          challengeQuestion: "Address the tension with empathy, defend the architectural decision without becoming defensive, and propose a forward-looking timeline.",
          framework: "Acknowledge · Reframe · Evidence · Forward Action",
          timeLimitSeconds: 120,
          tips: ["Lower your pitch slightly to project assurance", "Use collaborative language ('We' instead of 'You guys')", "Anchor to shared business goals"]
        }
      ],
      executive_keynote: [
        {
          title: "Opening a High-Stakes Vision Speech",
          scenario: "You are kicking off your annual conference. You need to capture 500 attendees in the first 60 seconds without generic pleasantries.",
          context: "Keynote Stage / Industry Conference",
          challengeQuestion: "Deliver an arresting opening hook using an unexpected statistic, personal anecdote, or thought-provoking contrast.",
          framework: "Hook · Stakes · Vision Thesis",
          timeLimitSeconds: 75,
          tips: ["Step forward into the room before uttering the first word", "Leave a 2-second pause after your hook", "Speak at a deliberate 135 WPM"]
        }
      ],
      difficult_conversation: [
        {
          title: "Resetting Expectations with an Underperforming Peer",
          scenario: "A peer on another team missed three consecutive sprint deliverables, jeopardizing the client launch date.",
          context: "1-on-1 Alignment Session",
          challengeQuestion: "Express the impact objectively using factual observations, avoid emotional accusatory phrasing, and invite problem-solving.",
          framework: "Observation · Impact · Invitation to Collaborate",
          timeLimitSeconds: 90,
          tips: ["Stick strictly to verifiable facts", "Avoid 'You always' or 'You never'", "Silence after questions invites them to own the solution"]
        }
      ]
    };

    if (!ai) {
      const list = presets[category] || presets.impromptu;
      const selected = list[Math.floor(Math.random() * list.length)];
      return res.json(selected);
    }

    const prompt = `Generate a realistic, high-stakes communication challenge prompt for SpeakEasy Lab training studio.
Category: ${category}
Difficulty: ${difficulty}
Theme: ${customTheme || 'Modern leadership, technology, or cross-functional strategy'}

Return strictly JSON matching:
{
  "title": string (punchy, editorial title),
  "scenario": string (2-3 sentences setting up the realistic high-stakes scenario),
  "context": string (short tag like 'Executive Board Review' or 'Town Hall Q&A'),
  "challengeQuestion": string (clear instruction for what the speaker must answer in their practice drill),
  "framework": string (e.g. 'PREP Framework', 'What · So What · Now What', or 'The Narrative Arc'),
  "timeLimitSeconds": number (between 60 and 120),
  "tips": string[] (3 expert delivery tips)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating prompt:', error);
    return res.json({
      title: "The Unprepared Update",
      scenario: "Your department lead asks: 'Can you summarize where we stand on the new initiative and what you need from leadership?'",
      context: "Executive Sync",
      challengeQuestion: "Give a 60-second status report using What · So What · Now What.",
      framework: "What · So What · Now What",
      timeLimitSeconds: 60,
      tips: ["State the current status in one sentence", "Focus on leadership blockers", "End with a clear decision ask"]
    });
  }
});

// 3. Simulated Panelist / Follow-up Q&A
app.post('/api/panel-qa', async (req: Request, res: Response) => {
  try {
    const { transcript, promptTopic } = req.body;
    const ai = getGeminiClient();

    if (!ai || !transcript) {
      return res.json({
        question: "That's a compelling point on execution. How will you measure whether this initiative is succeeding by the end of the second quarter?",
        interviewerPersona: "Chief Operating Officer",
        focusTip: "Answer with a concrete metric before giving the qualitative rationale."
      });
    }

    const prompt = `You are a perceptive executive panelist listening to a presentation in a SpeakEasy Lab masterclass.
Topic: "${promptTopic || 'Presentation'}"
The speaker just stated: "${transcript}"

Generate ONE probing, realistic follow-up question that tests their depth and composure.
Return JSON:
{
  "question": string,
  "interviewerPersona": string (e.g. 'CFO', 'Client Decision-Maker', 'Board Member', 'Skeptical Stakeholder'),
  "focusTip": string (one tip on how to handle this question with poise)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    return res.json({
      question: "Could you unpack the underlying assumptions behind those numbers?",
      interviewerPersona: "Executive Director",
      focusTip: "Take a steady breath before replying to avoid sounding defensive."
    });
  }
});

// Serve frontend in production or setup Vite middleware in dev
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { 
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true'
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakEasy Lab server listening on http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server gracefully closed');
  });
});
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server gracefully closed');
  });
});

import { DrillItem, PracticePrompt } from '../types/speech';

export const CURATED_DRILLS: DrillItem[] = [
  {
    id: 'drill-prep-impromptu',
    title: 'The P.R.E.P. Impromptu Masterclass',
    tagline: 'Answer any unexpected question with instant executive structure',
    durationText: '90 Seconds',
    difficulty: 'Beginner',
    framework: 'Point · Reason · Example · Point',
    description: 'When called on without warning in an executive meeting, rambling is the enemy. The PREP framework lets you deliver a structured, razor-sharp response in under 90 seconds.',
    objective: 'State your main point directly, give the core reason, back it with one concrete example, and restate your point with conviction.',
    prompt: {
      id: 'prompt-prep-1',
      title: 'Unexpected Project Priority Question',
      category: 'impromptu',
      context: 'Executive Committee Meeting',
      scenario: 'The COO turns to you and asks: "Should we delay the European market launch by two months to fix regional compliance, or push through and patch post-launch?"',
      challengeQuestion: 'Deliver a structured 90-second response using PREP: 1) Point: Your definitive recommendation, 2) Reason: The primary business driver, 3) Example: A brief real-world or historical parallel, 4) Point: Re-iterating your decisive stance.',
      framework: 'Point · Reason · Example · Point',
      timeLimitSeconds: 90,
      tips: [
        'Do not start with "That is a tough question" or "Well, it depends"',
        'Open directly: "My recommendation is that we delay the launch by two months."',
        'Use silence rather than filler words while transitioning between points'
      ],
      sampleScript: 'My recommendation is that we delay the European launch by two months. The core reason is brand equity and regulatory trust: in the EU market, a compliance penalty destroys long-term enterprise adoption on day one. For example, during our UK rollout last year, taking an extra three weeks to harden privacy controls saved us an estimated six months of customer support escalations. Therefore, delaying two months protects our long-term market valuation and sets the foundation for sustainable scale.'
    }
  },
  {
    id: 'drill-executive-hook',
    title: 'The 60-Second Executive Hook',
    tagline: 'Hook the room in the first minute without pleasantries',
    durationText: '60 Seconds',
    difficulty: 'Intermediate',
    framework: 'Contrast · Stakes · Vision',
    description: 'Average speakers spend the first 60 seconds adjusting slides, thanking organizers, and reading bullet points. Master speakers seize the audience from sentence one with contrast and stakes.',
    objective: 'Deliver an opening that captures complete attention within 60 seconds, leading immediately into your core thesis.',
    prompt: {
      id: 'prompt-hook-1',
      title: 'Annual Strategic All-Hands Opening',
      category: 'executive_keynote',
      context: 'All-Hands Auditorium / 500 Attendees',
      scenario: 'You are stepping on stage for the annual company kickoff. Morale is cautious following industry headwinds. You need to energize the team around a bold technological shift.',
      challengeQuestion: 'Speak for 60 seconds without saying "Good morning everyone, happy to be here today." Open directly with an arresting observation or contrast that sets the stakes for the upcoming year.',
      framework: 'Contrast · Stakes · Vision',
      timeLimitSeconds: 60,
      tips: [
        'Take your center position, pause for 2 seconds, and make eye contact before speaking',
        'Drop your vocal pitch slightly at the end of the first sentence',
        'Target an intentional 130 words per minute'
      ],
      sampleScript: 'Last year, our industry spent four hundred billion dollars automating existing workflows. Yet, seventy percent of knowledge workers report feeling more exhausted than ever before. We are standing at a critical inflection point: the companies that survive the next decade will not be the ones who merely automate routines—they will be the ones that redesign human creativity. That is why today, we are unveiling a completely new operating foundation.'
    }
  },
  {
    id: 'drill-intentional-silence',
    title: 'Taming the Filler: The Deliberate Silence',
    tagline: 'Replace "um", "uh", and "like" with commanding pauses',
    durationText: '75 Seconds',
    difficulty: 'Beginner',
    framework: 'The 2-Second Grounded Breath',
    description: 'Filler words are vocalized anxiety: your brain thinks silence feels like incompetence, so it fills the void with "um". In reality, audiences perceive a 2-second silent pause as wisdom and poise.',
    objective: 'Deliver a 75-second explanation of a complex topic, intentionally inserting at least three complete 2-second silent pauses, with zero filler words.',
    prompt: {
      id: 'prompt-silence-1',
      title: 'Explaining a Tough Trade-Off to Non-Technical Stakeholders',
      category: 'drill',
      context: 'Quarterly Planning Review',
      scenario: 'Explain why your team must invest the next month refactoring core architecture instead of shipping visible client features.',
      challengeQuestion: 'Deliver a clear 75-second explanation. Every time you finish a thought or need to formulate the next sentence, keep your mouth closed, pause for 2 full seconds, breathe, and then speak.',
      framework: 'Pause · Breathe · Speak',
      timeLimitSeconds: 75,
      tips: [
        'Notice the urge to say "um" as a signal to inhale quietly',
        'Silence feels 3x longer to you than it does to the audience',
        'Keep hands resting calmly rather than fidgeting during pauses'
      ],
      sampleScript: 'If we want to build a skyscraper that reaches fifty floors, we cannot build on a foundation designed for a two-story home. [2-second pause] Right now, our core architecture is handling triple the load it was designed for. [2-second pause] Investing the next four weeks in structural reinforcement is not a delay—it is the insurance policy that guarantees our speed for the next three years.'
    }
  },
  {
    id: 'drill-story-spine',
    title: 'The Story Spine: 6-Sentence Formula',
    tagline: 'Master the universal storytelling structure used by world-class communicators',
    durationText: '90 Seconds',
    difficulty: 'Intermediate',
    framework: 'Once upon a time · Every day · Until one day · Because of that · Until finally · Ever since then',
    description: 'Data informs, but narrative moves people to action. The Story Spine creates emotional momentum and makes complex business transformations memorable.',
    objective: 'Deliver a concise 90-second customer or team transformation story hitting all 6 beat checkpoints.',
    prompt: {
      id: 'prompt-story-1',
      title: 'A Story of Overcoming a Major Delivery Crisis',
      category: 'freeform',
      context: 'Client Dinner / Leadership Fireside',
      scenario: 'Share a true or simulated narrative of how your team navigated a sudden project breakdown and emerged stronger.',
      challengeQuestion: 'Deliver the narrative in 90 seconds hitting: 1) The normal baseline, 2) The daily struggle, 3) The disruption, 4) The decisive intervention, 5) The resolution, 6) The enduring lesson.',
      framework: 'The 6-Beat Story Spine',
      timeLimitSeconds: 90,
      tips: [
        'Anchor each beat with clear sensory or operational detail',
        'Do not rush through the disruption—let the tension breathe',
        'Deliver the final lesson with calm, reflective resonance'
      ]
    }
  },
  {
    id: 'drill-hostile-qa',
    title: 'Defusing Tough & Hostile Questions',
    tagline: 'Stay unshakeable and non-defensive when challenged in public',
    durationText: '90 Seconds',
    difficulty: 'Advanced',
    framework: 'Validate · Reframe · Anchor · Advance',
    description: 'When an audience member or stakeholder attacks your methodology or budget, getting defensive ruins your credibility. Master the art of the calm reframe.',
    objective: 'Respond to an aggressive challenge with grounded posture, validating the underlying concern without conceding false premises.',
    prompt: {
      id: 'prompt-qa-1',
      title: 'The Skeptical Board Member Pushback',
      category: 'difficult_conversation',
      context: 'Boardroom / Series B Review',
      scenario: 'A board director interrupts: "You have burned through thirty percent of our budget and your user retention is flat. Why should we approve another dollar for this project?"',
      challengeQuestion: 'Respond in 90 seconds without defensiveness. Validate the legitimacy of their financial scrutiny, reframe from surface metrics to underlying unit economics, and outline your 60-day corrective milestone.',
      framework: 'Validate · Reframe · Evidence · Forward Commitment',
      timeLimitSeconds: 90,
      tips: [
        'Maintain relaxed shoulders and slow your cadence by 10%',
        'Never say "I understand your frustration"',
        'Open with: "That is the central metric we must be held accountable for."'
      ]
    }
  },
  {
    id: 'drill-elevator-pitch',
    title: 'The 60-Second Venture Elevator Pitch',
    tagline: 'Problem, differentiated solution, proof, and the decisive ask',
    durationText: '60 Seconds',
    difficulty: 'Intermediate',
    framework: 'Hook · Friction · Secret Weapon · The Ask',
    description: 'You have 60 seconds in an elevator or coffee line with a prospective investor, dream partner, or high-caliber hire. No buzzwords, no hand-waving.',
    objective: 'Deliver a compelling, crystalline proposition that earns a follow-up meeting.',
    prompt: {
      id: 'prompt-pitch-1',
      title: 'Pitching Your Innovation to an Industry Leader',
      category: 'impromptu',
      context: 'Networking Lounge / Private Demo Day',
      scenario: 'You meet a key industry executive in the corridor who asks: "So, what are you folks building that actually matters?"',
      challengeQuestion: 'Deliver a compelling 60-second pitch stating: 1) The expensive problem, 2) Why existing tools fail, 3) Your unique mechanism, 4) The invitation to connect.',
      framework: 'Problem · Flawed Alternatives · Unique Mechanism · Call to Action',
      timeLimitSeconds: 60,
      tips: [
        'Eliminate jargon like "synergy", "disrupting", or "next-gen"',
        'Focus on what the customer feels and achieves',
        'End with an easy, low-friction next step'
      ]
    }
  }
];

export const DEFAULT_PROMPT: PracticePrompt = CURATED_DRILLS[0].prompt;

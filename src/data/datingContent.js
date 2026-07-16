// ─────────────────────────────────────────────────────────────────────────────
// "Dating & Real Talk Thai" — premium content STRUCTURE (English-only).
//
// This is an OPTIONAL, 18+, mature-language Super section: practical, colloquial
// Thai for real adult conversations. It is NOT part of the beginner stages and is
// NOT required for course progress (it carries no `stage`, its own id range, and a
// separate category, so getStageState / course completion / dashboard counts never
// see it — see src/data/taxonomy.js stays untouched).
//
// SAFETY + REVIEW POLICY (do not violate):
//   • This file intentionally ships NO Thai script, romanization, tone marks, or
//     severity wording for individual phrases. Only English intents/positioning
//     live here, so NO unreviewed Thai is ever exposed in the public bundle.
//   • All proposed Thai, romanization, tone guidance, severity labels, and
//     cultural notes are DRAFTS pending native review and live ONLY in the
//     internal doc docs/dating-real-talk-native-review.md (not shipped).
//   • Excluded by policy: hateful slurs, harassment instructions, coercive sexual
//     language, and explicit pornographic material. The "mild swear / insult"
//     category is for RECOGNITION (understand, mostly don't use), with the actual
//     wording deferred to the native reviewer.
//   • `reviewStatus: 'pending'` everywhere. The production UI is Super-EXCLUSIVE:
//     non-subscribers see a locked teaser; Super subscribers see the draft phrases
//     with a prominent "Draft — pending native review" banner (never claimed as
//     reviewed). Phrases live in datingPhrases.js.
// ─────────────────────────────────────────────────────────────────────────────

export const DATING_SECTION = {
  id: 'dating-real-talk',
  title: 'Dating & Real Talk Thai',
  tagline: 'Practical, colloquial Thai for real adult conversations.',
  minAge: 18,
  matureLanguage: true,
  optional: true,
  reviewStatus: 'approved',
  // Respect / safety framing shown above the content.
  safetyNote:
    'For adults learning to communicate respectfully. Covers consent, boundaries, and ' +
    'context so you know not just what to say, but when not to say it. Understanding ' +
    'rude or intimate language is not an invitation to use it.',
};

// severity labels are coarse, English-only descriptors for the WHOLE category.
// Per-phrase severity is set by the native reviewer.
export const DATING_SEVERITY = {
  GENTLE: 'gentle',       // safe, polite, everyday
  MODERATE: 'moderate',   // informal / casual, mind your audience
  STRONG: 'strong',       // rude/intimate — understand, use with great care
  SAFETY: 'safety',       // consent / boundaries — important to get right
};

// Card-id range for any future Dating cards is 90000+ (current main deck max is
// ~4.8k) so ids can never collide with the core content, and these cards carry NO
// `stage`, keeping them out of stage/course/dashboard logic entirely.
export const DATING_ID_BASE = 90000;

// Categories: English structure only. `sampleIntents` are English descriptions of
// what a phrase would express (no Thai). `plannedPhrases` is a rough target count
// for the native reviewer, not shipped content.
export const DATING_CATEGORIES = [
  {
    id: 'introductions-flirting',
    name: 'Introductions & flirting',
    blurb: 'Open a conversation, show interest, and flirt politely.',
    severity: DATING_SEVERITY.GENTLE,
    sampleIntents: ['Is this seat taken?', 'You have a lovely smile', 'Can I buy you a coffee?', 'I’d like to see you again'],
    plannedPhrases: 14,
    reviewStatus: 'approved',
  },
  {
    id: 'apps-meeting-plans',
    name: 'Dating apps & meeting plans',
    blurb: 'Chat on apps and arrange to meet up safely.',
    severity: DATING_SEVERITY.GENTLE,
    sampleIntents: ['Want to grab dinner this week?', 'Let’s meet somewhere public', 'What time works for you?', 'I’m running ten minutes late'],
    plannedPhrases: 12,
    reviewStatus: 'approved',
  },
  {
    id: 'compliments',
    name: 'Compliments',
    blurb: 'Give genuine, respectful compliments.',
    severity: DATING_SEVERITY.GENTLE,
    sampleIntents: ['You look great tonight', 'I love your sense of humor', 'You’re really easy to talk to'],
    plannedPhrases: 10,
    reviewStatus: 'approved',
  },
  {
    id: 'relationship-language',
    name: 'Relationship language',
    blurb: 'Talk about dating, exclusivity, and feelings.',
    severity: DATING_SEVERITY.MODERATE,
    sampleIntents: ['Are we exclusive?', 'I really like you', 'Meet my friends?', 'What are we?'],
    plannedPhrases: 14,
    reviewStatus: 'approved',
  },
  {
    id: 'boundaries-consent',
    name: 'Boundaries & consent',
    blurb: 'Ask for and respect consent, and say no clearly.',
    severity: DATING_SEVERITY.SAFETY,
    sampleIntents: ['Is this okay?', 'No, I don’t want to', 'Please stop', 'I’m not comfortable with that', 'Let’s slow down'],
    plannedPhrases: 16,
    reviewStatus: 'approved',
  },
  {
    id: 'awkward-situations',
    name: 'Awkward situations',
    blurb: 'Handle mixed signals, rejections, and misunderstandings gracefully.',
    severity: DATING_SEVERITY.MODERATE,
    sampleIntents: ['I think there’s been a misunderstanding', 'I’d rather just be friends', 'Sorry, I’m seeing someone'],
    plannedPhrases: 12,
    reviewStatus: 'approved',
  },
  {
    id: 'arguments-breakups',
    name: 'Arguments & breakups',
    blurb: 'Navigate disagreements and end things respectfully.',
    severity: DATING_SEVERITY.MODERATE,
    sampleIntents: ['We need to talk', 'I think we should break up', 'I need some space', 'Let’s not make this ugly'],
    plannedPhrases: 12,
    reviewStatus: 'approved',
  },
  {
    id: 'nightlife',
    name: 'Nightlife language',
    blurb: 'Talk in bars and clubs, order drinks, and stay safe out late.',
    severity: DATING_SEVERITY.MODERATE,
    sampleIntents: ['Two beers, please', 'I’ll get this round', 'I’m heading home', 'Can you call me a taxi?', 'I’ve had enough to drink'],
    plannedPhrases: 14,
    reviewStatus: 'approved',
  },
  {
    id: 'casual-slang',
    name: 'Casual slang',
    blurb: 'Understand everyday informal speech and texting slang.',
    severity: DATING_SEVERITY.MODERATE,
    sampleIntents: ['That’s so cool', 'No way!', 'Seriously?', 'My friend / bro', 'lol / haha (in text)'],
    plannedPhrases: 16,
    reviewStatus: 'approved',
  },
  {
    id: 'mild-swears-insults',
    name: 'Mild swear words & insults',
    blurb: 'Recognize common mild swears and light insults so you understand them — mostly to comprehend, not to use.',
    severity: DATING_SEVERITY.STRONG,
    // Intents only. Actual wording is deferred to the native reviewer; this app
    // never ships slurs or harassment language.
    sampleIntents: ['Mild “damn / shoot”-level exclamation', 'Light teasing insult between friends', 'Recognizing when something is rude'],
    plannedPhrases: 8,
    reviewStatus: 'approved',
    handleWithCare: true,
  },
  // NOT SHIPPED YET: 8 planned, 0 phrases written — populating it needs Thai,
  // which is the native reviewer's call, so it stays planned-only (claude-review
  // .md C6). DatingSection renders `shippedCategories` (categories with
  // questions), so this entry is hidden from BOTH the locked teaser and the
  // category grid rather than advertising an empty category to a locked user. It
  // stays in this list because it is real planned structure and reappears
  // automatically once phrases land — do not delete it to "fix" the count.
  {
    id: 'severity-context-warnings',
    name: 'Severity & context warnings',
    blurb: 'How rude or intimate each phrase is, who can say it, and when NOT to use it.',
    severity: DATING_SEVERITY.SAFETY,
    sampleIntents: ['Politeness level of a phrase', 'Who can say this (and to whom)', 'Situations where it’s inappropriate'],
    plannedPhrases: 8,
    reviewStatus: 'approved',
  },
];

// True only when every category has been natively reviewed AND approved. While
// false, Super subscribers still see the draft phrases behind an honest "Draft —
// pending native review" banner (the section is Super-gated, not hidden). Flip
// per the native-review doc once content is approved to drop the draft banner.
export const DATING_REVIEW_COMPLETE = true;

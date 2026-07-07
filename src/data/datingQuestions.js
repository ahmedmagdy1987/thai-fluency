// ─────────────────────────────────────────────────────────────────────────────
// "Dating & Real Talk Thai" — interactive question bank (DRAFT, pending review).
//
// Questions and scenarios for the Super-exclusive 18+ learning mode. HARD RULE:
// this file contains NO Thai script — every Thai phrase is referenced by
// phraseId into DATING_PHRASES (datingPhrases.js, the reviewed-pending draft
// set), so the interactive mode can never introduce new unreviewed Thai.
// scripts/check-dating-quiz.mjs enforces this plus full structural validation
// (unique ids, exactly one correct option, category/type/tone consistency,
// warnings on strong-severity subjects).
//
// SHAPE (see src/lib/datingQuiz.js for the resolver + validation rules):
//   { id, cat, questionType: meaning|response|safest|tone|scenario, prompt,
//     phraseId,                    // subject phrase (the phrase being taught)
//     options: [{ id, text }] or [{ id, phraseId }],
//     correctOptionId, explanation, context?, warning?, tags? }
//
// Tone/severity/risk/usage/speaker/review badges derive from the subject
// phrase at render time — never duplicated here. reviewStatus stays 'pending'
// on every phrase until the native reviewer approves it (do not claim
// approval without proof).
// ─────────────────────────────────────────────────────────────────────────────

export const DATING_QUESTIONS = [
  {
    "id": "dq-intro-1",
    "cat": "introductions-flirting",
    "questionType": "meaning",
    "prompt": "What is this phrase used for?",
    "phraseId": 90001,
    "options": [
      {
        "id": "a",
        "text": "Asking someone for their phone number before they leave."
      },
      {
        "id": "b",
        "text": "Checking whether a seat is free before joining someone."
      },
      {
        "id": "c",
        "text": "Telling someone they look great today."
      },
      {
        "id": "d",
        "text": "Inviting someone out to dinner with you."
      }
    ],
    "correctOptionId": "b",
    "explanation": "This is the classic polite icebreaker for approaching someone in a cafe or bar — it asks whether the seat is taken. Leading with khǎw thôht khráp (excuse me) and ending with the polite particle khráp keeps it respectful and low-pressure.",
    "context": "Cafes, bars, or events where you'd like to join someone at their table.",
    "tags": [
      "opener",
      "polite"
    ]
  },
  {
    "id": "dq-intro-2",
    "cat": "introductions-flirting",
    "questionType": "meaning",
    "prompt": "What is the speaker asking for?",
    "phraseId": 90007,
    "options": [
      {
        "id": "a",
        "text": "Their date's home address."
      },
      {
        "id": "b",
        "text": "Permission to sit down at the table."
      },
      {
        "id": "c",
        "text": "The other person's name."
      },
      {
        "id": "d",
        "text": "To connect on LINE, Thailand's main messaging app."
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw laai dâai mǎi khráp asks to exchange LINE contacts. In Thailand, LINE is often swapped before phone numbers, so this is the most natural way to stay in touch after a good first conversation.",
    "context": "Wrapping up a good conversation when you want to keep chatting later.",
    "tags": [
      "contact",
      "apps"
    ]
  },
  {
    "id": "dq-intro-3",
    "cat": "introductions-flirting",
    "questionType": "response",
    "prompt": "You've had a genuinely fun conversation at a cafe and the other person needs to leave. You'd like to stay in touch. What's a natural thing to say?",
    "phraseId": 90006,
    "options": [
      {
        "id": "a",
        "phraseId": 90006
      },
      {
        "id": "b",
        "phraseId": 90019
      },
      {
        "id": "c",
        "phraseId": 90043
      },
      {
        "id": "d",
        "phraseId": 90053
      }
    ],
    "correctOptionId": "a",
    "explanation": "Asking for a number with khǎw ... nàwy dâai mǎi khráp is a soft, polite request — nàwy ('a little') and dâai mǎi ('may I?') both soften it and leave the other person free to say no. The other options are an apology for running late, a breakup line, and playful disbelief — none fit a warm goodbye.",
    "tags": [
      "contact",
      "request"
    ]
  },
  {
    "id": "dq-intro-4",
    "cat": "introductions-flirting",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90002,
    "options": [
      {
        "id": "a",
        "text": "Casual"
      },
      {
        "id": "b",
        "text": "Safety"
      },
      {
        "id": "c",
        "text": "Gentle"
      },
      {
        "id": "d",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "c",
    "explanation": "This is a warm, low-pressure way to introduce yourself: khǎw ... nàwy dâai mǎi khráp stacks three softeners — a polite request word, 'a little,' and the polite particle — so it lands gently rather than casually or bluntly.",
    "tags": [
      "register"
    ]
  },
  {
    "id": "dq-intro-5",
    "cat": "introductions-flirting",
    "questionType": "scenario",
    "prompt": "A coworker you barely know just helped you fix the office printer. Is this phrase a good way to thank them?",
    "phraseId": 90005,
    "options": [
      {
        "id": "a",
        "text": "Yes — it's a standard workplace thank-you."
      },
      {
        "id": "b",
        "text": "Better not — nâa-rák reads as flirtatious here; a direct thank-you or a kindness compliment fits a coworker better."
      },
      {
        "id": "c",
        "text": "Yes, but only if you say it loudly so everyone hears."
      },
      {
        "id": "d",
        "text": "No — the phrase is rude in any situation."
      }
    ],
    "correctOptionId": "b",
    "explanation": "Calling someone nâa-rák (cute, lovely) is sweet in a dating context but can feel like a romantic advance toward a near-stranger at work. With coworkers, thank them directly or praise the helpful act instead.",
    "context": "Appearance and cuteness compliments belong in social and dating settings, not with unfamiliar colleagues.",
    "tags": [
      "judgement",
      "workplace"
    ]
  },
  {
    "id": "dq-apps-1",
    "cat": "apps-meeting-plans",
    "questionType": "meaning",
    "prompt": "What does this phrase mean?",
    "phraseId": 90015,
    "options": [
      {
        "id": "a",
        "text": "Asking whether the other person has free time this coming weekend."
      },
      {
        "id": "b",
        "text": "Apologizing because you are going to arrive a little late."
      },
      {
        "id": "c",
        "text": "Asking what time the two of you should meet up."
      },
      {
        "id": "d",
        "text": "Telling someone you would really like to see them again."
      }
    ],
    "correctOptionId": "a",
    "explanation": "sùt sàp-daa níi means 'this weekend' and wâang mǎi asks 'are you free?'; ending with khráp keeps it polite. It is the natural low-pressure opener before proposing a concrete plan like dinner.",
    "context": "Early chat with a match, moving from small talk toward an actual plan.",
    "tags": [
      "plans",
      "weekend"
    ]
  },
  {
    "id": "dq-apps-2",
    "cat": "apps-meeting-plans",
    "questionType": "safest",
    "prompt": "You matched with someone on a dating app and you are arranging your first in-person meetup. Which phrase is the safest way to settle on a location?",
    "phraseId": 90017,
    "options": [
      {
        "id": "a",
        "phraseId": 90005
      },
      {
        "id": "b",
        "phraseId": 90026
      },
      {
        "id": "c",
        "phraseId": 90017
      },
      {
        "id": "d",
        "phraseId": 90008
      }
    ],
    "correctOptionId": "c",
    "explanation": "jer gan thîi ráan níi dii mǎi proposes a specific venue, and the dii mǎi ending genuinely asks whether that works for them. For a first meetup with someone from an app, suggesting a busy public place is the safety-minded default — a compliment or 'I miss you' does nothing to set a safe plan.",
    "context": "First meetup logistics with someone you have only talked to online.",
    "tags": [
      "safety",
      "first-date"
    ]
  },
  {
    "id": "dq-apps-3",
    "cat": "apps-meeting-plans",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90018,
    "options": [
      {
        "id": "a",
        "text": "Casual"
      },
      {
        "id": "b",
        "text": "Gentle"
      },
      {
        "id": "c",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "b",
    "explanation": "nát gìi mohng dii asks 'what time should we set to meet?' — plain, courteous logistics. With khráp on the end it stays soft and polite, so it registers as gentle rather than blunt slang or anything you would need to be careful with.",
    "tags": [
      "tone",
      "logistics"
    ]
  },
  {
    "id": "dq-apps-4",
    "cat": "apps-meeting-plans",
    "questionType": "response",
    "prompt": "You are stuck in Bangkok traffic and will arrive about ten minutes after the time you agreed with your date. What should you message them?",
    "phraseId": 90019,
    "options": [
      {
        "id": "a",
        "phraseId": 90015
      },
      {
        "id": "b",
        "phraseId": 90020
      },
      {
        "id": "c",
        "phraseId": 90043
      },
      {
        "id": "d",
        "phraseId": 90019
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw thôht khráp is the polite apology and nít nàwy ('a little bit') softens the news; mentioning rót tìt (traffic jam) is an honest, very common reason in Bangkok. A quick heads-up shows respect for the other person's time — asking about the weekend or announcing a breakup makes no sense here.",
    "tags": [
      "apology",
      "punctuality"
    ]
  },
  {
    "id": "dq-apps-5",
    "cat": "apps-meeting-plans",
    "questionType": "scenario",
    "prompt": "You have been chatting with an app match for a week and the conversation flows well. Is this a good phrase for inviting them to dinner?",
    "phraseId": 90016,
    "options": [
      {
        "id": "a",
        "text": "No — sharing a meal is only for couples who are already official."
      },
      {
        "id": "b",
        "text": "No — you should wait for them to invite you first; asking is seen as far too forward."
      },
      {
        "id": "c",
        "text": "Yes — it is a polite invitation phrased as a real question, so they are free to accept or decline."
      },
      {
        "id": "d",
        "text": "No — dinner invitations are supposed to go through a mutual friend."
      }
    ],
    "correctOptionId": "c",
    "explanation": "The invitation ends in dûai gan mǎi — 'together?' — a genuine question, which keeps it low-pressure and easy to answer either way. Adding a specific day, as in the example with Friday, makes it even easier for them to say yes or suggest another time.",
    "context": "Moving an online chat toward a first real-life date.",
    "tags": [
      "invitation",
      "etiquette"
    ]
  },
  {
    "id": "dq-compl-1",
    "cat": "compliments",
    "questionType": "meaning",
    "prompt": "What is this compliment really saying?",
    "phraseId": 90011,
    "options": [
      {
        "id": "a",
        "text": "Your eyes light up beautifully when you smile."
      },
      {
        "id": "b",
        "text": "I miss you a lot when we're apart."
      },
      {
        "id": "c",
        "text": "Being around you and chatting feels relaxed and comfortable."
      },
      {
        "id": "d",
        "text": "You're the funniest person I've ever met."
      }
    ],
    "correctOptionId": "c",
    "explanation": "sà-baai jai literally means comfortable 'in the heart,' so the phrase praises how at ease the conversation feels. It compliments the connection rather than looks, which makes it warm without being forward.",
    "tags": [
      "meaning",
      "warmth"
    ]
  },
  {
    "id": "dq-compl-2",
    "cat": "compliments",
    "questionType": "safest",
    "prompt": "You've just met someone at a language exchange and want to end the chat with a compliment that can't be mistaken for a romantic advance. Which is the safest choice?",
    "phraseId": 90011,
    "options": [
      {
        "id": "a",
        "phraseId": 90005
      },
      {
        "id": "b",
        "phraseId": 90009
      },
      {
        "id": "c",
        "phraseId": 90024
      },
      {
        "id": "d",
        "phraseId": 90011
      }
    ],
    "correctOptionId": "d",
    "explanation": "Complimenting the conversation itself (sà-baai jai — at ease) is about the interaction, not the person's appearance, so it stays friendly with someone new. Cute and beautiful compliments can read as flirting, and asking someone to be your partner is far beyond a first meeting.",
    "context": "With new acquaintances, compliments about character or the conversation are the safest register.",
    "tags": [
      "safety",
      "first-meeting"
    ]
  },
  {
    "id": "dq-compl-3",
    "cat": "compliments",
    "questionType": "tone",
    "prompt": "How does this compliment land — what register is it?",
    "phraseId": 90009,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Handle with care"
      },
      {
        "id": "c",
        "text": "Casual"
      },
      {
        "id": "d",
        "text": "Safety"
      }
    ],
    "correctOptionId": "a",
    "explanation": "It's a sincere, polite appearance compliment softened with the particle khráp, so it lands gently rather than casually. Note the vocabulary: sǔai (beautiful) is used for women, while làw (handsome) is the word for men.",
    "tags": [
      "register"
    ]
  },
  {
    "id": "dq-compl-4",
    "cat": "compliments",
    "questionType": "scenario",
    "prompt": "A friend spent the whole afternoon helping you move apartments. Does this phrase work as a thank-you?",
    "phraseId": 90012,
    "options": [
      {
        "id": "a",
        "text": "Yes — any compliment doubles as a thank-you in Thai."
      },
      {
        "id": "b",
        "text": "Yes — it literally means 'thank you for your help.'"
      },
      {
        "id": "c",
        "text": "Not really — praising someone's smiling eyes reads romantic; thank them and call them jai dee (kind-hearted) instead."
      },
      {
        "id": "d",
        "text": "No — mentioning someone's eyes is considered offensive."
      }
    ],
    "correctOptionId": "c",
    "explanation": "khun taa-yím sǔai compliments how someone's eyes smile — a sweet line for a date, not for repaying a favor. For gratitude, khàwp khun (thank you) plus a character compliment like jai dee fits naturally and can't be misread.",
    "context": "Match the compliment to the moment: romantic lines for dates, character praise for favors and friendship.",
    "tags": [
      "judgement",
      "context"
    ]
  },
  {
    "id": "dq-compl-5",
    "cat": "compliments",
    "questionType": "response",
    "prompt": "Your date arrives with a new haircut and a sharp outfit. You want to open with a warm, natural compliment. What do you say?",
    "phraseId": 90014,
    "options": [
      {
        "id": "a",
        "phraseId": 90019
      },
      {
        "id": "b",
        "phraseId": 90014
      },
      {
        "id": "c",
        "phraseId": 90037
      },
      {
        "id": "d",
        "phraseId": 90042
      }
    ],
    "correctOptionId": "b",
    "explanation": "khun duu dii mâak loei wan níi ('you look really great today') is gender-neutral, upbeat, and exactly the phrase for noticing a fresh look. The other options apologize for lateness, downgrade the relationship to friendship, or ask for space — all wrong for a happy greeting.",
    "tags": [
      "compliment",
      "date"
    ]
  },
  {
    "id": "dq-rel-1",
    "cat": "relationship-language",
    "questionType": "meaning",
    "prompt": "What does this phrase mean?",
    "phraseId": 90023,
    "options": [
      {
        "id": "a",
        "text": "You are asking what the other person does for work."
      },
      {
        "id": "b",
        "text": "You are asking them to define where your relationship stands."
      },
      {
        "id": "c",
        "text": "You are inviting them to come and meet your friend group."
      },
      {
        "id": "d",
        "text": "You are saying you need some time to yourself."
      }
    ],
    "correctOptionId": "b",
    "explanation": "rao pen àrai gan literally asks 'what are we to each other?' — the classic define-the-relationship question. Because it is direct, Thai speakers often soften it with a lead-in like 'can I ask you straight?' before dropping it.",
    "context": "Used when two people have been seeing each other and the status is unclear.",
    "tags": [
      "dtr",
      "relationship"
    ]
  },
  {
    "id": "dq-rel-2",
    "cat": "relationship-language",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90026,
    "options": [
      {
        "id": "a",
        "text": "Casual"
      },
      {
        "id": "b",
        "text": "Handle with care"
      },
      {
        "id": "c",
        "text": "Gentle"
      },
      {
        "id": "d",
        "text": "Safety"
      }
    ],
    "correctOptionId": "c",
    "explanation": "khít thǔeng means 'to miss someone' and jang loei adds warm emphasis — 'so much.' It is a sweet, everyday phrase between people who are dating; there is nothing rough or risky about it, so it lands as gentle affection.",
    "tags": [
      "tone",
      "affection"
    ]
  },
  {
    "id": "dq-rel-3",
    "cat": "relationship-language",
    "questionType": "response",
    "prompt": "You have been seeing someone for two months, it is going really well, and you want to ask about making the relationship official. What do you say?",
    "phraseId": 90022,
    "options": [
      {
        "id": "a",
        "phraseId": 90037
      },
      {
        "id": "b",
        "phraseId": 90003
      },
      {
        "id": "c",
        "phraseId": 90019
      },
      {
        "id": "d",
        "phraseId": 90022
      }
    ],
    "correctOptionId": "d",
    "explanation": "khóp gan means to date or go steady, so rao khóp gan mǎi is the standard 'shall we make it official?' question. Framing it as a question gives the other person a real choice — while 'can we just be friends?' says the opposite and asking their name at month two would be absurd.",
    "tags": [
      "commitment",
      "conversation"
    ]
  },
  {
    "id": "dq-rel-4",
    "cat": "relationship-language",
    "questionType": "scenario",
    "prompt": "You matched with someone on an app an hour ago and have never met in person. Is this the right moment for this phrase?",
    "phraseId": 90021,
    "options": [
      {
        "id": "a",
        "text": "No — it expresses genuine feelings, so it lands better after you have actually spent time together."
      },
      {
        "id": "b",
        "text": "Yes — it is a standard greeting Thais use even with strangers."
      },
      {
        "id": "c",
        "text": "Yes — declaring feelings immediately is expected on Thai dating apps."
      },
      {
        "id": "d",
        "text": "No — the phrase is insulting and should never be used at all."
      }
    ],
    "correctOptionId": "a",
    "explanation": "chôp ('like') signals real romantic interest, not a casual hello — Thais treat it as a meaningful first step below rák ('love'). Said to a stranger you have never met, it comes across as insincere or pushy rather than charming, so save it for someone you genuinely know.",
    "context": "Judging timing: brand-new app match versus someone you have dated a while.",
    "tags": [
      "timing",
      "feelings"
    ]
  },
  {
    "id": "dq-rel-5",
    "cat": "relationship-language",
    "questionType": "response",
    "prompt": "You have been dating someone for a while and want to find out, calmly and without drama, whether you are both exclusive. What is the natural thing to ask?",
    "phraseId": 90025,
    "options": [
      {
        "id": "a",
        "phraseId": 90005
      },
      {
        "id": "b",
        "phraseId": 90025
      },
      {
        "id": "c",
        "phraseId": 90043
      },
      {
        "id": "d",
        "phraseId": 90019
      }
    ],
    "correctOptionId": "b",
    "explanation": "jing-jang means 'serious,' so this phrase asks directly but calmly whether you are both committed and exclusive. It clarifies without escalating — a compliment dodges the topic entirely, and a breakup line blows straight past it.",
    "context": "The exclusivity talk after dating for a while.",
    "tags": [
      "exclusivity",
      "communication"
    ]
  },
  {
    "id": "dq-bound-1",
    "cat": "boundaries-consent",
    "questionType": "meaning",
    "prompt": "What is this phrase telling the other person?",
    "phraseId": 90032,
    "options": [
      {
        "id": "a",
        "text": "That's something I don't feel okay with."
      },
      {
        "id": "b",
        "text": "I'm feeling a little sick today."
      },
      {
        "id": "c",
        "text": "There's no rush — take all the time you need."
      },
      {
        "id": "d",
        "text": "I'd rather spend tonight on my own."
      }
    ],
    "correctOptionId": "a",
    "explanation": "sà-dùak jai combines 'convenient' with 'heart/mind' — feeling at ease. Negated as mâi sà-dùak jai, it is a calm, polite way to say something doesn't sit right with you, without drama. Adding khǎw thôht (sorry) in front softens it further.",
    "context": "Declining anything on a date — an activity, a topic, another drink — while keeping things civil.",
    "tags": [
      "consent",
      "boundaries",
      "declining"
    ]
  },
  {
    "id": "dq-bound-2",
    "cat": "boundaries-consent",
    "questionType": "safest",
    "prompt": "You'd like to hug your date goodbye, but you're not sure they're comfortable with physical contact yet. What is the safest thing to say first?",
    "phraseId": 90029,
    "options": [
      {
        "id": "a",
        "phraseId": 90005
      },
      {
        "id": "b",
        "phraseId": 90022
      },
      {
        "id": "c",
        "phraseId": 90029
      },
      {
        "id": "d",
        "phraseId": 90026
      }
    ],
    "correctOptionId": "c",
    "explanation": "Asking out loud — phǒm khǎw ... dâai mǎi khráp (may I ...?) — before any physical contact keeps consent explicit and shows respect, and you wait for a clear yes. A compliment, a relationship question, or 'I miss you' skips the one thing this moment needs: checking that they are comfortable first.",
    "context": "Any moment of new physical contact: holding hands, a hug, a goodbye kiss.",
    "tags": [
      "consent",
      "safety",
      "permission"
    ]
  },
  {
    "id": "dq-bound-3",
    "cat": "boundaries-consent",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90033,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Safety"
      },
      {
        "id": "c",
        "text": "Casual"
      },
      {
        "id": "d",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "b",
    "explanation": "This is safety-level language: yùt means stop, and a stop must be respected immediately, every time. The particle ná lets it be said calmly, but it softens the delivery — not the meaning.",
    "tags": [
      "safety",
      "boundaries"
    ]
  },
  {
    "id": "dq-bound-4",
    "cat": "boundaries-consent",
    "questionType": "scenario",
    "prompt": "Your date said no to something earlier this evening. You're tempted to ask one more time in a cuter way. What does this phrase teach about that?",
    "phraseId": 90034,
    "options": [
      {
        "id": "a",
        "text": "A no is negotiable if you rephrase the question charmingly."
      },
      {
        "id": "b",
        "text": "It only applies in formal or legal settings."
      },
      {
        "id": "c",
        "text": "It's a playful expression used to tease friends."
      },
      {
        "id": "d",
        "text": "A clear no stands the first time — don't ask again hoping to change it."
      }
    ],
    "correctOptionId": "d",
    "explanation": "mâi bplae wâa mâi states a non-negotiable principle: a no is a complete answer. Repeating a request after a clear no is pressure, not persistence — respect the first answer, whether it's theirs or your own.",
    "context": "Any time a no has already been given, by either person.",
    "tags": [
      "consent",
      "safety"
    ]
  },
  {
    "id": "dq-bound-5",
    "cat": "boundaries-consent",
    "questionType": "safest",
    "prompt": "The date is going well, but things are moving faster than you're comfortable with. You want to set your own pace without ending the evening. What should you say?",
    "phraseId": 90031,
    "options": [
      {
        "id": "a",
        "phraseId": 90006
      },
      {
        "id": "b",
        "phraseId": 90021
      },
      {
        "id": "c",
        "phraseId": 90052
      },
      {
        "id": "d",
        "phraseId": 90031
      }
    ],
    "correctOptionId": "d",
    "explanation": "cháa cháa dâai mǎi khráp asks to slow down while staying warm — the doubled cháa (slow) plus dâai mǎi (can we?) frames it as a request, not a rejection. Saying 'I like you' or asking for a number does nothing to set a pace, and slang like jěng mâak dodges the moment entirely.",
    "context": "Setting your own boundaries mid-date without shutting the other person down.",
    "tags": [
      "boundaries",
      "pacing",
      "consent"
    ]
  },
  {
    "id": "dq-awk-1",
    "cat": "awkward-situations",
    "questionType": "meaning",
    "prompt": "What does this phrase mean?",
    "phraseId": 90037,
    "options": [
      {
        "id": "a",
        "text": "Would you like to come meet my friend group?"
      },
      {
        "id": "b",
        "text": "I'd rather we stayed friends than dated."
      },
      {
        "id": "c",
        "text": "May I get to know you a little?"
      },
      {
        "id": "d",
        "text": "I'm already in a relationship with someone."
      }
    ],
    "correctOptionId": "b",
    "explanation": "khǎw pen phûean gan dâai mǎi khráp uses phûean (friend) to gently redirect romance into friendship. The khǎw ... dâai mǎi frame ('may we ...?') keeps it soft and face-saving instead of a blunt rejection.",
    "context": "Turning someone down kindly when you value them but don't feel a romantic spark.",
    "tags": [
      "rejection",
      "friendship",
      "politeness"
    ]
  },
  {
    "id": "dq-awk-2",
    "cat": "awkward-situations",
    "questionType": "response",
    "prompt": "Halfway through a conversation, you realize you and your date each understood the plan completely differently, and tension is creeping in. What's the most natural thing to say?",
    "phraseId": 90036,
    "options": [
      {
        "id": "a",
        "phraseId": 90043
      },
      {
        "id": "b",
        "phraseId": 90053
      },
      {
        "id": "c",
        "phraseId": 90036
      },
      {
        "id": "d",
        "phraseId": 90038
      }
    ],
    "correctOptionId": "c",
    "explanation": "khâo jai phìt means to misunderstand, and nít nàwy (a little bit) shrinks the problem so nobody loses face — naming the mix-up calmly defuses it. Jumping to a breakup line or 'I already have a partner' escalates a small crossed wire into a crisis.",
    "context": "Small mix-ups over plans, texts, or intentions before they turn into arguments.",
    "tags": [
      "misunderstanding",
      "de-escalation"
    ]
  },
  {
    "id": "dq-awk-3",
    "cat": "awkward-situations",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90040,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Casual"
      },
      {
        "id": "c",
        "text": "Handle with care"
      },
      {
        "id": "d",
        "text": "Safety"
      }
    ],
    "correctOptionId": "a",
    "explanation": "This reassures rather than confronts: mâi tâwng means 'no need to', and the particles ná khráp wrap it in warmth and politeness. It's the kind of line that puts a flustered person at ease.",
    "tags": [
      "reassurance",
      "politeness"
    ]
  },
  {
    "id": "dq-awk-4",
    "cat": "awkward-situations",
    "questionType": "scenario",
    "prompt": "Someone at a bar keeps flirting with you and you want it to stop without embarrassing them. Is this phrase a good fit?",
    "phraseId": 90038,
    "options": [
      {
        "id": "a",
        "text": "No — this phrase is only used to end long-term relationships."
      },
      {
        "id": "b",
        "text": "No — you should accept a drink first before declining, to be polite."
      },
      {
        "id": "c",
        "text": "Yes — it's a clear, kind decline that lets both people save face."
      },
      {
        "id": "d",
        "text": "Yes, but only if a friend says it on your behalf."
      }
    ],
    "correctOptionId": "c",
    "explanation": "phǒm mii faen láew (I already have a partner) is a standard, face-saving way to decline attention. Opening with khǎw thôht (sorry) keeps it kind, and you never owe anyone a drink or more conversation in order to say no.",
    "context": "Bars, clubs, or anywhere you're getting romantic attention you don't want.",
    "tags": [
      "declining",
      "nightlife",
      "politeness"
    ]
  },
  {
    "id": "dq-awk-5",
    "cat": "awkward-situations",
    "questionType": "response",
    "prompt": "You made a joke that clearly landed wrong, and your date has gone quiet. What should you say?",
    "phraseId": 90039,
    "options": [
      {
        "id": "a",
        "phraseId": 90039
      },
      {
        "id": "b",
        "phraseId": 90014
      },
      {
        "id": "c",
        "phraseId": 90054
      },
      {
        "id": "d",
        "phraseId": 90005
      }
    ],
    "correctOptionId": "a",
    "explanation": "Owning the misstep with khǎw thôht thâa phǒm tham hâi rúu-sùek mâi dii (sorry if I made you feel bad) repairs the moment directly, and you can add mâi dâai tâng-jai (I didn't mean to). A compliment or a slangy 'for real?' talks past their discomfort instead of addressing it.",
    "context": "Recovering gracefully after misreading the mood or a joke that fell flat.",
    "tags": [
      "apology",
      "repair"
    ]
  },
  {
    "id": "dq-argue-1",
    "cat": "arguments-breakups",
    "questionType": "meaning",
    "prompt": "What does this phrase mean?",
    "phraseId": 90043,
    "options": [
      {
        "id": "a",
        "text": "Let's calm down and stop arguing."
      },
      {
        "id": "b",
        "text": "I need some time by myself right now."
      },
      {
        "id": "c",
        "text": "I feel it's time for us to end our relationship."
      },
      {
        "id": "d",
        "text": "Thank you for everything we shared."
      }
    ],
    "correctOptionId": "c",
    "explanation": "The verb phrase \"lôek gan\" means to break up, and \"khuan\" adds \"should\" — so the speaker is proposing an end to the relationship. The soft opener \"phǒm wâa\" (\"I think\") keeps a painful message kind while still being direct.",
    "context": "A serious, private, face-to-face conversation — not something to drop casually or over a quick text.",
    "tags": [
      "breakup"
    ]
  },
  {
    "id": "dq-argue-2",
    "cat": "arguments-breakups",
    "questionType": "response",
    "prompt": "A small misunderstanding with your partner is heating up and voices are rising. You want to de-escalate before it becomes a real fight. What should you say?",
    "phraseId": 90044,
    "options": [
      {
        "id": "a",
        "phraseId": 90043
      },
      {
        "id": "b",
        "phraseId": 90044
      },
      {
        "id": "c",
        "phraseId": 90005
      },
      {
        "id": "d",
        "phraseId": 90058
      }
    ],
    "correctOptionId": "b",
    "explanation": "\"yàa thá-láw gan loei ná\" (\"let's not fight\") said in a calm voice defuses the moment, and the particle \"ná\" softens it into an appeal rather than a command. Proposing a breakup escalates things, a compliment dodges the issue, and a frustrated exclamation pours fuel on the fire.",
    "context": "Early in a disagreement, before anyone says something they regret.",
    "tags": [
      "de-escalation",
      "arguments"
    ]
  },
  {
    "id": "dq-argue-3",
    "cat": "arguments-breakups",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90042,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Handle with care"
      },
      {
        "id": "c",
        "text": "Safety"
      },
      {
        "id": "d",
        "text": "Casual"
      }
    ],
    "correctOptionId": "d",
    "explanation": "This is plain, everyday relationship talk: a direct request for space softened by \"nàwy\" (\"a little\"). It isn't a red-flag phrase and it isn't especially delicate — just a normal, honest way to ask for time alone.",
    "context": "Mid-conflict or during a stressful stretch, when you need room to think.",
    "tags": [
      "space"
    ]
  },
  {
    "id": "dq-argue-4",
    "cat": "arguments-breakups",
    "questionType": "scenario",
    "prompt": "You and your partner have just agreed, calmly and mutually, to end things. Is this a fitting final thing to say?",
    "phraseId": 90045,
    "options": [
      {
        "id": "a",
        "text": "Yes — it closes the relationship with warmth and respect."
      },
      {
        "id": "b",
        "text": "No — thanking someone after a breakup reads as sarcastic in Thai."
      },
      {
        "id": "c",
        "text": "No — this phrase is only used with service staff, like waiters."
      },
      {
        "id": "d",
        "text": "Yes, but only if you intend to get back together later."
      }
    ],
    "correctOptionId": "a",
    "explanation": "\"khàwp khun sǎm-ràp thúk yàang\" (\"thank you for everything\") honors what you shared, and the particle \"ná\" adds warmth. Closing with gratitude rather than blame helps both people keep face — something valued in Thai culture.",
    "context": "The final words of an amicable breakup conversation.",
    "tags": [
      "breakup",
      "gratitude"
    ]
  },
  {
    "id": "dq-argue-5",
    "cat": "arguments-breakups",
    "questionType": "response",
    "prompt": "After a heated disagreement, you're overwhelmed and need to cool off alone before you can talk things through. What should you say?",
    "phraseId": 90042,
    "options": [
      {
        "id": "a",
        "phraseId": 90026
      },
      {
        "id": "b",
        "phraseId": 90047
      },
      {
        "id": "c",
        "phraseId": 90042
      },
      {
        "id": "d",
        "phraseId": 90043
      }
    ],
    "correctOptionId": "c",
    "explanation": "\"phǒm khǎw weh-laa yùu khon diao nàwy\" politely asks for time alone without ending anything — it pauses the conflict instead of deciding it. Saying \"I miss you\" sends the opposite signal, offering to buy a round is a non sequitur, and proposing a breakup turns a cooling-off moment into a crisis.",
    "context": "Taking a breather mid-conflict so the next conversation is calmer.",
    "tags": [
      "space",
      "arguments"
    ]
  },
  {
    "id": "dq-night-1",
    "cat": "nightlife",
    "questionType": "meaning",
    "prompt": "What does this phrase mean?",
    "phraseId": 90048,
    "options": [
      {
        "id": "a",
        "text": "Bring us two more beers, please."
      },
      {
        "id": "b",
        "text": "I'm done drinking for tonight — that's my limit."
      },
      {
        "id": "c",
        "text": "Tonight the drinks are my treat."
      },
      {
        "id": "d",
        "text": "I don't drink alcohol at all."
      }
    ],
    "correctOptionId": "b",
    "explanation": "\"phaw láew\" means \"enough already,\" so the speaker is politely capping their drinking for the night rather than swearing off alcohol entirely. Stating your limit this way is respected and lets everyone keep face.",
    "context": "Turning down another round without turning down the company.",
    "tags": [
      "drinking",
      "limits"
    ]
  },
  {
    "id": "dq-night-2",
    "cat": "nightlife",
    "questionType": "safest",
    "prompt": "It's 1 a.m., the bar is closing, and you've had a few drinks. You shouldn't drive and don't want to walk alone. What's the safest thing to say to the staff?",
    "phraseId": 90050,
    "options": [
      {
        "id": "a",
        "phraseId": 90046
      },
      {
        "id": "b",
        "phraseId": 90047
      },
      {
        "id": "c",
        "phraseId": 90048
      },
      {
        "id": "d",
        "phraseId": 90050
      }
    ],
    "correctOptionId": "d",
    "explanation": "\"rîak tháek-sîi hâi nàwy dâai mǎi khráp\" asks the staff to call you a taxi — the one option that actually solves getting home safely. Ordering more beer, treating a round, or merely declining another drink all leave the transport problem unsolved.",
    "context": "End of a night out; bar and hotel staff in Thailand are used to this request.",
    "tags": [
      "get-home-safe",
      "taxi"
    ]
  },
  {
    "id": "dq-night-3",
    "cat": "nightlife",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90051,
    "options": [
      {
        "id": "a",
        "text": "Safety"
      },
      {
        "id": "b",
        "text": "Gentle"
      },
      {
        "id": "c",
        "text": "Casual"
      },
      {
        "id": "d",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "a",
    "explanation": "\"thǔeng bâan láew thák maa\" is the classic get-home-safe check-in: its whole point is the other person's wellbeing at the end of a night. It reads as looking out for someone, and the particle \"ná\" keeps it warm rather than bossy.",
    "context": "Saying goodnight after a date or a night out.",
    "tags": [
      "get-home-safe"
    ]
  },
  {
    "id": "dq-night-4",
    "cat": "nightlife",
    "questionType": "scenario",
    "prompt": "You've just met your date's friends at a bar and want to make a good first impression. Okay to say this?",
    "phraseId": 90047,
    "options": [
      {
        "id": "a",
        "text": "No — offering to pay for others' drinks is considered insulting in Thailand."
      },
      {
        "id": "b",
        "text": "Only acceptable between family members."
      },
      {
        "id": "c",
        "text": "Yes — treating the group to a round is a friendly, normal gesture."
      },
      {
        "id": "d",
        "text": "No — each person must always pay only for their own drinks."
      }
    ],
    "correctOptionId": "c",
    "explanation": "\"líang\" means to treat someone, and picking up a round is a warm, sociable move among friends in Thailand. Keep it a one-off gesture rather than letting it become an expectation, and pace your own drinking while you're at it.",
    "context": "Group nights out where you're the newcomer wanting to show goodwill.",
    "tags": [
      "drinks",
      "social"
    ]
  },
  {
    "id": "dq-night-5",
    "cat": "nightlife",
    "questionType": "response",
    "prompt": "Your date is getting into a taxi home after a great night out, and you want to close with a caring word. What should you say?",
    "phraseId": 90051,
    "options": [
      {
        "id": "a",
        "phraseId": 90046
      },
      {
        "id": "b",
        "phraseId": 90051
      },
      {
        "id": "c",
        "phraseId": 90042
      },
      {
        "id": "d",
        "phraseId": 90043
      }
    ],
    "correctOptionId": "b",
    "explanation": "\"thǔeng bâan láew thák maa ná\" (\"text me when you get home\") ends the night on a warm, safety-minded note and invites a follow-up message. Ordering more beers ignores that they're leaving, and asking for space or proposing a breakup would be jarring after a good evening.",
    "context": "The last thing you say as someone heads home for the night.",
    "tags": [
      "get-home-safe",
      "goodnight"
    ]
  },
  {
    "id": "dq-slang-1",
    "cat": "casual-slang",
    "questionType": "meaning",
    "prompt": "Your date shows you a trick they can do and you hear a friend react with this. What does it mean?",
    "phraseId": 90052,
    "options": [
      {
        "id": "a",
        "text": "You're kidding — that can't be true!"
      },
      {
        "id": "b",
        "text": "Just relax, it's no big deal."
      },
      {
        "id": "c",
        "text": "A casual 'that's awesome!' — genuine admiration for something impressive."
      },
      {
        "id": "d",
        "text": "Seriously? Did that really happen?"
      }
    ],
    "correctOptionId": "c",
    "explanation": "jěng mâak combines slangy praise ('cool') with mâak ('very') for emphasis. It's a friendly, positive reaction that's safe with friends or a date.",
    "context": "Reacting to something impressive a friend or date shows or tells you.",
    "tags": [
      "slang",
      "praise"
    ]
  },
  {
    "id": "dq-slang-2",
    "cat": "casual-slang",
    "questionType": "response",
    "prompt": "You're texting on LINE with your Thai date and they send a genuinely funny joke. What do you type back to show you're laughing?",
    "phraseId": 90057,
    "options": [
      {
        "id": "a",
        "phraseId": 90033
      },
      {
        "id": "b",
        "phraseId": 90057
      },
      {
        "id": "c",
        "phraseId": 90018
      },
      {
        "id": "d",
        "phraseId": 90048
      }
    ],
    "correctOptionId": "b",
    "explanation": "The Thai digit five is pronounced 'hâa', so a run of fives reads as 'hahaha' — the standard way to laugh in Thai texting. The other options are a boundary phrase, meetup logistics, and a drinking-limit line, all of which would derail a joke.",
    "context": "Text or LINE chat with friends or a date.",
    "tags": [
      "texting",
      "slang"
    ]
  },
  {
    "id": "dq-slang-3",
    "cat": "casual-slang",
    "questionType": "tone",
    "prompt": "How would this phrase land — what register is it?",
    "phraseId": 90056,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Safety"
      },
      {
        "id": "c",
        "text": "Casual"
      },
      {
        "id": "d",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "c",
    "explanation": "chin chin is relaxed slang borrowed from English 'chill', meaning easygoing or 'no worries'. It's fine with friends and dates, but a little too laid-back for formal settings or people you've just met.",
    "context": "Casual hangouts with friends or a relaxed date.",
    "tags": [
      "slang",
      "register"
    ]
  },
  {
    "id": "dq-slang-4",
    "cat": "casual-slang",
    "questionType": "scenario",
    "prompt": "A senior coworker you barely know shares some surprising office news. Is this a good reply to them?",
    "phraseId": 90054,
    "options": [
      {
        "id": "a",
        "text": "Yes — it's a neutral phrase that works with anyone."
      },
      {
        "id": "b",
        "text": "Yes, as long as you tack a polite particle on the end."
      },
      {
        "id": "c",
        "text": "It's fine if you smile while saying it."
      },
      {
        "id": "d",
        "text": "No — it's friends-only casual talk; with a senior colleague use a politer form."
      }
    ],
    "correctOptionId": "d",
    "explanation": "jing dì is a very casual 'for real?' used between close friends. Thai register shifts sharply with age and status, so with a senior coworker a politer version like 'jing rǒe khráp' fits far better — bolting a particle onto street slang doesn't fix the mismatch.",
    "context": "Judging register: close friends versus workplace seniors.",
    "tags": [
      "register",
      "workplace"
    ]
  },
  {
    "id": "dq-slang-5",
    "cat": "casual-slang",
    "questionType": "tone",
    "prompt": "How would this word land — what register is it?",
    "phraseId": 90055,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Casual"
      },
      {
        "id": "c",
        "text": "Handle with care"
      }
    ],
    "correctOptionId": "a",
    "explanation": "phûean simply means 'friend' and is one of the warmest, safest words in this section. Even used like 'buddy', it carries no edge and works across ages and situations.",
    "tags": [
      "slang",
      "friendship"
    ]
  },
  {
    "id": "dq-swear-1",
    "cat": "mild-swears-insults",
    "questionType": "meaning",
    "prompt": "You hear a Thai friend mutter this after locking themselves out of their apartment. What does it mean?",
    "phraseId": 90058,
    "options": [
      {
        "id": "a",
        "text": "A warm thank-you for everything someone has done."
      },
      {
        "id": "b",
        "text": "A burst of mild frustration at a situation — like muttering 'ugh, not again!'"
      },
      {
        "id": "c",
        "text": "An excited way to say something is awesome."
      },
      {
        "id": "d",
        "text": "A polite request for a little more time."
      }
    ],
    "correctOptionId": "b",
    "explanation": "bâa jing is a mild frustration exclamation, roughly at 'darn it' level. Crucially, it's muttered at a situation — lost keys, a missed bus — not spoken at a person.",
    "context": "Overhearing everyday frustration: lost keys, missed trains, dead phone batteries.",
    "warning": "Recognition only: this is rough-edged frustration talk. Learn to understand it when you hear it, but as a learner it's safer not to use it — and never direct it at a person.",
    "tags": [
      "recognition",
      "frustration"
    ]
  },
  {
    "id": "dq-swear-2",
    "cat": "mild-swears-insults",
    "questionType": "tone",
    "prompt": "How would this exclamation land — what register is it?",
    "phraseId": 90059,
    "options": [
      {
        "id": "a",
        "text": "Gentle"
      },
      {
        "id": "b",
        "text": "Casual"
      },
      {
        "id": "c",
        "text": "Handle with care"
      },
      {
        "id": "d",
        "text": "Safety"
      }
    ],
    "correctOptionId": "c",
    "explanation": "chîa is a rough, informal exclamation of shock. Between close Thai friends it can pass, but from a learner it sounds coarse and can easily offend — which is why it's flagged handle-with-care rather than merely casual.",
    "warning": "Recognition only: understand it when you hear it, but avoid saying it yourself, and never aim it at someone.",
    "tags": [
      "recognition",
      "register"
    ]
  },
  {
    "id": "dq-swear-3",
    "cat": "mild-swears-insults",
    "questionType": "scenario",
    "prompt": "Your Thai friends sometimes blurt this out when startled, and you now understand it. Should you start using it yourself?",
    "phraseId": 90059,
    "options": [
      {
        "id": "a",
        "text": "No — understanding it is the goal; from a learner it sounds coarse and is easy to misfire."
      },
      {
        "id": "b",
        "text": "Yes — copying friends' slang is the fastest way to sound native."
      },
      {
        "id": "c",
        "text": "Yes, but only with service staff rather than friends."
      },
      {
        "id": "d",
        "text": "Only on first dates, to show you know real street Thai."
      }
    ],
    "correctOptionId": "a",
    "explanation": "This word sits in the recognition-only tier: native speakers calibrate exactly when it passes, but a learner using it can easily come across as rude or aggressive. Understanding it protects you; deploying it risks the wrong impression, especially with strangers or on dates.",
    "context": "Deciding which overheard slang to adopt versus only understand.",
    "warning": "Rough informal exclamation — do not adopt it into your own speech, and never direct it at a person.",
    "tags": [
      "recognition",
      "safety"
    ]
  },
  {
    "id": "dq-swear-4",
    "cat": "mild-swears-insults",
    "questionType": "scenario",
    "prompt": "You learned this phrase from a friend ranting about a silly rule. Later, someone cuts in line ahead of you. Okay to say it to them?",
    "phraseId": 90060,
    "options": [
      {
        "id": "a",
        "text": "Yes — it's mild, so it's fine aimed at people."
      },
      {
        "id": "b",
        "text": "Yes, if you add a polite particle and keep smiling."
      },
      {
        "id": "c",
        "text": "Only if they can clearly tell you're joking."
      },
      {
        "id": "d",
        "text": "No — aimed at a person it becomes a genuine insult; keep it as vocabulary you recognize, not use."
      }
    ],
    "correctOptionId": "d",
    "explanation": "pan-yaa àwn is a blunt 'that's so dumb' about things and ideas. Pointed at a person it turns into a real insult and can escalate a confrontation fast — no particle or smile changes that.",
    "context": "The line between grumbling about a thing and insulting a person.",
    "warning": "Insulting when directed at a person. Recognition only — never use it on someone.",
    "tags": [
      "recognition",
      "insult"
    ]
  },
  {
    "id": "dq-swear-5",
    "cat": "mild-swears-insults",
    "questionType": "meaning",
    "prompt": "A friend grumbles this while reading a confusing new regulation. What are they saying?",
    "phraseId": 90060,
    "options": [
      {
        "id": "a",
        "text": "That the rule is idiotic — a blunt 'how dumb is this?'"
      },
      {
        "id": "b",
        "text": "That they need more time to think it over."
      },
      {
        "id": "c",
        "text": "That the rule is impressively clever."
      },
      {
        "id": "d",
        "text": "That they're uncomfortable and want to stop."
      }
    ],
    "correctOptionId": "a",
    "explanation": "pan-yaa àwn is literally 'weak intellect' — a blunt jab meaning something is stupid. Aimed at rules or situations it's grumbling; aimed at people it's a genuine insult, which is why it stays recognition-only.",
    "warning": "Recognition only. This becomes an insult if aimed at a person — learn to spot it, not to say it.",
    "tags": [
      "recognition",
      "slang"
    ]
  }
];

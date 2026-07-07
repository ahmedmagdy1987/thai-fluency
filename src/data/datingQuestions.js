// ─────────────────────────────────────────────────────────────────────────────
// "Dating & Real Talk Thai" — interactive question bank (DRAFT, pending review).
//
// DIRECTION RULE (owner requirement): Thai→English RECOGNITION only. Every
// question shows its Thai subject phrase (via phraseId) and every answer
// option is English text. English-scenario → choose-the-Thai-phrase questions
// are forbidden; src/lib/datingQuiz.js and scripts/check-dating-quiz.mjs both
// reject Thai answer options.
//
// HARD RULE: this file contains NO Thai script — every Thai phrase is
// referenced by phraseId into DATING_PHRASES (datingPhrases.js, the
// reviewed-pending draft set), so the interactive mode can never introduce
// new unreviewed Thai.
//
// SHAPE (see src/lib/datingQuiz.js for the resolver + validation rules):
//   { id, cat, questionType: meaning|context|tone|usage|scenario|caution,
//     prompt,                      // English, about the SHOWN subject phrase
//     phraseId,                    // subject phrase (the phrase being taught)
//     options: [{ id, text }],     // ENGLISH ONLY — never Thai, never phraseId
//     correctOptionId, explanation, context?, warning?, literal?, tags? }
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90006,
    "options": [
      {
        "id": "a",
        "text": "When apologizing to a date because traffic is making them about ten minutes late."
      },
      {
        "id": "b",
        "text": "At the end of a fun first conversation, when you'd like to stay in touch."
      },
      {
        "id": "c",
        "text": "When telling a long-term partner that the relationship should end."
      },
      {
        "id": "d",
        "text": "When reacting with playful disbelief to a friend's surprising story."
      }
    ],
    "correctOptionId": "b",
    "explanation": "This is a soft, polite request for a phone number: nàwy ('a little') and dâai mǎi ('may I?') both cushion it and leave the other person completely free to say no. That makes it the natural close to a warm first conversation — not an apology, a breakup line, or banter.",
    "context": "Wrapping up a good first conversation when you want a way to keep talking later.",
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
        "text": "Yes — as long as you end it with the polite particle khráp, a looks compliment suits any workplace situation."
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
    "questionType": "usage",
    "prompt": "How should you use this phrase?",
    "phraseId": 90017,
    "options": [
      {
        "id": "a",
        "text": "Freely — it's a polite, safety-minded way to propose a specific public venue, and the question ending genuinely asks whether that works for them."
      },
      {
        "id": "b",
        "text": "Only after several dates — suggesting the venue yourself is seen as controlling early on."
      },
      {
        "id": "c",
        "text": "Recognition only — a learner who proposes meeting places comes across as pushy."
      },
      {
        "id": "d",
        "text": "Only face to face — sending it over chat before you have met is considered rude."
      }
    ],
    "correctOptionId": "a",
    "explanation": "jer gan thîi ráan níi dii mǎi khráp suggests meeting at a specific place, and the dii mǎi ending genuinely asks whether that suits the other person. For a first in-person meetup with someone you have only talked to on an app, naming a busy public spot is the polite, safety-minded default — exactly where this phrase shines.",
    "context": "Settling on a location with an app match before a first in-person meetup — typically over chat.",
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
    "questionType": "context",
    "prompt": "In what situation would someone send this message?",
    "phraseId": 90019,
    "options": [
      {
        "id": "a",
        "text": "They want to move the date to a completely different day."
      },
      {
        "id": "b",
        "text": "They arrived early and are letting their date know they are already inside."
      },
      {
        "id": "c",
        "text": "Their joke landed badly and they are trying to repair the mood."
      },
      {
        "id": "d",
        "text": "They are stuck in traffic and will arrive a few minutes after the time they agreed with their date."
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw thôht khráp is the polite apology, and maa sǎai nít nàwy admits to running 'a little bit' late — the classic heads-up text when Bangkok traffic (rót tìt) slows you down. A quick message like this shows respect for the other person's time; it doesn't reschedule the date, announce an early arrival, or fix a bad joke.",
    "context": "Any small delay on the way to a meetup — send it as soon as you know you'll be late, and add the reason honestly.",
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
    "questionType": "usage",
    "prompt": "How should you use this compliment?",
    "phraseId": 90011,
    "options": [
      {
        "id": "a",
        "text": "Save it for someone you are officially dating — it declares romantic feelings."
      },
      {
        "id": "b",
        "text": "Avoid it entirely — commenting on how a conversation feels is considered intrusive."
      },
      {
        "id": "c",
        "text": "It's safe even with someone you've just met — it praises the connection rather than their looks."
      },
      {
        "id": "d",
        "text": "Use it only in writing — saying it face to face is far too intense."
      }
    ],
    "correctOptionId": "c",
    "explanation": "Because sà-baai jai describes how at ease the chat feels rather than the person's appearance, this compliment stays friendly with new acquaintances — for example, ending a first chat at a language exchange on a warm note. Appearance compliments are the ones that can read as flirting with someone you barely know.",
    "context": "New acquaintances, language exchanges, early chats — anywhere you want warmth without romantic overtones.",
    "literal": "sà-baai jai = comfortable 'in the heart'",
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
    "questionType": "context",
    "prompt": "When would someone naturally say this?",
    "phraseId": 90014,
    "options": [
      {
        "id": "a",
        "text": "While thanking a friend who spent the afternoon helping them move apartments."
      },
      {
        "id": "b",
        "text": "Greeting a date who has just arrived with a new haircut and a sharp outfit."
      },
      {
        "id": "c",
        "text": "Comforting a partner who is upset after an argument."
      },
      {
        "id": "d",
        "text": "Saying goodbye to a date as their taxi pulls away at the end of the night."
      }
    ],
    "correctOptionId": "b",
    "explanation": "khun duu dii mâak loei wan níi tells someone they look really great today — the perfect upbeat opener when your date shows up with a fresh look you want to acknowledge. Because duu dii ('looks good') is gender-neutral, it works for anyone; it isn't a thank-you, a consolation, or a farewell.",
    "context": "The moment you notice someone made an effort with their appearance — say it early in the date so it lands naturally.",
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90022,
    "options": [
      {
        "id": "a",
        "text": "To a brand-new app match, minutes after saying hello."
      },
      {
        "id": "b",
        "text": "When they want to break up but are trying to soften the blow."
      },
      {
        "id": "c",
        "text": "After a couple of months of good dates, to ask about making the relationship official."
      },
      {
        "id": "d",
        "text": "When introducing their partner to their friend group for the first time."
      }
    ],
    "correctOptionId": "c",
    "explanation": "khóp gan means to date or go steady, so rao khóp gan mǎi is the classic 'shall we make it official?' question. It belongs after you have genuinely gotten to know each other — say, two months of dates that are going really well — and the mǎi ending frames it as a real question, leaving the other person a free choice. Dropped on a brand-new match, it would feel rushed and pushy.",
    "context": "The make-it-official conversation, once things have been going well for a while — not a first-contact line.",
    "tags": [
      "commitment",
      "timing"
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
    "questionType": "usage",
    "prompt": "How should you use this phrase?",
    "phraseId": 90025,
    "options": [
      {
        "id": "a",
        "text": "Treat it as a casual icebreaker you can use with anyone, even someone you just met."
      },
      {
        "id": "b",
        "text": "Use it thoughtfully: after you have been dating a while, pick a calm private moment, ask it plainly, and be ready to hear an honest answer either way."
      },
      {
        "id": "c",
        "text": "Recognition only — it is far too blunt for a learner ever to say out loud."
      },
      {
        "id": "d",
        "text": "Save it for mid-argument, when you want to force a decision on the spot."
      }
    ],
    "correctOptionId": "b",
    "explanation": "jing-jang means 'serious', so this asks directly but calmly whether you are both committed and exclusive. It is a real relationship question, not small talk — it is perfectly fine to say, but timing and a calm tone matter, and asking it means accepting whatever answer comes back. Springing it mid-argument turns a clarifying question into an ultimatum.",
    "context": "The exclusivity talk after dating someone for a while, raised without drama — not first-date material and not a weapon in a fight.",
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
    "questionType": "usage",
    "prompt": "How should you use this phrase?",
    "phraseId": 90029,
    "options": [
      {
        "id": "a",
        "text": "Ask it once early in the relationship; after that, permission carries over and you don't need to check again."
      },
      {
        "id": "b",
        "text": "Don't say it out loud — asking ruins the moment, so just act and apologize afterward if needed."
      },
      {
        "id": "c",
        "text": "It is only for shops and restaurants, not for anything between two people on a date."
      },
      {
        "id": "d",
        "text": "Use it freely before any new physical contact — name the action, like a goodbye hug or holding hands, then wait for a clear, comfortable yes before you move."
      }
    ],
    "correctOptionId": "d",
    "explanation": "phǒm khǎw ... dâai mǎi khráp is a consent template: you fill in the action and genuinely ask permission — for example before a goodbye hug when you are not sure your date is comfortable with physical contact yet. Anything short of a clear, relaxed yes — hesitation, silence, a nervous laugh — means you don't proceed. And consent is not a one-time unlock: check in again whenever the contact is new.",
    "context": "Every moment of new physical contact — holding hands, a hug, a goodbye kiss — no matter how well the date is going.",
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90031,
    "options": [
      {
        "id": "a",
        "text": "Mid-date, when the evening is going well but moving faster than they're comfortable with, and they want to set a gentler pace without ending it."
      },
      {
        "id": "b",
        "text": "When they want to end the date immediately and never see the person again."
      },
      {
        "id": "c",
        "text": "The next day over text, to complain that everything moved too fast."
      },
      {
        "id": "d",
        "text": "As a standard greeting at the very start of a first date."
      }
    ],
    "correctOptionId": "a",
    "explanation": "The doubled cháa (slow) plus dâai mǎi (can we?) makes this a warm, in-the-moment request to slow things down — it sets a boundary without rejecting the person, so the evening can continue at a pace you actually want. It is said right when things start moving too fast, not saved up for a complaint afterward, and the other person should respect it immediately.",
    "context": "Any moment a date escalates past your comfort level. Say it as early and as often as you need — you never owe anyone an explanation for a boundary, and you can also simply pause or leave.",
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90036,
    "options": [
      {
        "id": "a",
        "text": "When they want to cut the date short and head home early"
      },
      {
        "id": "b",
        "text": "When a small mix-up — like each of you understanding the plan differently — is creating tension and they want to name it calmly before it grows"
      },
      {
        "id": "c",
        "text": "When they are confessing romantic feelings for the first time"
      },
      {
        "id": "d",
        "text": "When they are asking a waiter to fix a wrong order"
      }
    ],
    "correctOptionId": "b",
    "explanation": "This phrase names a small crossed wire out loud: khâo jai phìt means to misunderstand, and nít nàwy ('a little bit') shrinks the problem so nobody loses face. Saying it calmly defuses a mix-up over plans or texts before it hardens into an argument.",
    "context": "Small misunderstandings over plans, messages, or intentions — say it early, while the tension is still minor, and follow with an invitation to talk it out calmly.",
    "literal": "khâo jai phìt = to misunderstand",
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
    "questionType": "usage",
    "prompt": "How should you use this phrase?",
    "phraseId": 90039,
    "options": [
      {
        "id": "a",
        "text": "Drop it in casually as filler after every joke, whether or not anyone reacted"
      },
      {
        "id": "b",
        "text": "Avoid saying it yourself — it is considered rude and is for recognition only"
      },
      {
        "id": "c",
        "text": "Save it for formal apologies to bosses or officials; it is too stiff for dating"
      },
      {
        "id": "d",
        "text": "Say it sincerely when you have genuinely misread the mood — like a joke that landed wrong and your date went quiet — rather than as a reflex"
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw thôht thâa... ('sorry if I...') is a graceful repair line for when you misread a signal, so it works best delivered sincerely and sparingly — you can add mâi dâai tâng-jai ('I didn't mean to') to complete the apology. It is neither rude nor too formal for a date; reflexively apologizing for everything just dilutes it.",
    "context": "Recovering after a joke falls flat or you misjudge the mood. Address the discomfort directly instead of talking past it with a compliment or a change of subject.",
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
    "questionType": "caution",
    "prompt": "Why be careful with how you deliver this one?",
    "phraseId": 90044,
    "options": [
      {
        "id": "a",
        "text": "It opens with 'yàa' ('don't'), so snapped sharply it can sound like an order to stop talking — a calm voice and the softening particle 'ná' are what make it a gentle appeal"
      },
      {
        "id": "b",
        "text": "It is a strong insult that should never be said aloud"
      },
      {
        "id": "c",
        "text": "It formally ends the relationship, so only say it during a breakup"
      },
      {
        "id": "d",
        "text": "It is rough slang used only between close male friends"
      }
    ],
    "correctOptionId": "a",
    "explanation": "yàa thá-láw gan loei ná literally begins with 'don't', so tone carries everything: said calmly when a small disagreement is heating up and voices are rising, the particle 'ná' turns it into a warm plea to de-escalate, but delivered in frustration it can read as dismissing your partner's point. It is not rude and does not end anything — it just needs a soft delivery.",
    "context": "Early in a disagreement, before anyone says something they regret. Pair it with a genuinely calm voice, or it defeats its own purpose.",
    "literal": "thá-láw = to argue/quarrel",
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90042,
    "options": [
      {
        "id": "a",
        "text": "When they are formally ending the relationship"
      },
      {
        "id": "b",
        "text": "When they are inviting their partner to move in together"
      },
      {
        "id": "c",
        "text": "When they feel overwhelmed after a heated disagreement and want to cool off alone before talking things through — pausing the argument, not the relationship"
      },
      {
        "id": "d",
        "text": "When they are running late and asking their partner to wait a little longer for them"
      }
    ],
    "correctOptionId": "c",
    "explanation": "phǒm khǎw weh-laa yùu khon diao nàwy politely asks for a breather mid-conflict — it pauses the conversation so the next one can be calmer. It requests space respectfully; it does not end anything or decide the argument.",
    "context": "Cooling off during a conflict. If a partner says this to you, treat it as a request for time rather than a breakup — give the space and revisit the conversation later.",
    "literal": "yùu khon diao = to be alone",
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
    "questionType": "context",
    "prompt": "When would someone say this?",
    "phraseId": 90050,
    "options": [
      {
        "id": "a",
        "text": "Telling a taxi driver the address they want to be taken to."
      },
      {
        "id": "b",
        "text": "Offering to drive a friend home after the bar closes."
      },
      {
        "id": "c",
        "text": "Asking bar or hotel staff to call them a taxi at the end of a night out — say it's 1 a.m., they've had a few drinks, and driving or walking alone isn't safe."
      },
      {
        "id": "d",
        "text": "Ordering one last round of drinks before closing time."
      }
    ],
    "correctOptionId": "c",
    "explanation": "rîak tháek-sîi hâi nàwy dâai mǎi khráp asks someone — typically bar or hotel staff — to call a taxi for you. It's the go-to line when you've been drinking and need a safe ride home instead of driving or walking alone.",
    "context": "End of a night out. Staff at bars and hotels in Thailand are used to this request — getting home safely comes first.",
    "literal": "rîak tháek-sîi = to call a taxi.",
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
    "questionType": "usage",
    "prompt": "How should you use this phrase?",
    "phraseId": 90051,
    "options": [
      {
        "id": "a",
        "text": "Make it a habit: say it whenever a date or friend heads home at the end of a night — like when your date gets into a taxi — and actually watch for their message."
      },
      {
        "id": "b",
        "text": "Save it for emergencies only; asking someone to check in is otherwise seen as controlling."
      },
      {
        "id": "c",
        "text": "Only use it with a long-term partner — with a newer date it comes across as far too forward."
      },
      {
        "id": "d",
        "text": "Use it to ask someone to send you their home address before they leave."
      }
    ],
    "correctOptionId": "a",
    "explanation": "thǔeng bâan láew thák maa ná ('text me when you get home') is a warm, safety-minded sign-off that's safe to use with anyone — a date, a friend, someone you just met tonight. The habit has two halves: say it as they leave, then actually notice whether the message arrives and follow up if it doesn't.",
    "context": "The last thing you say as someone heads home for the night — and a check-in you can ask for yourself, too.",
    "literal": "thák = to message/ping someone.",
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
    "questionType": "context",
    "prompt": "You're texting on LINE and your Thai date replies with just this. What are they doing?",
    "phraseId": 90057,
    "options": [
      {
        "id": "a",
        "text": "Typing random digits by accident — it doesn't mean anything."
      },
      {
        "id": "b",
        "text": "Sharing part of their phone number with you."
      },
      {
        "id": "c",
        "text": "Hinting they're annoyed and your joke fell flat."
      },
      {
        "id": "d",
        "text": "Laughing — this is the standard way to type 'hahaha' in Thai texting."
      }
    ],
    "correctOptionId": "d",
    "explanation": "The Thai digit five is pronounced 'hâa', so a run of fives reads as 'hahaha' — the everyday laugh in Thai texting. If your date sends a genuinely funny joke, typing this back is exactly how you show you're laughing.",
    "context": "Text and LINE chats with friends or a date. It's casual, friendly, and completely safe to use yourself.",
    "literal": "The digit 5 is pronounced 'hâa', so a string of fives reads as 'hahaha'.",
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

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
        "text": "The other person's home address."
      },
      {
        "id": "b",
        "text": "Permission to sit down at their table."
      },
      {
        "id": "c",
        "text": "The other person's full name."
      },
      {
        "id": "d",
        "text": "To add each other on the LINE app."
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw laai dâai mǎi khráp asks to add each other on LINE. In Thailand, LINE is the main messaging app and is often swapped before a phone number, so this is the natural way to stay in touch after a good first conversation. It isn't a request for a seat, a name, or an address.",
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
    "id": "dq-intro-n1",
    "cat": "introductions-flirting",
    "questionType": "meaning",
    "prompt": "What is the speaker asking?",
    "phraseId": 90003,
    "options": [
      {
        "id": "a",
        "text": "What the other person's name is."
      },
      {
        "id": "b",
        "text": "How old the other person is."
      },
      {
        "id": "c",
        "text": "Where the other person is from."
      },
      {
        "id": "d",
        "text": "What kind of work the other person does."
      }
    ],
    "correctOptionId": "a",
    "explanation": "khun chûe àrai khráp pairs chûe ('name') with àrai ('what'), and khráp keeps it polite — so it simply asks for the person's name. Common getting-to-know-you questions about age, hometown, or job use different words, so those are believable near-misses rather than the right answer.",
    "context": "The basic opener once a conversation with someone new gets going."
  },
  {
    "id": "dq-intro-n2",
    "cat": "introductions-flirting",
    "questionType": "meaning",
    "prompt": "What is the speaker asking for?",
    "phraseId": 90004,
    "options": [
      {
        "id": "a",
        "text": "Whether the seat happens to be free."
      },
      {
        "id": "b",
        "text": "Permission to join them and sit down."
      },
      {
        "id": "c",
        "text": "Directions to an empty table nearby."
      },
      {
        "id": "d",
        "text": "Whether they can buy the person a drink."
      }
    ],
    "correctOptionId": "b",
    "explanation": "khǎw nâng dûai dâai mǎi khráp uses the khǎw ... dâai mǎi frame ('may I ...?') with nâng dûai ('sit together'), so it asks permission to join the person. It's easy to confuse with thîi nîi mii khon nâng mǎi, which only asks whether a seat is taken — but that one is about the seat, this one is about joining them.",
    "context": "Approaching someone you'd like to sit with, rather than just checking if a chair is open."
  },
  {
    "id": "dq-intro-n3",
    "cat": "introductions-flirting",
    "questionType": "context",
    "prompt": "When would someone naturally say this?",
    "phraseId": 90008,
    "options": [
      {
        "id": "a",
        "text": "Ending a good first date and hoping to meet again."
      },
      {
        "id": "b",
        "text": "Apologizing for having to leave a date early."
      },
      {
        "id": "c",
        "text": "Telling a new match they want to take things slow."
      },
      {
        "id": "d",
        "text": "Greeting a date who has just walked in to meet you."
      }
    ],
    "correctOptionId": "a",
    "explanation": "yàak jer khun ìik khráp strings together yàak ('want'), jer ('meet'), and ìik ('again'), so it expresses wanting to see the person another time — the natural line as an enjoyable first date wraps up. It isn't an apology for leaving, a request to slow down, or a hello.",
    "context": "The end of a date that went well, when you want to signal interest in a second one."
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
        "text": "Freely — it politely names a specific public spot and asks if that suits them."
      },
      {
        "id": "b",
        "text": "Use it to accept a venue your match suggested, confirming you'll take their pick."
      },
      {
        "id": "c",
        "text": "Use it to ask what type of place your match would generally prefer to go to."
      },
      {
        "id": "d",
        "text": "Save it until after you've met in person — proposing a spot sooner feels forward."
      }
    ],
    "correctOptionId": "a",
    "explanation": "jer gan thîi ráan níi dii mǎi khráp proposes meeting at a specific place, and the dii mǎi ending genuinely asks whether that suits the other person. For a first app meetup, naming a busy public spot is the polite, safety-minded default — you are the one suggesting the venue, not merely accepting their pick or vaguely asking their taste, and there is nothing too forward about sending it over chat before you meet.",
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
        "text": "They need to move the meetup to a different day and apologize for the change."
      },
      {
        "id": "b",
        "text": "They turned up a bit early and are telling their date they're already there."
      },
      {
        "id": "c",
        "text": "Their joke fell flat and they're trying to smooth over the awkward mood."
      },
      {
        "id": "d",
        "text": "They hit traffic and will arrive a little after the time they agreed on."
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw thôht khráp is the polite apology and maa sǎai nít nàwy admits to running 'a little bit' late — the classic heads-up text when Bangkok traffic (rót tìt) slows you down. A quick message like this shows respect for the other person's time; it does not reschedule the date to another day, announce an early arrival, or patch up a bad joke.",
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
    "prompt": "A Thai match you have been messaging sends you this phrase. What is it actually doing?",
    "phraseId": 90016,
    "options": [
      {
        "id": "a",
        "text": "It invites them out to dinner together, framed as a question so it is easy to decline."
      },
      {
        "id": "b",
        "text": "It invites them to cook dinner together at home, which is more intimate than a night out."
      },
      {
        "id": "c",
        "text": "It suggests meeting for lunch rather than dinner, to keep a first date lower-key."
      },
      {
        "id": "d",
        "text": "It tells them you will take them to dinner, stated as a plan rather than a question."
      }
    ],
    "correctOptionId": "a",
    "explanation": "The phrase is bpai gin khâao yen dûai gan mǎi — 'go eat dinner together?' The word khâao yen specifically means the evening meal (dinner), not lunch (klaang wan) or breakfast, and it means eating out together, not cooking at home. It ends in mǎi, which turns the whole thing into a genuine yes/no question, so it is an invitation the other person can freely accept or decline, not a statement of a fixed plan. Naming a day, like the Friday in the example, makes it even easier to answer.",
    "context": "Moving an online chat toward a first real-life date.",
    "tags": [
      "invitation",
      "etiquette"
    ]
  },
  {
    "id": "dq-apps-n1",
    "cat": "apps-meeting-plans",
    "questionType": "meaning",
    "prompt": "What is the speaker asking the other person to do?",
    "phraseId": 90020,
    "options": [
      {
        "id": "a",
        "text": "Message you once they reach the meeting spot."
      },
      {
        "id": "b",
        "text": "Wait for you to text the moment you arrive yourself."
      },
      {
        "id": "c",
        "text": "Send you their home address before they head out."
      },
      {
        "id": "d",
        "text": "Warn you in advance if they end up running late."
      }
    ],
    "correctOptionId": "a",
    "explanation": "thǔeng láew bàwk dûai ná khráp means 'let me know once you arrive' — a caring, safety-minded closer when arranging to meet. thǔeng means 'to arrive/reach', and ná khráp keeps it warm and polite. It asks the other person to check in on arrival; it is not a promise about your own arrival, a request for their address, or a heads-up about being late.",
    "context": "Wrapping up plans for a meetup — a warm way to ask your date to check in when they get there."
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
        "text": "I miss you a lot whenever we're apart."
      },
      {
        "id": "c",
        "text": "Talking with you feels easy and relaxed."
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
        "text": "Save it until you are dating — it hints at romantic feelings."
      },
      {
        "id": "b",
        "text": "Fine early on, but it praises their looks, not the chat."
      },
      {
        "id": "c",
        "text": "Fine with someone new — it praises the easy vibe, not looks."
      },
      {
        "id": "d",
        "text": "Good with close friends, but too familiar for someone new."
      }
    ],
    "correctOptionId": "c",
    "explanation": "sà-baai jai describes how comfortable and easy the conversation feels — not the person's appearance, and not a declaration of romance. That keeps it gentle and low-stakes, so it lands warmly even with a new acquaintance, like wrapping up a first chat at a language exchange. The tempting wrong answers get a Thai detail backwards: it isn't a comment on their looks (b), and it isn't too familiar for someone you just met (d).",
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
        "text": "Yes — a looks compliment works fine as a friendly thank-you."
      },
      {
        "id": "b",
        "text": "Yes — taa-yím sǔai literally means 'thanks for the help.'"
      },
      {
        "id": "c",
        "text": "Not really — praising the eyes reads romantic here."
      },
      {
        "id": "d",
        "text": "Only if you first say khàwp khun, then it's fine."
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
    "id": "dq-compl-n1",
    "cat": "compliments",
    "questionType": "meaning",
    "prompt": "What is this phrase complimenting?",
    "phraseId": 90010,
    "options": [
      {
        "id": "a",
        "text": "That you enjoy their sense of humor and jokes."
      },
      {
        "id": "b",
        "text": "That they have a lovely, warm smile."
      },
      {
        "id": "c",
        "text": "That they're really easy and relaxed to talk to."
      },
      {
        "id": "d",
        "text": "That they always know the newest gossip."
      }
    ],
    "correctOptionId": "a",
    "explanation": "chôp means 'to like/love' and múk tà-lòk means 'jokes' or 'sense of humor,' so the phrase praises how funny someone is. It compliments their personality rather than their looks, which keeps it warm and low-pressure.",
    "context": "Telling a date or new friend you enjoy their humor after they've made you laugh a few times."
  },
  {
    "id": "dq-compl-n2",
    "cat": "compliments",
    "questionType": "usage",
    "prompt": "A Thai friend says this to you. How does it come across?",
    "phraseId": 90013,
    "options": [
      {
        "id": "a",
        "text": "Praise for someone's kindness — warm and safe with anyone."
      },
      {
        "id": "b",
        "text": "Praise for someone's looks — friendly and fine with anyone."
      },
      {
        "id": "c",
        "text": "A warm note on someone's mood — easy to say to anyone."
      },
      {
        "id": "d",
        "text": "Warm words a date is likely to read as quietly romantic."
      }
    ],
    "correctOptionId": "a",
    "explanation": "jai dee means 'kind-hearted,' so this praises character — not looks, and not just a passing mood. Because it is about who someone is, it lands warmly with a friend, a date, or anyone who just did you a favor, and it stays comfortable even with someone new. It never reads as a come-on.",
    "context": "Complimenting kindness — thanking a helpful friend, or telling a date you value their warmth."
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
        "text": "To a brand-new app match, only minutes after first saying hello."
      },
      {
        "id": "b",
        "text": "When they want to break up but are trying to soften the blow first."
      },
      {
        "id": "c",
        "text": "After months of good dates, to ask about becoming official."
      },
      {
        "id": "d",
        "text": "When introducing their partner to their friend group for the first time."
      }
    ],
    "correctOptionId": "c",
    "explanation": "khóp gan means to date or go steady, so rao khóp gan mǎi is the classic 'shall we make it official?' question. It belongs after you have genuinely gotten to know each other, and the mǎi ending frames it as a real question that leaves a free choice. Dropped on a brand-new match it feels rushed; it is not a breakup line or a meet-the-friends invite.",
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
    "prompt": "You matched with someone on a dating app earlier today and haven't met in person yet. Is this a good phrase to send them now?",
    "phraseId": 90021,
    "options": [
      {
        "id": "a",
        "text": "No — it's a sincere 'I like you,' so it means more after you actually know each other."
      },
      {
        "id": "b",
        "text": "Yes — showing that you like someone early on is confident and keeps a good chat going."
      },
      {
        "id": "c",
        "text": "No — it's basically an 'I love you,' so it's better kept for when you're committed."
      },
      {
        "id": "d",
        "text": "Yes — it's light small talk you'd say to almost anyone you chat with."
      }
    ],
    "correctOptionId": "a",
    "explanation": "phǒm chôp khun ná is a genuine 'I like you' — real interest, not a throwaway line and not as heavy as rák ('love'). Because it means something, it lands better once you've actually spent time together than an hour into a brand-new match. It isn't small talk (d) and it isn't a full love confession to save for a committed relationship (c); knowing chôp = 'like' (not 'love') is what separates the two 'No' answers.",
    "context": "Early dating-app chats, before you've met in person.",
    "tags": [
      "timing",
      "feelings"
    ]
  },
  {
    "id": "dq-rel-5",
    "cat": "relationship-language",
    "questionType": "usage",
    "prompt": "A Thai friend is dating someone and says this. How is it meant to be used?",
    "phraseId": 90025,
    "options": [
      {
        "id": "a",
        "text": "On a first date, to gently ask what the other person is looking for."
      },
      {
        "id": "b",
        "text": "After dating a while, to calmly ask whether the two of you are exclusive."
      },
      {
        "id": "c",
        "text": "In the moment, to quietly check whether they truly mean what they said."
      },
      {
        "id": "d",
        "text": "As a soft aside, to tell your partner how serious and devoted you are."
      }
    ],
    "correctOptionId": "b",
    "explanation": "jing-jang means 'serious', and the mǎi at the end makes it a question — so rao khóp gan bàep jing-jang mǎi asks whether the two of you are exclusive/serious. It's the define-the-relationship talk you raise calmly once you've been dating a while (b). It is not a first-date opener about what someone is looking for (a); it does not ask whether they are being sincere or truthful in the moment (c); and it is a question about the relationship, not a statement about your own devotion (d).",
    "context": "The exclusivity / define-the-relationship talk, raised calmly after you have been dating someone for a while — a genuine question, not first-date small talk and not a compliment.",
    "tags": [
      "exclusivity",
      "communication"
    ]
  },
  {
    "id": "dq-rel-n1",
    "cat": "relationship-language",
    "questionType": "meaning",
    "prompt": "What is this phrase asking?",
    "phraseId": 90024,
    "options": [
      {
        "id": "a",
        "text": "Whether the person will be their girlfriend or boyfriend."
      },
      {
        "id": "b",
        "text": "Whether the other person is already seeing somebody else."
      },
      {
        "id": "c",
        "text": "Whether the two of them should simply stay good friends."
      },
      {
        "id": "d",
        "text": "Whether the other person finds them genuinely attractive."
      }
    ],
    "correctOptionId": "a",
    "explanation": "khun pen faen phǒm dâai mǎi asks the other person to be your faen — the gender-neutral Thai word for boyfriend or girlfriend — and the dâai mǎi ending keeps it a genuine question. Note the contrast with mii faen ('already have a partner'), which is about someone else, and with pen phûean ('be friends'), which points the other way.",
    "context": "The moment you ask someone to officially be your partner."
  },
  {
    "id": "dq-rel-n2",
    "cat": "relationship-language",
    "questionType": "meaning",
    "prompt": "What is the speaker inviting the other person to do?",
    "phraseId": 90027,
    "options": [
      {
        "id": "a",
        "text": "To come along and meet their circle of friends."
      },
      {
        "id": "b",
        "text": "To come home and meet their parents and family."
      },
      {
        "id": "c",
        "text": "To spend the evening out, just the two of them."
      },
      {
        "id": "d",
        "text": "To help throw a party for one of their friends."
      }
    ],
    "correctOptionId": "a",
    "explanation": "phûean means 'friends', so bpai jer phûean phǒm mǎi invites someone to meet your friend group — a meaningful relationship step in Thailand that signals you want to fold them into your life. It is not the bigger milestone of meeting parents and family, nor a solo date, nor a request for party help.",
    "context": "Bringing someone you are dating into your wider social circle."
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
        "text": "Slot the action into the blank — 'may I hold your hand?' — then wait for their yes."
      },
      {
        "id": "b",
        "text": "It's for asking staff or elders for things, too formal to use between two people dating."
      },
      {
        "id": "c",
        "text": "Put a feeling in the blank — like rák — so it turns into a way to confess your feelings."
      },
      {
        "id": "d",
        "text": "Use it just after you act, as a polite way to check that what you did was okay."
      }
    ],
    "correctOptionId": "a",
    "explanation": "phǒm khǎw ... dâai mǎi khráp is a fill-in-the-action permission template — you name the thing you'd like to do, then ask dâai mǎi ('may I?') and wait for a clear answer. You slot an ACTION into the blank, not a feeling (c), and you ask BEFORE, not after (d). It's perfectly natural between two people on a date, not just for shops and elders (b).",
    "context": "A mid-date moment when you want to check in before doing something.",
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
    "prompt": "A Thai partner says this phrase to you. What does it mean?",
    "phraseId": 90034,
    "options": [
      {
        "id": "a",
        "text": "A no counts, but the person should give their reasons for it."
      },
      {
        "id": "b",
        "text": "It's a reminder to state your own limits firmly and early."
      },
      {
        "id": "c",
        "text": "A firm no holds for now, and it's fine to check in later."
      },
      {
        "id": "d",
        "text": "A clear no is a full answer; don't re-ask hoping it flips."
      }
    ],
    "correctOptionId": "d",
    "explanation": "mâi bplae wâa mâi states a non-negotiable principle: a no is a complete answer on its own. It needs no justification, so it is not about the other person explaining their reasons; it is not a prompt to assert your own limits; and it does not lapse after tonight so you can revisit it later. It applies to either person's no. Repeating a request after a clear no is pressure, not persistence.",
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
        "text": "In the moment, when things are moving faster than you like and you want a slower pace."
      },
      {
        "id": "b",
        "text": "Afterward by text, to gently tell them the evening moved a little too quickly for you."
      },
      {
        "id": "c",
        "text": "Right at hello, as a polite way to say you'd rather keep the first date low-key."
      },
      {
        "id": "d",
        "text": "When you've decided to end things and want to leave without an awkward scene."
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
    "id": "dq-bound-n1",
    "cat": "boundaries-consent",
    "questionType": "meaning",
    "prompt": "What is this phrase doing in a dating context?",
    "phraseId": 90028,
    "options": [
      {
        "id": "a",
        "text": "Pausing to check the other person is comfortable with what's happening."
      },
      {
        "id": "b",
        "text": "Asking whether the restaurant or venue is an acceptable choice for tonight."
      },
      {
        "id": "c",
        "text": "Confirming that a plan you both agreed on earlier is still going ahead."
      },
      {
        "id": "d",
        "text": "Making sure your own outfit looks alright before your date arrives."
      }
    ],
    "correctOptionId": "a",
    "explanation": "bàep níi oh-keh mǎi khráp — literally 'is this okay?' — is a consent check-in. On a date you say it before or during new physical contact to confirm the other person is genuinely comfortable, not to vet a venue, a schedule, or your appearance. A clear yes is what you're waiting for.",
    "context": "Checking in the moment before or as you initiate any new physical contact."
  },
  {
    "id": "dq-bound-n2",
    "cat": "boundaries-consent",
    "questionType": "context",
    "prompt": "When would someone say this on a date?",
    "phraseId": 90030,
    "options": [
      {
        "id": "a",
        "text": "To reassure a date there's no pressure and no need to rush."
      },
      {
        "id": "b",
        "text": "To tell a date you forgive them for showing up fifteen minutes late."
      },
      {
        "id": "c",
        "text": "To wave off a date's offer to split the bill, saying you'll cover it."
      },
      {
        "id": "d",
        "text": "To hurry a slow decision along by saying you should get going soon."
      }
    ],
    "correctOptionId": "a",
    "explanation": "mâi pen rai, mâi tâwng rîip = 'it's fine, there's no rush' — it takes the pressure off so you can both go slowly. Note the traps: mâi pen rai on its own is a general 'no worries' (which fits an apology), and rîip means to hurry, so a half-learner might read it as the opposite. Here the whole phrase is about easing pace, not covering a bill.",
    "context": "Reassuring a date that there is no pressure and things can move at a comfortable pace."
  },
  {
    "id": "dq-bound-n3",
    "cat": "boundaries-consent",
    "questionType": "meaning",
    "prompt": "What does this phrase express?",
    "phraseId": 90035,
    "options": [
      {
        "id": "a",
        "text": "A mutual agreement to honor whatever choice each person makes."
      },
      {
        "id": "b",
        "text": "A promise to always make big decisions together as a couple."
      },
      {
        "id": "c",
        "text": "A request for the other person to trust your judgment on plans."
      },
      {
        "id": "d",
        "text": "An apology for having overruled a decision your partner made."
      }
    ],
    "correctOptionId": "a",
    "explanation": "khao-róp gaan tàt-sǐn jai khǎwng gan láe gan uses khao-róp (respect) with 'each other's decisions' — a mature, mutual framing that each person's choices are honored, even when they differ. It is not a pledge to always decide jointly, a plea for trust, or an apology.",
    "context": "A calm, mutual framing of boundaries — each person's decisions are respected."
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
        "text": "When a small mix-up over the plan is quietly creating tension"
      },
      {
        "id": "c",
        "text": "When they are confessing their romantic feelings for the first time"
      },
      {
        "id": "d",
        "text": "When they are asking a waiter to fix an order that came out wrong"
      }
    ],
    "correctOptionId": "b",
    "explanation": "This phrase names a small crossed wire out loud: khâo jai phìt means to misunderstand, and nít nàwy ('a little bit') shrinks the problem so nobody loses face. Saying it calmly defuses a mix-up over plans or texts before it hardens into an argument. It isn't for exiting early, confessing feelings, or correcting restaurant staff.",
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
    "prompt": "A Thai friend says this phrase. When does it fit best?",
    "phraseId": 90039,
    "options": [
      {
        "id": "a",
        "text": "Right before asking a personal question, to soften it in advance."
      },
      {
        "id": "b",
        "text": "Only once someone has explicitly told you that you upset them."
      },
      {
        "id": "c",
        "text": "To reassure a shy date up front that they needn't feel awkward at all."
      },
      {
        "id": "d",
        "text": "When you have genuinely misread the mood, said with sincerity."
      }
    ],
    "correctOptionId": "d",
    "explanation": "khǎw thôht thâa... ('sorry if I...') is a graceful repair line for after you sense you misjudged the mood — a joke that landed wrong, or a comment that made your date go quiet. The 'if' (thâa) is the key: you use it when you merely suspect you crossed a line, so it does not have to wait for the other person to spell out that you upset them, and it is not a softener you tack on before a question. It also is not a blanket 'no need to feel awkward' reassurance — that is a different line. Deliver it sincerely and sparingly; a reflex apology for everything dilutes it.",
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
        "text": "It opens with 'yàa' ('don't'), so said sharply it sounds like an order to hush; 'ná' keeps it a gentle plea."
      },
      {
        "id": "b",
        "text": "Naming a fight out loud can actually make things worse if your partner didn't even feel you two were arguing yet."
      },
      {
        "id": "c",
        "text": "The verb 'thá-láw' is coarse, so even a perfectly calm delivery can still land as passive-aggressive."
      },
      {
        "id": "d",
        "text": "It formally settles a quarrel, so it only works once both people have genuinely apologized to each other."
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
        "text": "When they are formally ending the relationship for good, after weeks of thinking."
      },
      {
        "id": "b",
        "text": "When they want their partner to move in and share an apartment together soon."
      },
      {
        "id": "c",
        "text": "When they need to cool off alone after a heated argument, not to end things."
      },
      {
        "id": "d",
        "text": "When they are stuck in traffic and asking their partner to wait a little longer."
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
    "id": "dq-argue-n1",
    "cat": "arguments-breakups",
    "questionType": "meaning",
    "prompt": "What is this phrase asking for?",
    "phraseId": 90041,
    "options": [
      {
        "id": "a",
        "text": "A calm opener asking to talk something over together."
      },
      {
        "id": "b",
        "text": "A light suggestion to catch up over coffee sometime soon."
      },
      {
        "id": "c",
        "text": "A request for your partner to give you some quiet time."
      },
      {
        "id": "d",
        "text": "A way to ask whether you can phone them later tonight."
      }
    ],
    "correctOptionId": "a",
    "explanation": "rao khui gan nàwy dâai mǎi means 'can we talk?' — the 'dâai mǎi' ('may we?') frames it as a gentle request, so it opens a serious conversation without sounding aggressive. It isn't casual small talk over coffee, a plea for silence, or a plan to call later.",
    "context": "Opening a serious but calm conversation — used when there's something real you need to discuss, not for light chit-chat."
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
        "text": "I've had enough to drink tonight."
      },
      {
        "id": "c",
        "text": "Tonight the drinks are my treat."
      },
      {
        "id": "d",
        "text": "I don't touch alcohol at all, sorry."
      }
    ],
    "correctOptionId": "b",
    "explanation": "phaw láew means 'enough already,' so the speaker is politely capping their drinking for the night rather than swearing off alcohol entirely. Stating your limit this way is respected and lets everyone keep face — it isn't ordering another round, offering to pay, or saying you never drink.",
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
        "text": "Telling a taxi driver which address to take you to."
      },
      {
        "id": "b",
        "text": "Offering to drive a friend home after the bar closes."
      },
      {
        "id": "c",
        "text": "Asking bar staff to call a taxi so you get home safe."
      },
      {
        "id": "d",
        "text": "Ordering one last round of drinks before closing time."
      }
    ],
    "correctOptionId": "c",
    "explanation": "rîak tháek-sîi hâi nàwy dâai mǎi khráp asks someone — typically bar or hotel staff — to call a taxi for you. It's the go-to line when you've been drinking and need a safe ride home, not a way to give a driver directions, offer someone else a lift, or order more drinks.",
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
        "text": "No — let the most senior person treat the group instead."
      },
      {
        "id": "b",
        "text": "Yes, but you're then expected to cover every round all night."
      },
      {
        "id": "c",
        "text": "Yes — treating the group to a round is a warm, normal gesture."
      },
      {
        "id": "d",
        "text": "Better not — offering to pay can make new acquaintances lose face."
      }
    ],
    "correctOptionId": "c",
    "explanation": "líang means to treat someone, and picking up a round is a warm, sociable move among friends in Thailand. There is a real custom that the eldest or most senior person often treats, but a newcomer offering one round is still welcome — you are not locked into buying every round all night, and it doesn't cause anyone to lose face. Keep it a one-off gesture and pace your own drinking.",
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
        "text": "Say it as someone heads home, then check their reply arrives."
      },
      {
        "id": "b",
        "text": "Fine with a partner, but with a newer date it can feel too forward."
      },
      {
        "id": "c",
        "text": "Reserve it for nights out that turned risky, not ordinary goodbyes."
      },
      {
        "id": "d",
        "text": "Use it to ask for their home address before they leave."
      }
    ],
    "correctOptionId": "a",
    "explanation": "thǔeng bâan láew thák maa ná ('text me when you get home') is a warm, safety-minded sign-off that's fine with anyone — a date, a friend, someone you met tonight. The habit has two halves: say it as they leave, then actually notice whether their reply arrives and follow up if it doesn't. It isn't only for long-term partners or emergencies, and it doesn't ask for an address.",
    "context": "The last thing you say as someone heads home for the night — and a check-in you can ask for yourself, too.",
    "literal": "thák = to message/ping someone.",
    "tags": [
      "get-home-safe",
      "goodnight"
    ]
  },
  {
    "id": "dq-night-n1",
    "cat": "nightlife",
    "questionType": "meaning",
    "prompt": "You flag down the server at a bar and say this. What are you ordering?",
    "phraseId": 90046,
    "options": [
      {
        "id": "a",
        "text": "Two beers for us, please."
      },
      {
        "id": "b",
        "text": "One more beer over here, thanks."
      },
      {
        "id": "c",
        "text": "Two glasses of water, please."
      },
      {
        "id": "d",
        "text": "Just the bill for our drinks, please."
      }
    ],
    "correctOptionId": "a",
    "explanation": "khǎw ... khráp is the polite way to order, and bia sǎwng thîi means 'two servings of beer' — thîi is the counter Thai uses for orders and servings. So you're asking for two beers, not a single refill, water, or the check.",
    "context": "Ordering a round at a bar or restaurant early in the night."
  },
  {
    "id": "dq-night-n2",
    "cat": "nightlife",
    "questionType": "meaning",
    "prompt": "What is the speaker telling the group?",
    "phraseId": 90049,
    "options": [
      {
        "id": "a",
        "text": "I'm going to head home now."
      },
      {
        "id": "b",
        "text": "Shall we share a ride home?"
      },
      {
        "id": "c",
        "text": "Let's stay out a little longer."
      },
      {
        "id": "d",
        "text": "You go ahead — I'll leave later."
      }
    ],
    "correctOptionId": "a",
    "explanation": "glàp gàwn literally means 'go back first' — a polite way to excuse yourself and head home before the others, softened by ná khráp. It announces your own early departure; it isn't proposing to share a taxi, asking to stay longer, or telling others to leave without you.",
    "context": "Politely excusing yourself from a group when you want to call it a night."
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
        "text": "Playful disbelief — 'no way, you're kidding!'"
      },
      {
        "id": "b",
        "text": "A mellow 'relax, it's no big deal at all.'"
      },
      {
        "id": "c",
        "text": "Genuine praise — 'whoa, that's really cool!'"
      },
      {
        "id": "d",
        "text": "A surprised 'for real? that really happened?'"
      }
    ],
    "correctOptionId": "c",
    "explanation": "jěng mâak pairs the slang jěng ('cool') with mâak ('very') for emphasis — an upbeat, sincere 'that's awesome!' It's friendly praise, not disbelief, not a request to chill, and not a question about whether something really happened. Safe with friends or a date.",
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
    "prompt": "You picked up 'jing dì' from friends. A senior colleague shares some surprising news — is it a good reaction to use with them?",
    "phraseId": 90054,
    "options": [
      {
        "id": "a",
        "text": "No — jing dì is buddy-talk; with a senior, politer 'jing rǎe khráp' fits."
      },
      {
        "id": "b",
        "text": "Yes — it's a mild 'is that so?' that fits most situations, work included."
      },
      {
        "id": "c",
        "text": "Yes — a polite particle on the end softens casual slang enough for the office."
      },
      {
        "id": "d",
        "text": "No — but that's because it reads as doubting their honesty, which offends a senior."
      }
    ],
    "correctOptionId": "a",
    "explanation": "jing dì is very casual — a buddy's 'for real?! / seriously?!' — so with a senior a politer form like jing rǎe khráp fits better. It isn't register-neutral (b), and a tacked-on particle doesn't fully formalize slang (c). It also isn't an accusation of lying (d) — it's playful disbelief; telling the two 'No' answers apart needs the phrase's real meaning, not just 'slang is informal.'",
    "context": "Casual reactions among friends versus talking with someone senior at work.",
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
    "id": "dq-slang-n1",
    "cat": "casual-slang",
    "questionType": "meaning",
    "prompt": "A friend tells you a piece of news and you fire this back. What are you expressing?",
    "phraseId": 90053,
    "options": [
      {
        "id": "a",
        "text": "Playful disbelief — 'no way, you're kidding me!'"
      },
      {
        "id": "b",
        "text": "Sincere agreement — 'yeah, that's completely true.'"
      },
      {
        "id": "c",
        "text": "A flat 'for real?' asking them to confirm the facts."
      },
      {
        "id": "d",
        "text": "A relaxed 'no worries, it's really no big deal.'"
      }
    ],
    "correctOptionId": "a",
    "explanation": "mâi jing nâa literally reads as 'not true, really?' but works as a delighted 'no way!' — playful surprise at something a friend just told you, not a literal accusation that they're lying. It isn't agreement, a sincere fact-check, or a way to wave something off.",
    "context": "Casual chats with friends or a date, reacting to surprising news. The particle nâa keeps it light and friendly."
  },
  {
    "id": "dq-swear-1",
    "cat": "mild-swears-insults",
    "questionType": "meaning",
    "prompt": "A Thai friend says this. What does it mean?",
    "phraseId": 90058,
    "options": [
      {
        "id": "a",
        "text": "An insult snapped at a person acting foolish or crazy."
      },
      {
        "id": "b",
        "text": "A quick grumble of frustration, not aimed at anyone."
      },
      {
        "id": "c",
        "text": "A heavy curse you save for genuine, boiling-over anger."
      },
      {
        "id": "d",
        "text": "A weary sigh of sadness over some bit of bad news."
      }
    ],
    "correctOptionId": "b",
    "explanation": "bâa jing is a mild 'darn it / oh come on'-level exclamation. It's thrown at a bad situation — lost keys, a missed bus — not at a person, so it isn't the insult in (a). It's also far softer than a real curse (c), and it's frustration rather than the sadness in (d).",
    "context": "Everyday exclamations you'll overhear from Thai speakers but aren't expected to say yourself.",
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
    "prompt": "You've learned this rough exclamation from Thai friends. Should you start saying it yourself?",
    "phraseId": 90059,
    "options": [
      {
        "id": "a",
        "text": "No — understanding it is plenty; from a learner it lands harsher than you mean."
      },
      {
        "id": "b",
        "text": "No — but honestly it's more of a written-chat expression, odd to say aloud."
      },
      {
        "id": "c",
        "text": "Yes — copying friends' slang is the quickest way to start sounding natural."
      },
      {
        "id": "d",
        "text": "Yes — it's mild enough that dropping it into casual chat is perfectly safe."
      }
    ],
    "correctOptionId": "a",
    "explanation": "This is rough, blunt slang. Recognizing it is useful, but coming from a learner it reads coarser than intended, so the goal is comprehension, not use. It is spoken, not written-only (b), and it is not tame enough to sprinkle into chat safely (d) — copying friends here backfires (c).",
    "context": "Rough exclamations you'll hear from friends but aren't expected to say yourself.",
    "warning": "Recognition only — understand it when you hear it, but as a learner keep it out of your own speech.",
    "tags": [
      "recognition",
      "safety"
    ]
  },
  {
    "id": "dq-swear-4",
    "cat": "mild-swears-insults",
    "questionType": "scenario",
    "prompt": "A Thai friend says this while ranting about a rule they think is stupid. Which best captures how the phrase actually works?",
    "phraseId": 90060,
    "options": [
      {
        "id": "a",
        "text": "Blunt \"that's so dumb\" about an idea; a real insult aimed at a person."
      },
      {
        "id": "b",
        "text": "A mild \"how silly\"; stays harmless even said straight to someone."
      },
      {
        "id": "c",
        "text": "A put-down meaning \"you're slow\"; only ever describes people, not ideas."
      },
      {
        "id": "d",
        "text": "A dry \"that makes no sense\"; about confusion, not really an insult."
      }
    ],
    "correctOptionId": "a",
    "explanation": "pan-yaa àwn is a blunt 'that's so dumb' about a thing or idea. It is not mild, and it does get aimed at things (option b understates it; option d treats it as harmless confusion). But it is not reserved for people either (option c is wrong on that). The catch: pointed at a person it becomes a real insult that can escalate fast — no particle or smile softens it.",
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

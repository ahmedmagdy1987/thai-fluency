// Auto-generated from artifact source

import { CARDS } from './cards.js';

export const ACHIEVEMENTS = [
  // 'first-card' (Review your first card) was removed: the first review is too
  // early for a celebration moment. The first motivational milestone is now
  // 'ten-cards', which is paired with confetti + a "tin tin" sound in App.jsx.
  {id:'ten-cards',icon:'📚',name:'Getting Started',desc:'Review 10 cards',check:(s) => s.totalReviews >= 10},
  {id:'fifty-cards',icon:'🔥',name:'On Fire',desc:'Review 50 cards',check:(s) => s.totalReviews >= 50},
  {id:'hundred-cards',icon:'💯',name:'Centurion',desc:'Review 100 cards',check:(s) => s.totalReviews >= 100},
  {id:'streak-3',icon:'🌱',name:'Three-day Streak',desc:'Study 3 days in a row',check:(s) => s.streak >= 3},
  {id:'streak-7',icon:'⚔️',name:'Week Warrior',desc:'Study 7 days in a row',check:(s) => s.streak >= 7},
  {id:'streak-30',icon:'👑',name:'Monthly Master',desc:'Study 30 days in a row',check:(s) => s.streak >= 30},
  {id:'tones-passed',icon:'🎵',name:'Tone Master',desc:'Pass the tone challenge',check:(s) => s.tonesQuizPassed},
  {id:'quiz-perfect',icon:'🏆',name:'Perfect Challenge',desc:'Score 100% on a challenge',check:(s) => s.perfectQuizzes >= 1},
  {id:'first-dialogue',icon:'🗣️',name:'Dialogue Reader',desc:'Complete a dialogue',check:(s) => (s.dialoguesCompleted || []).length >= 1},
  {id:'all-dialogues',icon:'🎭',name:'Conversation Pro',desc:'Complete all 6 dialogues',check:(s) => (s.dialoguesCompleted || []).length >= 6},
  {id:'mature-50',icon:'🌿',name:'Sprout',desc:'Mature 50 cards (21+ day interval)',check:(s,p) => Object.values(p).filter(c => c.interval >= 21).length >= 50},
  {id:'mature-150',icon:'🌳',name:'Strong Roots',desc:'Mature 150 cards',check:(s,p) => Object.values(p).filter(c => c.interval >= 21).length >= 150},
  {id:'mature-300',icon:'🏛️',name:'Vocabulary Vault',desc:'Mature 300 cards',check:(s,p) => Object.values(p).filter(c => c.interval >= 21).length >= 300},
  {id:'sentences-25',icon:'💭',name:'Sentence Builder',desc:'Master 25 sentences',check:(s,p) => CARDS.filter(c => c.type === 's' && p[c.id] && p[c.id].interval >= 21).length >= 25},
  {id:'daily-goal',icon:'⭐',name:'Goal Crusher',desc:'Hit your daily XP goal',check:(s) => (s.dailyGoalsHit || 0) >= 1},
  {id:'goal-streak-7',icon:'🌟',name:'Consistent',desc:'Hit your goal 7 days in a row',check:(s) => (s.dailyGoalsHit || 0) >= 7},
  {id:'xp-500',icon:'✨',name:'500 XP',desc:'Earn 500 XP total',check:(s) => (s.totalXp || 0) >= 500},
  {id:'xp-2000',icon:'💫',name:'2000 XP',desc:'Earn 2000 XP total',check:(s) => (s.totalXp || 0) >= 2000},
  {id:'stage-3',icon:'🛺',name:'Travel Ready',desc:'Reach Stage 3 (Transport)',check:(s) => (s.currentStage || 1) >= 3},
  {id:'stage-5',icon:'🏠',name:'Home Stage',desc:'Reach Stage 5 (Home & Services)',check:(s) => (s.currentStage || 1) >= 5},
];

// Each item carries the Thai script for its syllable so the Tone Challenge can
// PLAY the tone (via lib/audio.js speakThai), not just print the diacritic as a
// silent answer key. Every `thai` below is sourced from the reviewed main deck
// (src/data/cards.js, matched by phonetic + meaning) so nothing here is a new
// unreviewed spelling. Exception: 'mái' = wood is ไม้ (the deck's มั้ย is a
// same-sound question particle, not "wood") — ไม้ is the standard spelling and
// carries the same high tone.
export const TONE_QUIZ_ITEMS = [
  {syl:'mâi',tone:'falling',mean:'no / not',thai:'ไม่'},
  {syl:'mǎi',tone:'rising',mean:'question marker',thai:'ไหม'},
  {syl:'mái',tone:'high',mean:'wood',thai:'ไม้'},
  {syl:'mài',tone:'low',mean:'new',thai:'ใหม่'},
  {syl:'phǒm',tone:'rising',mean:'I (male)',thai:'ผม'},
  {syl:'khráp',tone:'high',mean:'polite particle',thai:'ครับ'},
  {syl:'mâak',tone:'falling',mean:'very',thai:'มาก'},
  {syl:'aròi',tone:'low',mean:'delicious',thai:'อร่อย'},
  {syl:'phèt',tone:'low',mean:'spicy',thai:'เผ็ด'},
  {syl:'náam',tone:'high',mean:'water',thai:'น้ำ'},
  {syl:'khâao',tone:'falling',mean:'rice',thai:'ข้าว'},
  {syl:'khǎo',tone:'rising',mean:'he / she',thai:'เขา'},
  {syl:'maa',tone:'mid',mean:'to come',thai:'มา'},
  {syl:'máa',tone:'high',mean:'horse',thai:'ม้า'},
  {syl:'mǎa',tone:'rising',mean:'dog',thai:'หมา'},
  {syl:'gài',tone:'low',mean:'chicken',thai:'ไก่'},
  {syl:'sǎam',tone:'rising',mean:'three',thai:'สาม'},
  {syl:'sìi',tone:'low',mean:'four',thai:'สี่'},
  {syl:'hâa',tone:'falling',mean:'five',thai:'ห้า'},
  {syl:'rúu',tone:'high',mean:'to know',thai:'รู้'},
  {syl:'dee',tone:'mid',mean:'good',thai:'ดี'},
  {syl:'bpai',tone:'mid',mean:'to go',thai:'ไป'},
  {syl:'glâi',tone:'falling',mean:'close / near',thai:'ใกล้'},
  {syl:'glai',tone:'mid',mean:'far',thai:'ไกล'},
];

export const XP_REWARDS = {
  again: 1, hard: 2, good: 3, easy: 5,
  quizCorrect: 5,
  toneQuizCorrect: 4,
  dialogueLine: 1,
  dailyGoalBonus: 25,
};

export const DEFAULT_DAILY_GOAL = 50;

// LEGACY stage-complete fallback threshold. Despite the historical name, this
// does NOT gate mission unlocks — missions unlock when the previous mission's
// cards are all SEEN (lib/state.js getMissionState). Its only live use is the
// do-not-regress fallback in getStageState: a stage also counts complete when
// ≥ this share of its cards is mature (interval ≥ 21d), so users who unlocked
// under the old mastery rule are never re-locked. (Wave 10 corrected this
// comment — the old one described logic that never shipped — and removed the
// dead, never-imported STAGE_1_COMPLETE_THRESHOLD.)
export const MISSION_UNLOCK_THRESHOLD = 0.70;


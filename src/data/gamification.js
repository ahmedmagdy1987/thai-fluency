// Auto-generated from artifact source

import { CARDS } from './cards.js';

export const ACHIEVEMENTS = [
  {id:'first-card',icon:'🎯',name:'First Step',desc:'Review your first card',check:(s) => s.totalReviews >= 1},
  {id:'ten-cards',icon:'📚',name:'Getting Started',desc:'Review 10 cards',check:(s) => s.totalReviews >= 10},
  {id:'fifty-cards',icon:'🔥',name:'On Fire',desc:'Review 50 cards',check:(s) => s.totalReviews >= 50},
  {id:'hundred-cards',icon:'💯',name:'Centurion',desc:'Review 100 cards',check:(s) => s.totalReviews >= 100},
  {id:'streak-3',icon:'🌱',name:'Three-day Streak',desc:'Study 3 days in a row',check:(s) => s.streak >= 3},
  {id:'streak-7',icon:'⚔️',name:'Week Warrior',desc:'Study 7 days in a row',check:(s) => s.streak >= 7},
  {id:'streak-30',icon:'👑',name:'Monthly Master',desc:'Study 30 days in a row',check:(s) => s.streak >= 30},
  {id:'tones-passed',icon:'🎵',name:'Tone Master',desc:'Pass the Tones Quiz',check:(s) => s.tonesQuizPassed},
  {id:'quiz-perfect',icon:'🏆',name:'Perfect Quiz',desc:'Score 100% on a quiz',check:(s) => s.perfectQuizzes >= 1},
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

export const TONE_QUIZ_ITEMS = [
  {syl:'mâi',tone:'falling',mean:'no / not'},
  {syl:'mǎi',tone:'rising',mean:'question marker'},
  {syl:'mái',tone:'high',mean:'wood'},
  {syl:'mài',tone:'low',mean:'new'},
  {syl:'phǒm',tone:'rising',mean:'I (male)'},
  {syl:'khráp',tone:'high',mean:'polite particle'},
  {syl:'mâak',tone:'falling',mean:'very'},
  {syl:'aròi',tone:'low',mean:'delicious'},
  {syl:'phèt',tone:'low',mean:'spicy'},
  {syl:'náam',tone:'high',mean:'water'},
  {syl:'khâao',tone:'falling',mean:'rice'},
  {syl:'khǎo',tone:'rising',mean:'he / she'},
  {syl:'maa',tone:'mid',mean:'to come'},
  {syl:'máa',tone:'high',mean:'horse'},
  {syl:'mǎa',tone:'rising',mean:'dog'},
  {syl:'gài',tone:'low',mean:'chicken'},
  {syl:'sǎam',tone:'rising',mean:'three'},
  {syl:'sìi',tone:'low',mean:'four'},
  {syl:'hâa',tone:'falling',mean:'five'},
  {syl:'rúu',tone:'high',mean:'to know'},
  {syl:'dee',tone:'mid',mean:'good'},
  {syl:'bpai',tone:'mid',mean:'to go'},
  {syl:'glâi',tone:'falling',mean:'close / near'},
  {syl:'glai',tone:'mid',mean:'far'},
];

export const XP_REWARDS = {
  again: 1, hard: 2, good: 3, easy: 5,
  quizCorrect: 5,
  toneQuizCorrect: 4,
  dialogueLine: 1,
  dailyGoalBonus: 25,
};

export const DEFAULT_DAILY_GOAL = 50;


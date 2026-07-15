import React from 'react';
import { CloudOff } from 'lucide-react';

// The return path for a learner who chose "Keep going without an account"
// (engagement.md §1.3).
//
// WHY THIS EXISTS: the secondary path is mandatory and MUST NOT DEAD-END. Once
// an anonymous learner is inside the app, SidebarNav hides Profile and Sign out
// for them (isAuthed === false) and there is no other account affordance — so
// without this bar the only way back to signup is typing /welcome by hand. That
// would make "you can create one later" (SaveProgressAsk's footnote) false, and
// would strand the very learner the reversed routing was built for.
//
// NOT A NAG (engagement.md:66):
//   • It states a FACT ("saved on this device") — never a threat, never a
//     countdown, never "you may lose your progress". Nothing is at risk.
//   • It offers the real benefit (syncing) and nothing else. It does not claim
//     an account unlocks lessons, XP, or streaks — it does not.
//   • It is one slim row, inline, never a modal, never blocking. It cannot
//     interrupt a lesson (App renders it only outside mini-unit flows).
//   • It is deliberately NOT dismissible, because dismissing it would remove the
//     only signup path and re-create the dead-end. A permanently visible, honest
//     one-liner is the least coercive option that still keeps the door open.
export default function AnonymousAccountBar({ onCreateAccount, onSignIn }) {
  return (
    <div className="anon-account-bar">
      <span className="anon-account-bar-icon" aria-hidden="true">
        <CloudOff size={16} />
      </span>
      <span className="anon-account-bar-text">
        Your progress is saved on this device. A free account syncs it across devices.
      </span>
      <span className="anon-account-bar-actions">
        <button type="button" className="anon-account-bar-primary" onClick={onCreateAccount}>
          Create free account
        </button>
        <button type="button" className="anon-account-bar-link" onClick={onSignIn}>
          Sign in
        </button>
      </span>
    </div>
  );
}

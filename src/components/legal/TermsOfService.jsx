import React from 'react';
import { X } from 'lucide-react';
import { TermsOfUseContent } from './legalCopy.jsx';

export default function TermsOfService({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal legal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Legal</div>
            <div className="modal-title">Terms of Use</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body legal-content">
          <TermsOfUseContent />
        </div>
      </div>
    </div>
  );
}

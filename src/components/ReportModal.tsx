import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { VolunteerOpportunity } from '../types';

interface ReportModalProps {
  opportunity: VolunteerOpportunity;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ opportunity, onClose }) => {
  const [issueType, setIssueType] = useState('Incorrect Schedule / Dates');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FFF8E7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#92400E]">Report Incorrect Information</h3>
              <p className="text-[11px] text-[#B45309]">Help keep our community discovery listings accurate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#10AC84] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Thank you for keeping listings accurate!</h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Our moderation team and community stewards will review your report regarding "{opportunity.title}" and update or notify the organization promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Reporting Opportunity</span>
                <span className="text-xs font-bold text-gray-900 line-clamp-1">{opportunity.title}</span>
                <span className="text-[11px] text-gray-500">{opportunity.organization} ({opportunity.borough})</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">What information is incorrect?</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-[#54A0FF] focus:outline-none"
                >
                  <option value="Incorrect Schedule / Dates">Incorrect Schedule / Dates or Times</option>
                  <option value="Wrong Location / Address">Wrong Location / Address / Subway Lines</option>
                  <option value="Broken Apply Link / Website">Broken Apply Link or Organization Website</option>
                  <option value="Event Cancelled / Full">Event is Cancelled or No Longer Active</option>
                  <option value="Other Details Inaccurate">Other Details Inaccurate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details / Correction Notes</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what is incorrect and what the correct information should be..."
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white text-gray-800 focus:ring-2 focus:ring-[#54A0FF] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Email (optional, for follow-up)</label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="volunteer@example.com"
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white text-gray-800 focus:ring-2 focus:ring-[#54A0FF] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#D97706] hover:brightness-105 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

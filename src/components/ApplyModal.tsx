import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, ShieldCheck, Calendar, Clock, MapPin, Send, Sparkles, CalendarDays, AlertTriangle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VolunteerOpportunity, Application, UserProfile } from '../types';
import { UserVolunteerProfile } from './UserProfileCard';
import { checkSingleConflict } from '../utils/conflictUtils';

interface ApplyModalProps {
  opportunity: VolunteerOpportunity | null;
  applications?: Application[];
  opportunities?: VolunteerOpportunity[];
  currentUser?: UserProfile;
  userProfile?: UserVolunteerProfile;
  onClose: () => void;
  onApplicationSuccess: (newApp: Application, autoCancelledCount?: number) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  opportunity,
  applications = [],
  opportunities = [],
  currentUser,
  userProfile,
  onClose,
  onApplicationSuccess
}) => {
  const defaultShift = opportunity?.upcomingDates && opportunity.upcomingDates.length > 0 
    ? opportunity.upcomingDates[0] 
    : (opportunity?.dates ? `${opportunity.dates} (${opportunity?.shiftSchedule})` : (opportunity?.shiftSchedule || ''));

  const [applicantName, setApplicantName] = useState(userProfile?.name || currentUser?.name || 'Jordan Rivera');
  const [applicantEmail, setApplicantEmail] = useState(userProfile?.email || currentUser?.email || 'jordan.rivera.nyc@gmail.com');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '(917) 555-0199');
  const [experienceNotes, setExperienceNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('Maria Rivera (917-555-0144)');
  const [shiftSelected, setShiftSelected] = useState(defaultShift);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [autoCancelledNotice, setAutoCancelledNotice] = useState<string | null>(null);

  // Check schedule conflict dynamically for the selected shift against confirmed commitments
  const scheduleConflict = useMemo(() => {
    if (!opportunity) return null;
    const currentShift = shiftSelected || defaultShift;
    const confirmedApps = applications.filter(a => a.status === 'Confirmed');

    for (const conf of confirmedApps) {
      const confOpp = opportunities.find(o => o.id === conf.opportunityId);
      const conflictRes = checkSingleConflict(
        currentShift,
        opportunity.dates || '',
        conf.shiftSelected,
        confOpp?.dates || '',
        150
      );

      if (conflictRes.hasConflict) {
        return {
          hasConflict: true,
          conflictingOppTitle: conf.opportunityTitle,
          conflictingShift: conf.shiftSelected,
          reason: conflictRes.reason || `Overlaps with your confirmed volunteer shift for "${conf.opportunityTitle}" (${conf.shiftSelected}) within the 2.5-hour transit buffer window.`
        };
      }
    }
    return null;
  }, [opportunity, shiftSelected, defaultShift, applications, opportunities]);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) return;

    if (scheduleConflict?.hasConflict) {
      setErrorMessage(scheduleConflict.reason);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          applicantName,
          applicantEmail,
          applicantPhone,
          experienceNotes,
          emergencyContact,
          shiftSelected: shiftSelected || defaultShift
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || data.error || 'Failed to submit application due to scheduling constraint.');
        return;
      }

      const createdApp: Application = data.application || data;
      setSubmittedApp(createdApp);
      setIsSubmitted(true);

      if (data.autoCancelledCount && data.autoCancelledCount > 0) {
        setAutoCancelledNotice(`${data.autoCancelledCount} overlapping pending application(s) were automatically cancelled to prevent double-booking.`);
      }

      onApplicationSuccess(createdApp, data.autoCancelledCount || 0);

      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error("Application submission failed:", err);
      setErrorMessage("Network or submission error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        id="apply-modal"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 sm:px-8 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5E57] bg-[#FFF0F0] px-2.5 py-0.5 rounded-full border border-[#FFDADA]">
              Direct Application
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
              {opportunity.organization}
            </h3>
            <p className="text-xs text-gray-500 truncate max-w-sm">{opportunity.title}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isSubmitted && submittedApp ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#10AC84] mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900">Application Submitted!</h4>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your volunteer placement request with <strong>{opportunity.organization}</strong> has been logged. A confirmation email has been dispatched to <strong>{submittedApp.applicantEmail}</strong>.
                </p>
              </div>

              {autoCancelledNotice && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>PitchInNYC Conflict Protection</span>
                  </div>
                  <p>{autoCancelledNotice}</p>
                </div>
              )}

              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-400">Application ID:</span>
                  <span className="font-mono font-bold text-gray-800">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shift Confirmed:</span>
                  <span className="font-semibold text-gray-800">{submittedApp.shiftSelected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="font-semibold text-gray-800">{opportunity.borough} ({opportunity.neighborhood})</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-app-success-done"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all"
                >
                  View in My Hours Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Conflict Warning Notice if Confirmed Overlap */}
              {scheduleConflict?.hasConflict && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Schedule Conflict with Confirmed Shift</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                    {scheduleConflict.reason}
                  </p>
                  <p className="text-[10px] text-amber-700 pl-6 font-medium">
                    PitchInNYC protects against conflicting commitments. You can choose a different shift date or cancel your other confirmed shift if you want to switch.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Application Blocked:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Prominent Shift Date & Schedule Badge */}
              <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border border-[#FFE082] text-xs space-y-1">
                <div className="flex items-center gap-2 text-[#92400E] font-bold">
                  <Calendar className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                  <span>Dates: {opportunity.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 font-medium pl-6">
                  <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>Shift Times: {opportunity.shiftSchedule} ({opportunity.timeDuration})</span>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    id="input-applicant-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="input-applicant-email"
                    type="email"
                    required
                    placeholder="alex.morgan@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  />
                </div>
              </div>

              {/* Phone & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cell Phone Number
                  </label>
                  <input
                    id="input-applicant-phone"
                    type="tel"
                    placeholder="(917) 555-0199"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Emergency Contact & Phone
                  </label>
                  <input
                    id="input-emergency-contact"
                    type="text"
                    placeholder="Name & (Phone)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  />
                </div>
              </div>

              {/* Shift Date Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Volunteer Shift Date *
                </label>
                {opportunity.upcomingDates && opportunity.upcomingDates.length > 0 ? (
                  <select
                    id="select-shift-date"
                    value={shiftSelected}
                    onChange={(e) => setShiftSelected(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  >
                    {opportunity.upcomingDates.map((dateStr, idx) => (
                      <option key={idx} value={dateStr}>
                        {dateStr}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="input-shift-preference"
                    type="text"
                    value={shiftSelected}
                    onChange={(e) => setShiftSelected(e.target.value)}
                    placeholder="e.g. Saturday 9:00 AM - 12:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                  />
                )}
              </div>

              {/* Experience / Motivation note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Relevant Experience or Motivation Note (Optional)
                </label>
                <textarea
                  id="input-experience-notes"
                  rows={2}
                  placeholder="Share any past volunteer work, skills, or why you are excited to help..."
                  value={experienceNotes}
                  onChange={(e) => setExperienceNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                />
              </div>

              {/* Submission Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                {scheduleConflict?.hasConflict ? (
                  <button
                    id="btn-submit-locked-conflict"
                    type="button"
                    disabled
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-200 border border-amber-300 opacity-90 cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
                    title={scheduleConflict.reason}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Locked (Time Conflict)</span>
                  </button>
                ) : (
                  <button
                    id="btn-submit-direct-application"
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? "Registering Placement..." : "Confirm & Submit Application"}</span>
                  </button>
                )}
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

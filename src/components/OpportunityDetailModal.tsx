import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Train, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Mail, 
  Phone, 
  Globe, 
  Shirt, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  Accessibility,
  Flame,
  Sparkles,
  Award,
  CalendarDays,
  Ticket,
  Flag,
  Share2,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { VolunteerOpportunity, Application, ScheduleConflictInfo } from '../types';
import { ReportModal } from './ReportModal';
import { checkOpportunityConflictWithConfirmedApps } from '../utils/conflictUtils';

interface OpportunityDetailModalProps {
  opportunity: VolunteerOpportunity | null;
  applications?: Application[];
  opportunities?: VolunteerOpportunity[];
  conflictInfo?: ScheduleConflictInfo;
  onClose: () => void;
  onApply: (opp: VolunteerOpportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  applications = [],
  opportunities = [],
  conflictInfo: propConflictInfo,
  onClose,
  onApply
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  // Computed conflict info
  const conflictInfo = useMemo(() => {
    if (!opportunity) return { hasConflict: false };
    if (propConflictInfo) return propConflictInfo;
    return checkOpportunityConflictWithConfirmedApps(opportunity, applications, opportunities, 2.5);
  }, [opportunity, applications, opportunities, propConflictInfo]);

  // Link & Organization Fact-Check States
  const [verifyingLinks, setVerifyingLinks] = useState(false);
  const [linkReport, setLinkReport] = useState<{
    isVerified: boolean;
    verifiedWebsite: string;
    verifiedEmail: string;
    confidenceScore: number;
    verificationSummary: string;
    sources: { title: string; uri: string }[];
  } | null>(null);

  React.useEffect(() => {
    if (opportunity) {
      handleVerifyLinks();
    }
  }, [opportunity?.id]);

  if (!opportunity) return null;

  const isEventbrite = opportunity.source === "Eventbrite" || (opportunity.externalApplyUrl && opportunity.externalApplyUrl.includes("eventbrite"));



  const handleVerifyLinks = async () => {
    setVerifyingLinks(true);
    try {
      const res = await fetch('/api/opportunities/verify-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: opportunity.organization,
          orgWebsite: opportunity.orgWebsite,
          contactEmail: opportunity.contactEmail,
          title: opportunity.title
        })
      });
      const data = await res.json();
      setLinkReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingLinks(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        id="opportunity-detail-modal"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100 flex items-start justify-between gap-4 bg-[#F8F9FA]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#10AC84] bg-[#E8F5E9] px-3 py-0.5 rounded-full border border-[#C8E6C9]">
                {opportunity.organization}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-gray-700">
                {opportunity.source}
              </span>
              {opportunity.urgent && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#FF5E57]" />
                  Urgent Need
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {opportunity.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{opportunity.address} ({opportunity.neighborhood}, <strong className="font-bold text-gray-800">{opportunity.borough}</strong>)</span>
            </div>
          </div>

          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* SCHEDULE CONFLICT ALERT BANNER */}
          {conflictInfo.hasConflict && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Schedule Conflict with Confirmed Commitment</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-xs">
                {conflictInfo.reason || `You currently have a confirmed volunteer shift for "${conflictInfo.conflictingOpportunityTitle}" (${conflictInfo.conflictingShift}).`}
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-1">
                <p>
                  <strong>PitchInNYC Double-Booking Protection:</strong> To ensure reliable volunteer attendance and allow for transit and check-in across NYC boroughs, applications for overlapping shifts (within a 2.5-hour buffer) are locked once a role is confirmed.
                </p>
              </div>
            </div>
          )}

          {/* PROMINENT DATES & SCHEDULE BANNER */}
          <div className="bg-[#FFF8E7] border-2 border-[#FFE082] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#92400E]">Dates & Shift Schedule</h4>
                  <p className="text-xs text-[#B45309] font-medium">{opportunity.commitmentType} • {opportunity.timeDuration}</p>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-white border border-[#FFE082] text-[#92400E] shadow-xs">
                Next Shift: {opportunity.nextDate || opportunity.dates}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-[#FFE58F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">General Dates & Recurrence</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">{opportunity.dates}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-[#FFE58F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Daily Shift Times</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">{opportunity.shiftSchedule}</span>
              </div>
            </div>

            {opportunity.upcomingDates && opportunity.upcomingDates.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E] block mb-1.5">
                  Available Upcoming Shift Dates:
                </span>
                <div className="flex flex-wrap gap-2">
                  {opportunity.upcomingDates.map((dateStr, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-900 font-bold text-xs border border-[#FFE082] shadow-xs"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-[#D97706]" />
                      {dateStr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* If External Registration / Eventbrite: Callout with Direct Action */}
          {opportunity.applicationMode === 'external' && (
            <div className="bg-[#FFF0ED] border-2 border-[#FFC8BE] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#D04020]" />
                  <h4 className="text-sm font-bold text-[#901D00]">
                    {isEventbrite ? "Eventbrite Registration Required" : "External Partner Registration"}
                  </h4>
                </div>
                <p className="text-xs text-[#B33519] leading-relaxed max-w-xl">
                  {isEventbrite 
                    ? "This opportunity is managed via Eventbrite. Click the button below to reserve your volunteer ticket and view official shift logistics directly on Eventbrite."
                    : "This organization accepts volunteer applications via their external partner portal. Click below to continue."
                  }
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <a
                  href={opportunity.externalApplyUrl || opportunity.orgWebsite || "https://www.eventbrite.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                    isEventbrite 
                      ? 'bg-[#F05537] hover:bg-[#D94525] shadow-[#F0553733]' 
                      : 'bg-[#54A0FF] hover:brightness-105 shadow-[#54A0FF33]'
                  }`}
                >
                  <span>{isEventbrite ? "Open Eventbrite Registration" : "Go to Official Volunteer Page"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {opportunity.orgWebsite && (
                  <a
                    href={opportunity.orgWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                  >
                    <span>Org Website</span>
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 text-xs">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Cause Category</p>
              <p className="font-bold text-gray-900 mt-0.5">{opportunity.cause}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Commitment</p>
              <p className="font-bold text-gray-900 mt-0.5">{opportunity.commitmentType}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Shift Duration</p>
              <p className="font-bold text-gray-900 mt-0.5">{opportunity.timeDuration}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Age Requirement</p>
              <p className="font-bold text-gray-900 mt-0.5">{opportunity.ageRequirement}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About this Volunteer Role</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* What You Will Be Doing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What You Will Be Doing</h4>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 space-y-2">
              {opportunity.whatYouWillDo.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#10AC84] mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Required & Attire / Dress Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Skills */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#FF5E57]" />
                Skills Required
              </h4>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
                {opportunity.skillsRequired.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#FF5E57] font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attire & Dress Code */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-[#54A0FF]" />
                Attire & Dress Code Guidelines
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {opportunity.attire}
              </p>
            </div>
          </div>

          {/* Allergy, Physical Constraints & Accessibility */}
          <div className="bg-[#FFF3E0]/70 rounded-2xl p-4 border border-[#FFE0B2] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EF6C00] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#EF6C00]" />
              Health, Allergy & Physical Constraints
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[#EF6C00]/80 font-bold uppercase text-[10px]">Allergy Warnings:</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {opportunity.constraints.allergies.join(", ") || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-[#EF6C00]/80 font-bold uppercase text-[10px]">Physical Demands:</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {opportunity.constraints.physicalDemands.join(", ") || "Standard activity"}
                </p>
              </div>

              <div>
                <p className="text-[#EF6C00]/80 font-bold uppercase text-[10px]">Environment & Access:</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {opportunity.constraints.indoorOutdoor} • {opportunity.constraints.wheelchairAccessible ? "Wheelchair Accessible" : "Step Access Required"}
                </p>
              </div>
            </div>
          </div>

          {/* Location & NYC Transit Info */}
          <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Train className="w-4 h-4 text-[#54A0FF]" />
              Location & NYC Subway Lines
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">{opportunity.address}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.subwayLines.map((line, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 font-bold">
                  <Train className="w-3 h-3 text-gray-400" />
                  {line}
                </span>
              ))}
            </div>
          </div>



          {/* Contact Details & Social Links */}
          <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Ways to Contact Organization & Verify Links</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#D97706] bg-[#FFF8E7] border border-[#FFE082] hover:bg-[#FFE082]/50 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Flag className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Report Incorrect Info</span>
                </button>
                <button
                  onClick={handleVerifyLinks}
                  disabled={verifyingLinks}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] border border-[#C8E6C9] hover:bg-[#C8E6C9] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                  <span>{verifyingLinks ? "Auditing Links..." : "AI Verify Links"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`mailto:${linkReport?.verifiedEmail || opportunity.contactEmail}`} className="hover:underline font-medium truncate">
                  {linkReport?.verifiedEmail || opportunity.contactEmail}
                </a>
              </div>

              {opportunity.contactPhone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{opportunity.contactPhone}</span>
                </div>
              )}

              {opportunity.orgWebsite && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={linkReport?.verifiedWebsite || opportunity.orgWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline font-bold truncate text-[#54A0FF]">
                    Official Website
                  </a>
                </div>
              )}

              {opportunity.socialLinks?.instagram && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-[10px]">IG</span>
                  <a href={opportunity.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium truncate text-pink-600">
                    Instagram
                  </a>
                </div>
              )}

              {opportunity.socialLinks?.facebook && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">f</span>
                  <a href={opportunity.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium truncate text-blue-600">
                    Facebook
                  </a>
                </div>
              )}
            </div>

            {/* Link Verification Result Box */}
            {linkReport && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10AC84]" />
                    Audited Results & Confidence Scores: <span className={linkReport.isVerified ? "text-[#10AC84]" : "text-amber-600"}>{linkReport.isVerified ? "Verified Active" : "Review Recommended"}</span>
                  </span>
                  <span className="font-bold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                    {linkReport.confidenceScore}% Confidence
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{linkReport.verificationSummary}</p>
                {linkReport.sources && linkReport.sources.length > 0 && (
                  <div className="pt-1 text-[11px] text-gray-500">
                    <strong className="text-gray-700">Live Grounding Sources:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {linkReport.sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[#54A0FF] hover:underline truncate max-w-[200px]">
                          🔗 {s.title || s.uri}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 sm:px-8 border-t border-gray-200 bg-[#F8F9FA] flex items-center justify-between gap-4">
          <div className="text-xs text-gray-600 font-medium">
            <strong className="font-extrabold text-gray-900">{opportunity.spotsRemaining} spots</strong> currently open
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>

            {conflictInfo.hasConflict ? (
              <button
                id="btn-modal-apply-locked"
                disabled
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 opacity-90 cursor-not-allowed flex items-center gap-2 shadow-2xs"
                title={conflictInfo.reason}
              >
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Application Locked (Time Conflict)</span>
              </button>
            ) : opportunity.applicationMode === 'direct' ? (
              <button
                id="btn-modal-direct-apply"
                onClick={() => {
                  onClose();
                  onApply(opportunity);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center gap-1.5"
              >
                <span>Submit Quick Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                id="btn-modal-external-apply"
                href={opportunity.externalApplyUrl || opportunity.orgWebsite || "https://www.eventbrite.com"}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md ${
                  isEventbrite
                    ? 'bg-[#F05537] hover:bg-[#D94525] shadow-[#F0553733]'
                    : 'bg-[#54A0FF] hover:brightness-105 shadow-[#54A0FF33]'
                }`}
              >
                <span>{isEventbrite ? "Register on Eventbrite" : `Register on ${opportunity.source}`}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

      </div>

      {showReportModal && (
        <ReportModal opportunity={opportunity} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

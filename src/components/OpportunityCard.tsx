import React from 'react';
import { 
  MapPin, 
  Train, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Shirt, 
  UserCheck, 
  ArrowRight, 
  Flame, 
  Accessibility, 
  CalendarDays,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { VolunteerOpportunity, ScheduleConflictInfo } from '../types';

interface OpportunityCardProps {
  opportunity: VolunteerOpportunity;
  conflictInfo?: ScheduleConflictInfo;
  onSelect: (opp: VolunteerOpportunity) => void;
  onApply?: (opp: VolunteerOpportunity) => void;
  onDirectApply?: (opp: VolunteerOpportunity) => void;
  onExternalApply?: (opp: VolunteerOpportunity) => void;
}

const CAUSE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Food Security & Hunger": { bg: "bg-[#FFF3E0]", text: "text-[#EF6C00]", border: "border-[#FFE0B2]" },
  "Youth & Education": { bg: "bg-[#E1F5FE]", text: "text-[#039BE5]", border: "border-[#B3E5FC]" },
  "Animal Welfare": { bg: "bg-[#F3E5F5]", text: "text-[#8E24AA]", border: "border-[#E1BEE7]" },
  "Environment & Parks": { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#C8E6C9]" },
  "Housing & Homelessness": { bg: "bg-[#EDE7F6]", text: "text-[#5E35B1]", border: "border-[#D1C4E9]" },
  "Senior Support": { bg: "bg-[#E0F2F1]", text: "text-[#00897B]", border: "border-[#B2DFDB]" },
  "Arts & Culture": { bg: "bg-[#FCE4EC]", text: "text-[#D81B60]", border: "border-[#F8BBD0]" },
  "Health & Wellness": { bg: "bg-[#E0F7FA]", text: "text-[#0097A7]", border: "border-[#B2EBF2]" },
  "Community Advocacy": { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFECB3]" },
  "Crisis & Disaster Relief": { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#FFCDD2]" }
};

const SOURCE_BADGES: Record<string, { label: string; style: string; isExternal?: boolean }> = {
  "Non-Profit Direct": { label: "Non-Profit Direct", style: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]" },
  "Idealist.org": { label: "Idealist", style: "bg-[#E1F5FE] text-[#039BE5] border-[#B3E5FC]", isExternal: true },
  "Eventbrite": { label: "Eventbrite", style: "bg-[#FFF0ED] text-[#D04020] border-[#FFC8BE]", isExternal: true },
  "Point App": { label: "Point App", style: "bg-[#F3E5F5] text-[#8E24AA] border-[#E1BEE7]" },
  "NYC Service / Community": { label: "NYC Service", style: "bg-[#F0F2F5] text-gray-700 border-gray-200" }
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  conflictInfo,
  onSelect,
  onApply,
  onDirectApply,
  onExternalApply
}) => {
  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDirectApply) onDirectApply(opportunity);
    else if (onApply) onApply(opportunity);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExternalApply) onExternalApply(opportunity);
  };

  const causeStyle = CAUSE_COLORS[opportunity.cause] || { bg: "bg-[#F0F2F5]", text: "text-gray-800", border: "border-gray-200" };
  const sourceInfo = SOURCE_BADGES[opportunity.source] || { label: opportunity.source, style: "bg-[#F0F2F5] text-gray-800 border-gray-200" };

  const isEventbrite = opportunity.source === "Eventbrite" || (opportunity.externalApplyUrl && opportunity.externalApplyUrl.includes("eventbrite"));
  const hasConflict = conflictInfo?.hasConflict;

  return (
    <div 
      id={`opp-card-${opportunity.id}`}
      className={`bg-white rounded-3xl border p-6 shadow-sm transition-all flex flex-col justify-between group ${
        hasConflict 
          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400' 
          : 'border-gray-200 hover:border-[#FF5E57] hover:shadow-md'
      }`}
    >
      <div className="space-y-4">
        
        {/* Top Header: Organization, Source Platform & Urgency */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#2D3436] tracking-tight">
                {opportunity.organization}
              </span>
              
              {/* Source Tag with direct external indicator */}
              {opportunity.applicationMode === 'external' && opportunity.externalApplyUrl ? (
                <a
                  href={opportunity.externalApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Open on ${opportunity.source}`}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 hover:brightness-95 transition-all ${sourceInfo.style}`}
                >
                  <span>{sourceInfo.label}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sourceInfo.style}`}>
                  {sourceInfo.label}
                </span>
              )}

              {opportunity.urgent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-[#FF5E57]" />
                  Urgent
                </span>
              )}

              {hasConflict && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  Time Conflict
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{opportunity.neighborhood}, <strong className="font-bold text-gray-800">{opportunity.borough}</strong></span>
              {opportunity.subwayLines.length > 0 && (
                <span className="text-gray-400 text-[11px] hidden sm:inline">
                  • {opportunity.subwayLines[0]}
                </span>
              )}
            </div>
          </div>

          {/* Cause Pill */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex-shrink-0 ${causeStyle.bg} ${causeStyle.text} ${causeStyle.border}`}>
            {opportunity.cause}
          </span>
        </div>

        {/* Schedule Conflict Warning Notice */}
        {hasConflict && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Schedule Conflict with Confirmed Commitment</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
              {conflictInfo?.reason || `Overlaps with confirmed shift for "${conflictInfo?.conflictingOpportunityTitle || 'another role'}" within 2.5h buffer window.`}
            </p>
          </div>
        )}

        {/* Title & Description */}
        <div>
          <h3 
            onClick={() => onSelect(opportunity)}
            className="text-lg font-bold text-gray-900 group-hover:text-[#FF5E57] cursor-pointer transition-colors leading-snug"
          >
            {opportunity.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* PROMINENT DATE & TIME SCHEDULE CARD */}
        <div className="bg-[#FFF8E7] border border-[#FFE082] rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-black text-[#92400E]">
              <Calendar className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <span>{opportunity.nextDate || opportunity.dates}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#FFE082] text-[#92400E]">
              {opportunity.commitmentType}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium pl-6">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Shift: <strong className="text-gray-900">{opportunity.shiftSchedule}</strong> ({opportunity.timeDuration})</span>
          </div>

          {opportunity.upcomingDates && opportunity.upcomingDates.length > 0 && (
            <div className="pl-6 pt-1 text-[11px] text-gray-600 border-t border-[#FFE58F]/60 flex items-start gap-1">
              <span className="font-bold text-gray-700 flex-shrink-0">Dates:</span>
              <span className="line-clamp-1">{opportunity.dates}</span>
            </div>
          )}
        </div>

        {/* Logistics Metadata: Age, Attire, Environment */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs text-gray-700 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">Age: {opportunity.ageRequirement}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{opportunity.attire.split('.')[0]}</span>
          </div>
        </div>

        {/* Task Snippet */}
        {opportunity.whatYouWillDo && opportunity.whatYouWillDo.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">What you'll do</p>
            <ul className="text-xs text-gray-700 space-y-1">
              {opportunity.whatYouWillDo.slice(0, 2).map((task, idx) => (
                <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                  <span className="text-[#10AC84] font-bold">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Constraint Warnings & Verification Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {opportunity.constraints.wheelchairAccessible && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#039BE5] border border-[#B3E5FC]">
              <Accessibility className="w-3 h-3 text-[#54A0FF]" />
              Accessible
            </span>
          )}

          {opportunity.constraints.physicalDemands.length > 0 && opportunity.constraints.physicalDemands[0] !== "Low Physical/Desk" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0F2F5] text-gray-700 border border-gray-200">
              <AlertCircle className="w-3 h-3 text-[#FF9F43]" />
              {opportunity.constraints.physicalDemands[0]}
            </span>
          )}

          {opportunity.constraints.allergies.length > 0 && opportunity.constraints.allergies[0] !== "None" && opportunity.constraints.allergies[0] !== "None reported" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2] truncate max-w-[200px]">
              ⚠️ {opportunity.constraints.allergies[0]}
            </span>
          )}
        </div>

      </div>

      {/* Card Action Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500 font-medium">
          <span className="font-extrabold text-gray-900">{opportunity.spotsRemaining}</span> of {opportunity.spotsTotal} spots
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`btn-details-${opportunity.id}`}
            onClick={() => onSelect(opportunity)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-[#F0F2F5] hover:bg-gray-200 transition-colors"
          >
            Details
          </button>

          {hasConflict ? (
            <button
              id={`btn-apply-locked-${opportunity.id}`}
              disabled
              title={conflictInfo?.reason || "You already have a confirmed shift in this time block (+2.5h buffer). PitchInNYC stops overlapping commitments."}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-300 cursor-not-allowed opacity-90 flex items-center gap-1.5 shadow-2xs"
            >
              <Lock className="w-3 h-3 text-amber-700 flex-shrink-0" />
              <span>Shift Locked</span>
            </button>
          ) : opportunity.applicationMode === 'direct' ? (
            <button
              id={`btn-apply-direct-${opportunity.id}`}
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center gap-1"
            >
              <span>Quick Apply</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <a
              id={`btn-apply-external-${opportunity.id}`}
              href={opportunity.externalApplyUrl || opportunity.orgWebsite || "https://www.billionoysterproject.org/volunteer"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalClick}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md ${
                isEventbrite
                  ? 'bg-[#F05537] hover:bg-[#E04527] shadow-[#F0553733]'
                  : 'bg-[#54A0FF] hover:brightness-105 shadow-[#54A0FF33]'
              }`}
            >
              <span>{isEventbrite ? "Register on Eventbrite" : `Register with ${opportunity.source}`}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  Sparkles,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  CalendarDays,
  MapPin,
  Lock,
  Check
} from 'lucide-react';
import { Application, VolunteerOpportunity } from '../types';

interface ApplicationTrackerProps {
  applications: Application[];
  opportunities: VolunteerOpportunity[];
  onSelectOpportunity: (opportunity: VolunteerOpportunity) => void;
  onLogHours: (appId: string, hours: number) => void;
  onConfirmApplication?: (appId: string) => void;
  onCancelApplication?: (appId: string) => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerProps> = ({
  applications,
  opportunities,
  onSelectOpportunity,
  onLogHours,
  onConfirmApplication,
  onCancelApplication
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'confirmed' | 'pending' | 'cancelled' | 'all'>('confirmed');
  const [hourInputs, setHourInputs] = useState<Record<string, number>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalHours = applications.reduce((acc, a) => acc + (a.hoursCompleted || 0), 0);
  const confirmedApps = applications.filter(a => a.status === 'Confirmed' || a.status === 'Completed');
  const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Submitted' || a.status === 'Under Review');
  const cancelledApps = applications.filter(a => a.status === 'Cancelled');

  // Sort applications in reverse chronological order (newest first)
  const sortedApplications = [...applications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  const handleHourUpdate = (appId: string) => {
    const hours = hourInputs[appId];
    if (typeof hours === 'number' && hours > 0) {
      onLogHours(appId, hours);
    }
  };

  const handleConfirmShift = async (app: Application) => {
    setConfirmingId(app.id);
    setActionNotice(null);
    try {
      if (onConfirmApplication) {
        await onConfirmApplication(app.id);
      }
    } catch (err) {
      console.error("Failed to confirm shift:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelShift = async (appId: string) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      if (onCancelApplication) {
        onCancelApplication(appId);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Header & Total Hours Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10AC84] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9] flex items-center gap-1.5 shadow-xs">
              <CalendarCheck className="w-3.5 h-3.5" />
              Volunteer Record & Schedule
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            My NYC Volunteer Applications & Hours
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Manage your confirmed volunteer shifts, confirm pending applications, track auto-cancelled time conflicts, and log your service hours.
          </p>
        </div>

        {/* Total Hours Badge */}
        <div className="bg-[#F8F9FA] px-5 py-3 rounded-2xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5E57]/10 text-[#FF5E57] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Service Hours</span>
            <p className="text-xl font-black text-gray-900">{totalHours} hrs</p>
          </div>
        </div>
      </div>

      {/* Info Banner: Duplication & Conflict Rules */}
      <div className="bg-[#FFF8E7] border border-[#FFE082] rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#92400E]">
        <Info className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#78350F] text-sm">
            PitchInNYC Schedule & Conflict Policy
          </h4>
          <p className="leading-relaxed text-[#92400E]">
            You can submit applications to multiple opportunities for the same day and time block while pending. Once any application is <strong>Confirmed</strong>, PitchInNYC automatically <strong>cancels overlapping pending applications</strong> (with a ±2.5 hour buffer for NYC transit) and prevents new conflicting registrations.
          </p>
        </div>
      </div>

      {/* Sidebar / Tab Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2 bg-white p-4 rounded-3xl border border-gray-200 h-fit shadow-xs">
          <button
            id="tab-confirmed-shifts"
            onClick={() => setActiveSubTab('confirmed')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSubTab === 'confirmed' ? 'bg-[#10AC84] text-white shadow-sm shadow-[#10AC8433]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Confirmed Shifts
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeSubTab === 'confirmed' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {confirmedApps.length}
            </span>
          </button>

          <button
            id="tab-pending-shifts"
            onClick={() => setActiveSubTab('pending')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSubTab === 'pending' ? 'bg-[#FF9F43] text-white shadow-sm shadow-[#FF9F4333]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Selection
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeSubTab === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {pendingApps.length}
            </span>
          </button>

          <button
            id="tab-cancelled-shifts"
            onClick={() => setActiveSubTab('cancelled')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSubTab === 'cancelled' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Auto-Cancelled
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeSubTab === 'cancelled' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {cancelledApps.length}
            </span>
          </button>

          <button
            id="tab-all-shifts"
            onClick={() => setActiveSubTab('all')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSubTab === 'all' ? 'bg-[#54A0FF] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              All History
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeSubTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {sortedApplications.length}
            </span>
          </button>
        </div>

        <div className="md:col-span-3 space-y-4">
          
          {/* CONFIRMED SHIFTS */}
          {activeSubTab === 'confirmed' && (
            confirmedApps.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
                <Award className="w-8 h-8 text-[#10AC84] mx-auto" />
                <p className="text-sm font-bold text-gray-800">No confirmed shifts yet</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When you accept and confirm a pending application, your shift will be locked in here and other overlapping applications will be automatically resolved.
                </p>
              </div>
            ) : (
              confirmedApps.map(app => {
                const matchedOpp = opportunities.find(o => o.id === app.opportunityId || o.title === app.opportunityTitle);
                return (
                  <div key={`confirmed-${app.id}`} className="bg-white p-6 rounded-3xl border-2 border-[#C8E6C9] shadow-sm space-y-4">
                    <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-[#1B5E20] font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                        <span>Confirmed Shift • Double-booking protection active</span>
                      </div>
                      <span className="text-[10px] bg-white text-[#2E7D32] px-2.5 py-0.5 rounded-full border border-[#C8E6C9] font-black uppercase tracking-wider">
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {matchedOpp && (
                          <span className="text-xs font-bold text-[#10AC84] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                            {matchedOpp.cause}
                          </span>
                        )}
                        <h4 className="text-lg font-bold text-gray-900 mt-1.5">{app.opportunityTitle}</h4>
                        <p className="text-xs text-gray-600 font-medium">Organization: {app.organization}</p>
                      </div>

                      {matchedOpp && (
                        <button
                          onClick={() => onSelectOpportunity(matchedOpp)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10AC84] hover:brightness-105 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View Role</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-400 font-bold text-[10px] uppercase">Shift Slot</span>
                        <p className="font-bold text-gray-900 mt-0.5">{app.shiftSelected}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold text-[10px] uppercase">Status</span>
                        <p className="font-bold text-[#2E7D32] mt-0.5">Active Confirmed</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold text-[10px] uppercase">Applicant</span>
                        <p className="font-bold text-gray-900 mt-0.5 truncate">{app.applicantName}</p>
                      </div>
                    </div>

                    {/* Log Hours Section */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700">Log Service Hours:</span>
                        <input
                          type="number"
                          step={0.5}
                          min={0.5}
                          placeholder="e.g. 3.5"
                          value={hourInputs[app.id] ?? ''}
                          onChange={(e) => setHourInputs({ ...hourInputs, [app.id]: Number(e.target.value) })}
                          className="w-20 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10AC84]"
                        />
                        <button
                          onClick={() => handleHourUpdate(app.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#10AC84] text-white font-bold hover:brightness-105 shadow-xs transition-all"
                        >
                          Save Hours
                        </button>
                      </div>

                      <span className="font-black text-[#10AC84] text-sm">
                        {app.hoursCompleted || 0} Hours Completed
                      </span>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* PENDING APPLICATIONS */}
          {activeSubTab === 'pending' && (
            pendingApps.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-gray-800">No pending applications</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You can apply to multiple opportunities for the same day and time block. Once you confirm one, all conflicting pending requests will automatically cancel.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Ready to commit?</strong> Click <strong>"Confirm This Shift"</strong> on your chosen placement. PitchInNYC will immediately lock in your spot and cancel other pending applications that overlap during that timeframe.
                  </p>
                </div>

                {pendingApps.map(app => {
                  const matchedOpp = opportunities.find(o => o.id === app.opportunityId || o.title === app.opportunityTitle);
                  const isConfirming = confirmingId === app.id;

                  return (
                    <div key={`pending-${app.id}`} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 text-sm">{app.opportunityTitle}</span>
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {app.status}
                        </span>
                      </div>

                      <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#FFE082] text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold text-[#92400E]">
                          <CalendarDays className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Shift: {app.shiftSelected}</span>
                        </div>
                        <p className="text-gray-600 pl-5 text-[11px]">
                          Organization: <strong className="text-gray-800">{app.organization}</strong> • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        {matchedOpp ? (
                          <button
                            onClick={() => onSelectOpportunity(matchedOpp)}
                            className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
                          >
                            View Role Details →
                          </button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancelShift(app.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            Withdraw
                          </button>

                          <button
                            id={`btn-confirm-shift-${app.id}`}
                            onClick={() => handleConfirmShift(app)}
                            disabled={isConfirming}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#10AC84] hover:brightness-105 shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isConfirming ? "Confirming..." : "Confirm This Shift"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* AUTO-CANCELLED CONFLICTS */}
          {activeSubTab === 'cancelled' && (
            cancelledApps.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-bold text-gray-800">No cancelled applications</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When you confirm a shift, any overlapping pending applications will appear here with conflict reason and timestamp details.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cancelledApps.map(app => (
                  <div key={`cancelled-${app.id}`} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-2.5 opacity-90">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 line-through">{app.opportunityTitle}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-gray-500" />
                        Cancelled
                      </span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Cancellation Reason</span>
                      </div>
                      <p className="text-amber-800 text-[11px] pl-5 leading-relaxed">
                        {app.cancellationReason || "Auto-cancelled to avoid double-booking after confirming another shift for this timeframe."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span>Shift was: {app.shiftSelected}</span>
                      <span>Organization: {app.organization}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ALL HISTORY */}
          {activeSubTab === 'all' && (
            sortedApplications.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
                <CalendarCheck className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-bold text-gray-800">No application records yet</p>
              </div>
            ) : (
              sortedApplications.map(app => {
                const matchedOpp = opportunities.find(o => o.id === app.opportunityId || o.title === app.opportunityTitle);
                const isConfirmed = app.status === 'Confirmed' || app.status === 'Completed';
                const isCancelled = app.status === 'Cancelled';

                return (
                  <div 
                    key={`all-sub-${app.id}`} 
                    className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold text-sm ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {app.opportunityTitle}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        isConfirmed ? 'bg-[#E8F5E9] text-[#10AC84] border border-[#C8E6C9]' :
                        isCancelled ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                      Organization: <strong className="text-gray-700">{app.organization}</strong> • Shift: <strong className="text-gray-700">{app.shiftSelected}</strong>
                    </p>

                    {isCancelled && app.cancellationReason && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        ⚠️ {app.cancellationReason}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                      <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {matchedOpp && (
                        <button 
                          onClick={() => onSelectOpportunity(matchedOpp)}
                          className="text-[#10AC84] font-bold hover:underline"
                        >
                          View Opportunity →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          )}

        </div>
      </div>

    </div>
  );
};

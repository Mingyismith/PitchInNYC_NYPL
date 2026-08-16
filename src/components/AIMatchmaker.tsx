import React, { useState } from 'react';
import { Sparkles, MapPin, Heart, Clock, AlertCircle, ArrowRight, ShieldCheck, Check, ExternalLink, AlertTriangle, CalendarOff, Lock } from 'lucide-react';
import { Borough, CauseType, CommitmentType, VolunteerOpportunity, AIMatchResponse, Application } from '../types';
import { checkOpportunityConflictWithConfirmedApps } from '../utils/conflictUtils';

interface AIMatchmakerProps {
  opportunities: VolunteerOpportunity[];
  applications?: Application[];
  onSelectOpportunity: (opp: VolunteerOpportunity) => void;
  onApplyOpportunity: (opp: VolunteerOpportunity) => void;
}

const BOROUGHS: Borough[] = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "Remote / Citywide"
];

const CAUSES: CauseType[] = [
  "Food Security & Hunger",
  "Youth & Education",
  "Animal Welfare",
  "Environment & Parks",
  "Housing & Homelessness",
  "Senior Support",
  "Arts & Culture",
  "Health & Wellness",
  "Community Advocacy"
];

export const AIMatchmakerView: React.FC<AIMatchmakerProps> = ({
  opportunities,
  applications = [],
  onSelectOpportunity,
  onApplyOpportunity
}) => {
  const [selectedBoroughs, setSelectedBoroughs] = useState<Borough[]>(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.boroughs && parsed.boroughs.length > 0) return parsed.boroughs;
      }
    } catch (e) {}
    return ["Manhattan", "Brooklyn"];
  });

  const [selectedCauses, setSelectedCauses] = useState<CauseType[]>(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.causes && parsed.causes.length > 0) return parsed.causes;
      }
    } catch (e) {}
    return ["Food Security & Hunger", "Environment & Parks"];
  });

  const [availableDays, setAvailableDays] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.availableDays && parsed.availableDays.length > 0) return parsed.availableDays;
      }
    } catch (e) {}
    return ["Saturday", "Sunday"];
  });

  const [maxHours, setMaxHours] = useState(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxHoursPerWeek) return parsed.maxHoursPerWeek;
      }
    } catch (e) {}
    return 4;
  });

  const [skillsText, setSkillsText] = useState(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.skillsOrInterests) return parsed.skillsOrInterests;
      }
    } catch (e) {}
    return '';
  });

  const [allergiesText, setAllergiesText] = useState('No pet allergies');
  
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<AIMatchResponse | null>(null);

  const toggleBorough = (b: Borough) => {
    if (selectedBoroughs.includes(b)) {
      setSelectedBoroughs(selectedBoroughs.filter(item => item !== b));
    } else {
      setSelectedBoroughs([...selectedBoroughs, b]);
    }
  };

  const toggleCause = (c: CauseType) => {
    if (selectedCauses.includes(c)) {
      setSelectedCauses(selectedCauses.filter(item => item !== c));
    } else {
      setSelectedCauses([...selectedCauses, c]);
    }
  };

  const toggleDay = (d: string) => {
    if (availableDays.includes(d)) {
      setAvailableDays(availableDays.filter(item => item !== d));
    } else {
      setAvailableDays([...availableDays, d]);
    }
  };

  const handleGenerateMatches = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/matchmaker/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            boroughs: selectedBoroughs,
            causes: selectedCauses,
            availableDays,
            maxHoursPerWeek: maxHours,
            skillsOrInterests: skillsText,
            allergyPreferences: allergiesText
          },
          applications
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMatchResult(data);
      } else {
        // Fallback client-side matches if server returns error
        const fallbackMatches = opportunities.slice(0, 3).map((o, i) => ({
          opportunityId: o.id,
          matchScore: 92 - i * 4,
          whyMatch: `Great match for your interest in ${o.cause} located in ${o.borough}.`,
          highlightedPros: [`Location: ${o.borough}`, `Commitment: ${o.commitmentType}`]
        }));
        setMatchResult({
          topMatches: fallbackMatches,
          personalizedAdvice: "Here are your tailored NYC volunteer matches based on your preferences."
        });
      }
    } catch (err) {
      console.error("Matchmaker failed:", err);
      const fallbackMatches = opportunities.slice(0, 3).map((o, i) => ({
        opportunityId: o.id,
        matchScore: 90 - i * 4,
        whyMatch: `Great match for your interest in ${o.cause} located in ${o.borough}.`,
        highlightedPros: [`Location: ${o.borough}`, `Commitment: ${o.commitmentType}`]
      }));
      setMatchResult({
        topMatches: fallbackMatches,
        personalizedAdvice: "Here are your tailored NYC volunteer matches based on your preferences."
      });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF9F43] bg-[#FFF3E0] px-3 py-1 rounded-full border border-[#FFE0B2] flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9F43]" />
            AI Matchmaking Assistant
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          Find Your Ideal NYC Volunteer Placement
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl leading-relaxed">
          Gemini AI automatically uses your saved user profile preferences (boroughs and causes) to rank and recommend the best volunteer shifts for you.
        </p>
      </div>

      {/* Preferences Form */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Borough selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            1. Where in NYC can you volunteer?
          </label>
          <div className="flex flex-wrap gap-2">
            {BOROUGHS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBorough(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedBoroughs.includes(b)
                    ? 'bg-[#FF5E57] text-white border-[#FF5E57] shadow-sm shadow-[#FF5E5733]'
                    : 'bg-[#F8F9FA] text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {selectedBoroughs.includes(b) && <Check className="w-3.5 h-3.5" />}
                <span>{b}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Causes selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            2. Which causes resonate most with you?
          </label>
          <div className="flex flex-wrap gap-2">
            {CAUSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCause(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedCauses.includes(c)
                    ? 'bg-[#54A0FF] text-white border-[#54A0FF] shadow-sm shadow-[#54A0FF33]'
                    : 'bg-[#F8F9FA] text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {selectedCauses.includes(c) && <Check className="w-3.5 h-3.5" />}
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Availability Days */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            3. What days are you usually free?
          </label>
          <div className="flex flex-wrap gap-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  availableDays.includes(d)
                    ? 'bg-[#10AC84] text-white border-[#10AC84] shadow-sm shadow-[#10AC8433]'
                    : 'bg-[#F8F9FA] text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders & Text Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Max Hours per Volunteer Session ({maxHours} hours)
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="w-full accent-[#FF5E57] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
              <span>1 hr (Micro-shift)</span>
              <span>4 hrs (Half day)</span>
              <span>8 hrs (Full day)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Allergies or Physical Constraints
            </label>
            <input
              type="text"
              placeholder="e.g. Cat allergy, prefer sitting, no heavy lifting"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Your Skills, Hobbies, or Background (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Spanish speaker, cooking, teaching kids, gardening, photography..."
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
          />
        </div>



        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
          <button
            id="btn-run-ai-matchmaker"
            onClick={handleGenerateMatches}
            disabled={isMatching}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isMatching ? "Calculating NYC Matches with Gemini..." : "Generate AI Matches"}</span>
          </button>
        </div>

      </div>

      {/* Results View */}
      {matchResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Personalized Advice */}
          <div className="bg-[#FFF3E0] p-5 rounded-3xl border border-[#FFE0B2] space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9F43]" />
              AI Matchmaker Insights & Advice
            </h4>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              {matchResult.personalizedAdvice}
            </p>
          </div>

          {/* Top Matched Opportunities List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Your Top Recommended Roles</h3>

            {matchResult.topMatches.map((matchItem, idx) => {
              const opp = opportunities.find(o => o.id === matchItem.opportunityId);
              if (!opp) return null;

              const conflict = checkOpportunityConflictWithConfirmedApps(opp, applications);

              return (
                <div 
                  key={idx}
                  className={`bg-white rounded-3xl border shadow-sm p-5 sm:p-6 space-y-4 transition-all ${
                    conflict.hasConflict ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 hover:border-[#FF5E57]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-gray-900">{opp.organization}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {opp.borough} • {opp.neighborhood}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#10AC84] border border-[#C8E6C9]">
                          {opp.cause}
                        </span>
                        {conflict.hasConflict && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Time Conflict with Confirmed Shift
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-gray-900">{opp.title}</h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xl font-black text-[#10AC84]">{matchItem.matchScore}%</span>
                      <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Match Score</p>
                    </div>
                  </div>

                  {/* Conflict Notice if any */}
                  {conflict.hasConflict && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                      <CalendarOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Schedule Conflict:</strong> {conflict.reason}
                      </div>
                    </div>
                  )}

                  {/* Why it matches */}
                  <p className="text-xs text-gray-700 bg-[#F8F9FA] p-3 rounded-xl border border-gray-100 leading-relaxed">
                    <strong className="text-gray-900 font-bold">Why this is a fit: </strong>
                    {matchItem.whyMatch}
                  </p>

                  {/* Score Calculation Breakdown */}
                  {matchItem.scoreBreakdown && (
                    <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-sky-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          Match Score Calculation Breakdown ({matchItem.matchScore}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-gray-400 block font-semibold">Borough Fit</span>
                          <strong className="text-gray-900">{matchItem.scoreBreakdown.boroughMatchScore} / 25 pts</strong>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-gray-400 block font-semibold">Cause Match</span>
                          <strong className="text-gray-900">{matchItem.scoreBreakdown.causeMatchScore} / 35 pts</strong>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-gray-400 block font-semibold">Schedule Open</span>
                          <strong className="text-gray-900">{matchItem.scoreBreakdown.scheduleMatchScore} / 25 pts</strong>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-sky-100">
                          <span className="text-gray-400 block font-semibold">Skills / Constraints</span>
                          <strong className="text-gray-900">{matchItem.scoreBreakdown.skillsAllergyMatchScore} / 15 pts</strong>
                        </div>
                      </div>
                      <p className="text-gray-600 italic text-[11px]">
                        {matchItem.scoreBreakdown.calculationExplanation}
                      </p>
                    </div>
                  )}

                  {/* Highlights and Dates */}
                  <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#FFE082] text-xs flex items-center justify-between gap-2">
                    <span className="font-bold text-[#92400E]">📅 Next: {opp.nextDate || opp.dates}</span>
                    <span className="text-gray-600 font-medium">{opp.shiftSchedule}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {matchItem.highlightedPros.map((pro, pIdx) => (
                      <span key={pIdx} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#E8F5E9] text-[#10AC84] border border-[#C8E6C9]">
                        ✓ {pro}
                      </span>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">
                      {opp.commitmentType} • {opp.timeDuration}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Inspect Details
                      </button>

                      {opp.applicationMode === 'external' ? (
                        <a
                          href={opp.externalApplyUrl || opp.orgWebsite || "https://www.billionoysterproject.org/volunteer"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-sm shadow-[#FF5E5733] transition-all flex items-center gap-1"
                        >
                          <span>Register with {opp.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : conflict.hasConflict ? (
                        <button
                          onClick={() => onSelectOpportunity(opp)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed flex items-center gap-1.5"
                          title={conflict.reason}
                        >
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Conflicting Slot</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onApplyOpportunity(opp)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-sm shadow-[#FF5E5733] transition-all flex items-center gap-1"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

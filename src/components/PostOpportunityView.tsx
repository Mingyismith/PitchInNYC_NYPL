import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Train, 
  Plus, 
  Trash2, 
  Send,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Borough, CauseType, CommitmentType, SourcePlatform, VolunteerOpportunity } from '../types';

interface PostOpportunityViewProps {
  onOpportunityCreated: (newOpp: VolunteerOpportunity) => void;
  onCancel: () => void;
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
  "Community Advocacy",
  "Crisis & Disaster Relief"
];

const COMMITMENT_TYPES: CommitmentType[] = [
  "One-time Shift",
  "Weekly Recurring",
  "Monthly Recurring",
  "Flexible Schedule",
  "Seasonal / Multi-Week"
];

const SOURCES: SourcePlatform[] = [
  "Non-Profit Direct",
  "Idealist.org",
  "Eventbrite",
  "Point App",
  "NYC Service / Community"
];

export const PostOpportunityView: React.FC<PostOpportunityViewProps> = ({
  onOpportunityCreated,
  onCancel
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgContactPerson, setOrgContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [cause, setCause] = useState<CauseType>('Food Security & Hunger');
  const [borough, setBorough] = useState<Borough>('Manhattan');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [subwayInput, setSubwayInput] = useState('');
  const [subwayLines, setSubwayLines] = useState<string[]>(['6 Train']);
  const [commitmentType, setCommitmentType] = useState<CommitmentType>('One-time Shift');
  const [dates, setDates] = useState('Upcoming Saturday');
  const [timeDuration, setTimeDuration] = useState('3 Hours');
  const [shiftSchedule, setShiftSchedule] = useState('9:00 AM - 12:00 PM');
  
  // Dynamic lists
  const [whatYouWillDo, setWhatYouWillDo] = useState<string[]>([
    'Assist on-site team with community logistics',
    'Engage with participants and coordinate distribution'
  ]);
  const [taskInput, setTaskInput] = useState('');

  const [skillsRequired, setSkillsRequired] = useState<string[]>([
    'No prior experience necessary',
    'Positive community mindset'
  ]);
  const [skillInput, setSkillInput] = useState('');

  const [ageRequirement, setAgeRequirement] = useState('16+ (or with adult guardian)');
  const [attire, setAttire] = useState('Closed-toe shoes and comfortable casual clothes');

  // Constraints
  const [allergyWarnings, setAllergyWarnings] = useState('None reported');
  const [physicalDemands, setPhysicalDemands] = useState('Standing and light lifting');
  const [wheelchairAccessible, setWheelchairAccessible] = useState(true);
  const [indoorOutdoor, setIndoorOutdoor] = useState<'Indoor' | 'Outdoor' | 'Hybrid'>('Indoor');

  // Application flow
  const [applicationMode, setApplicationMode] = useState<'direct' | 'external'>('direct');
  const [externalApplyUrl, setExternalApplyUrl] = useState('');
  const [spotsTotal, setSpotsTotal] = useState(15);
  const [source, setSource] = useState<SourcePlatform>('Non-Profit Direct');
  const [urgent, setUrgent] = useState(false);

  // AI Magic Autofill state
  const [aiRawText, setAiRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParseSuccess, setAiParseSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task list helpers
  const addTask = () => {
    if (taskInput.trim()) {
      setWhatYouWillDo([...whatYouWillDo, taskInput.trim()]);
      setTaskInput('');
    }
  };
  const removeTask = (index: number) => {
    setWhatYouWillDo(whatYouWillDo.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkillsRequired([...skillsRequired, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (index: number) => {
    setSkillsRequired(skillsRequired.filter((_, i) => i !== index));
  };

  const addSubway = () => {
    if (subwayInput.trim()) {
      setSubwayLines([...subwayLines, subwayInput.trim()]);
      setSubwayInput('');
    }
  };
  const removeSubway = (index: number) => {
    setSubwayLines(subwayLines.filter((_, i) => i !== index));
  };

  // AI Auto-Fill Function
  const handleAiAutoFill = async () => {
    if (!aiRawText.trim()) return;
    setIsAiParsing(true);
    try {
      const res = await fetch('/api/opportunities/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiRawText })
      });

      if (res.ok) {
        const parsed = await res.json();
        if (parsed.title) setTitle(parsed.title);
        if (parsed.organization) setOrganization(parsed.organization);
        if (parsed.orgWebsite) setOrgWebsite(parsed.orgWebsite);
        if (parsed.orgContactPerson) setOrgContactPerson(parsed.orgContactPerson);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.cause) setCause(parsed.cause as CauseType);
        if (parsed.borough) setBorough(parsed.borough as Borough);
        if (parsed.neighborhood) setNeighborhood(parsed.neighborhood);
        if (parsed.address) setAddress(parsed.address);
        if (Array.isArray(parsed.subwayLines) && parsed.subwayLines.length > 0) setSubwayLines(parsed.subwayLines);
        if (parsed.commitmentType) setCommitmentType(parsed.commitmentType as CommitmentType);
        if (parsed.dates) setDates(parsed.dates);
        if (parsed.timeDuration) setTimeDuration(parsed.timeDuration);
        if (parsed.shiftSchedule) setShiftSchedule(parsed.shiftSchedule);
        if (Array.isArray(parsed.whatYouWillDo) && parsed.whatYouWillDo.length > 0) setWhatYouWillDo(parsed.whatYouWillDo);
        if (Array.isArray(parsed.skillsRequired) && parsed.skillsRequired.length > 0) setSkillsRequired(parsed.skillsRequired);
        if (parsed.ageRequirement) setAgeRequirement(parsed.ageRequirement);
        if (parsed.attire) setAttire(parsed.attire);

        if (parsed.constraints) {
          if (Array.isArray(parsed.constraints.allergies)) setAllergyWarnings(parsed.constraints.allergies.join(', '));
          if (Array.isArray(parsed.constraints.physicalDemands)) setPhysicalDemands(parsed.constraints.physicalDemands.join(', '));
          setWheelchairAccessible(parsed.constraints.wheelchairAccessible ?? true);
          if (parsed.constraints.indoorOutdoor) setIndoorOutdoor(parsed.constraints.indoorOutdoor);
        }
        if (parsed.applicationMode) setApplicationMode(parsed.applicationMode);
        if (parsed.externalApplyUrl) setExternalApplyUrl(parsed.externalApplyUrl);
        if (parsed.spotsTotal) setSpotsTotal(parsed.spotsTotal);
        if (parsed.source) setSource(parsed.source as SourcePlatform);

        setAiParseSuccess(true);
      }
    } catch (err) {
      console.error("AI parse failed:", err);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !organization || !description) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<VolunteerOpportunity> = {
        title,
        organization,
        orgWebsite,
        orgContactPerson,
        contactEmail: contactEmail || 'volunteer@pitchinnc.org',
        contactPhone,
        description,
        cause,
        borough,
        neighborhood: neighborhood || `${borough} Center`,
        address: address || `${borough}, New York, NY`,
        subwayLines: subwayLines.length > 0 ? subwayLines : ['Subway nearby'],
        commitmentType,
        dates,
        timeDuration,
        shiftSchedule,
        whatYouWillDo: whatYouWillDo.length > 0 ? whatYouWillDo : ['Volunteer task execution'],
        skillsRequired: skillsRequired.length > 0 ? skillsRequired : ['Open to all'],
        ageRequirement,
        attire,

        constraints: {
          allergies: allergyWarnings.split(',').map(s => s.trim()).filter(Boolean),
          physicalDemands: physicalDemands.split(',').map(s => s.trim()).filter(Boolean),
          wheelchairAccessible,
          indoorOutdoor
        },
        applicationMode,
        externalApplyUrl: applicationMode === 'external' ? externalApplyUrl : '',
        spotsTotal: Number(spotsTotal) || 10,
        spotsRemaining: Number(spotsTotal) || 10,
        source,
        urgent
      };

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdOpp = await res.json();
        onOpportunityCreated(createdOpp);
      }
    } catch (err) {
      console.error("Failed to post opportunity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* View Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#10AC84] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9] flex items-center gap-1.5 shadow-xs">
            For Non-Profits & Organizers
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          Post a New Volunteer Opportunity
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl leading-relaxed">
          Connect your organization with dedicated New Yorkers across the 5 boroughs. All listings support direct application or redirect links with AI volunteer credit verification.
        </p>
      </div>

      {/* Magic AI Auto-Fill Section */}
      <div className="bg-gradient-to-br from-[#2D3436] via-[#1e272e] to-[#10AC84] text-white rounded-3xl p-5 sm:p-7 shadow-lg mb-8 border border-gray-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FF9F43]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Instant Autofill</h3>
            <p className="text-xs text-gray-300">Paste any text, flyer, email draft, or Eventbrite/Idealist snippet</p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <textarea
            id="ai-autofill-rawtext"
            rows={3}
            value={aiRawText}
            onChange={(e) => setAiRawText(e.target.value)}
            placeholder="Paste your announcement or blurb here (e.g. 'City Harvest is seeking 20 volunteers this Saturday in Mott Haven Bronx for fresh produce distribution from 8:30am to 12pm. Closed toe shoes required. High school credit offered...')"
            className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10AC84]"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-gray-300">
              {aiParseSuccess ? "✓ Form fields populated successfully with Gemini AI!" : "Gemini AI will automatically structure all subway lines, tasks, attire, and credit requirements."}
            </div>

            <button
              id="btn-trigger-ai-autofill"
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAiParsing || !aiRawText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10AC84] hover:brightness-110 text-white shadow-md shadow-[#10AC8444] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiParsing ? "Extracting with Gemini..." : "Auto-Fill Form with AI"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Basic Opportunity Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            1. Role & Organization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Opportunity Title *
              </label>
              <input
                id="form-opp-title"
                type="text"
                required
                placeholder="e.g. Community Meal Prep & Hot Kitchen Crew"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization / Non-Profit Name *
              </label>
              <input
                id="form-opp-org"
                type="text"
                required
                placeholder="e.g. The Bowery Mission"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cause / Category (Dropdown) *
              </label>
              <select
                id="form-opp-cause"
                value={cause}
                onChange={(e) => setCause(e.target.value as CauseType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                {CAUSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Posting Source / Origin
              </label>
              <select
                id="form-opp-source"
                value={source}
                onChange={(e) => setSource(e.target.value as SourcePlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization Website
              </label>
              <input
                id="form-opp-website"
                type="url"
                placeholder="https://..."
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Full Description & Mission *
            </label>
            <textarea
              id="form-opp-description"
              required
              rows={3}
              placeholder="Explain the background, why this volunteer effort matters, and the positive impact on New York City..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
            />
          </div>
        </div>

        {/* Section 2: Location, Transit & Borough */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            2. Location & Subway Accessibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                NYC Borough *
              </label>
              <select
                id="form-opp-borough"
                value={borough}
                onChange={(e) => setBorough(e.target.value as Borough)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                {BOROUGHS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Neighborhood / District
              </label>
              <input
                id="form-opp-neighborhood"
                type="text"
                placeholder="e.g. Lower East Side, Astoria, Mott Haven"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Street Address
              </label>
              <input
                id="form-opp-address"
                type="text"
                placeholder="e.g. 227 Bowery, New York, NY 10002"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>

          {/* Subway Lines */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Subway / Transit Lines (e.g. 6 Train, F/G Train)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add subway line e.g. '6 Train (Spring St)'"
                value={subwayInput}
                onChange={(e) => setSubwayInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubway(); } }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
              <button
                type="button"
                onClick={addSubway}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
              >
                Add Line
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subwayLines.map((line, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#F8F9FA] text-gray-800 border border-gray-200 font-bold">
                  <Train className="w-3 h-3 text-[#54A0FF]" />
                  <span>{line}</span>
                  <button type="button" onClick={() => removeSubway(idx)} className="text-gray-400 hover:text-gray-700 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Schedule, Time & Commitment */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            3. Schedule, Dates & Commitment Duration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Duration of Commitment *
              </label>
              <select
                id="form-opp-commitment"
                value={commitmentType}
                onChange={(e) => setCommitmentType(e.target.value as CommitmentType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                {COMMITMENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dates / Recurrence *
              </label>
              <input
                id="form-opp-dates"
                type="text"
                placeholder="e.g. Saturdays (Weekly) or Aug 25, 2026"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Time Duration & Shift Hours *
              </label>
              <input
                id="form-opp-shift"
                type="text"
                placeholder="e.g. 3 Hours (9:00 AM - 12:00 PM)"
                value={shiftSchedule}
                onChange={(e) => setShiftSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: What You Will Be Doing & Skills */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            4. What Volunteers Will Be Doing & Skills Required
          </h3>

          {/* Tasks list */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              What You Will Be Doing (Action Items) *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a specific task (e.g. 'Sort fresh produce into 10lb family boxes')"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
              <button
                type="button"
                onClick={addTask}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
              >
                Add Task
              </button>
            </div>
            <ul className="space-y-1.5">
              {whatYouWillDo.map((task, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F8F9FA] text-xs text-gray-800 font-medium">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10AC84]" />
                    <span>{task}</span>
                  </span>
                  <button type="button" onClick={() => removeTask(idx)} className="text-gray-400 hover:text-[#FF5E57]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Skills Required / Prerequisites
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add skill (e.g. 'Conversational Spanish' or 'No prior experience needed')"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
              >
                Add Skill
              </button>
            </div>
            <ul className="space-y-1.5">
              {skillsRequired.map((skill, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F8F9FA] text-xs text-gray-800 font-medium">
                  <span>• {skill}</span>
                  <button type="button" onClick={() => removeSkill(idx)} className="text-gray-400 hover:text-[#FF5E57]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Age & Attire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Age Requirement (Optional / Guidelines)
              </label>
              <input
                id="form-opp-age"
                type="text"
                placeholder="e.g. 18+, 16+ with waiver, or All Ages"
                value={ageRequirement}
                onChange={(e) => setAgeRequirement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Attire & Dress Code Guidelines *
              </label>
              <input
                id="form-opp-attire"
                type="text"
                placeholder="e.g. Closed-toe shoes mandatory, wear warm layers for outdoor distribution"
                value={attire}
                onChange={(e) => setAttire(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Health & Allergy Constraints */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            5. Health & Allergy Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Allergy Warnings
              </label>
              <input
                id="form-opp-allergies"
                type="text"
                placeholder="e.g. Peanut handling, Pet dander, Latex, None reported"
                value={allergyWarnings}
                onChange={(e) => setAllergyWarnings(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Physical Constraints / Lifting
              </label>
              <input
                id="form-opp-physical"
                type="text"
                placeholder="e.g. Standing 3 hours, Lifting 25+ lbs, Sedentary/Desk"
                value={physicalDemands}
                onChange={(e) => setPhysicalDemands(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Environment
              </label>
              <select
                id="form-opp-environment"
                value={indoorOutdoor}
                onChange={(e) => setIndoorOutdoor(e.target.value as 'Indoor' | 'Outdoor' | 'Hybrid')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                <option value="Indoor">Indoor Facility</option>
                <option value="Outdoor">Outdoor / Park / Street</option>
                <option value="Hybrid">Hybrid (Indoor & Outdoor)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="form-opp-wheelchair"
                type="checkbox"
                checked={wheelchairAccessible}
                onChange={(e) => setWheelchairAccessible(e.target.checked)}
                className="rounded text-[#FF5E57] focus:ring-[#FF5E57] w-4 h-4"
              />
              <label htmlFor="form-opp-wheelchair" className="text-xs font-bold text-gray-700 cursor-pointer">
                Wheelchair Accessible Facility / Role
              </label>
            </div>
          </div>
        </div>

        {/* Section 6: Contact & Application Mode */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            6. Ways to Contact & Application Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Coordinator / Contact Name
              </label>
              <input
                id="form-opp-contact-name"
                type="text"
                placeholder="e.g. Elena Rostova (Volunteer Mgr)"
                value={orgContactPerson}
                onChange={(e) => setOrgContactPerson(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                id="form-opp-contact-email"
                type="email"
                required
                placeholder="volunteer@cityharvest.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                id="form-opp-contact-phone"
                type="tel"
                placeholder="(212) 555-0199"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Application Method *
              </label>
              <select
                id="form-opp-app-mode"
                value={applicationMode}
                onChange={(e) => setApplicationMode(e.target.value as 'direct' | 'external')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
              >
                <option value="direct">Direct in-app application form</option>
                <option value="external">Redirect to external website (Eventbrite/Idealist)</option>
              </select>
            </div>

            {applicationMode === 'external' ? (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  External Application URL (Eventbrite / Idealist / Org link) *
                </label>
                <input
                  id="form-opp-external-url"
                  type="url"
                  required={applicationMode === 'external'}
                  placeholder="https://www.eventbrite.com/e/..."
                  value={externalApplyUrl}
                  onChange={(e) => setExternalApplyUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Total Volunteer Capacity (Spots)
                </label>
                <input
                  id="form-opp-spots"
                  type="number"
                  min={1}
                  value={spotsTotal}
                  onChange={(e) => setSpotsTotal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="form-opp-urgent"
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="rounded text-[#FF5E57] focus:ring-[#FF5E57] w-4 h-4"
            />
            <label htmlFor="form-opp-urgent" className="text-xs font-bold text-[#FF5E57] cursor-pointer">
              Mark as "Urgent Community Need" (Highlights listing in search results)
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-publish-opportunity"
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-[#10AC84] hover:brightness-105 shadow-md shadow-[#10AC8433] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Publishing to NYC Database..." : "Publish Volunteer Opportunity"}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

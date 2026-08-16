import React, { useState, useEffect } from 'react';
import { User, Sparkles, MapPin, Heart, Clock, Check, ChevronDown, ChevronUp, Save, Edit3 } from 'lucide-react';
import { Borough, CauseType } from '../types';

export interface UserVolunteerProfile {
  name: string;
  email: string;
  boroughs: Borough[];
  causes: CauseType[];
  availableDays: string[];
  maxHoursPerWeek: number;
  skillsOrInterests: string;
  isConfigured: boolean;
}

interface UserProfileCardProps {
  profile: UserVolunteerProfile;
  onSaveProfile: (profile: UserVolunteerProfile) => void;
  onQuickAIMatch: () => void;
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  onSaveProfile,
  onQuickAIMatch
}) => {
  const [isEditing, setIsEditing] = useState(!profile.isConfigured);
  const [formData, setFormData] = useState<UserVolunteerProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const toggleBorough = (b: Borough) => {
    const exists = formData.boroughs.includes(b);
    const updated = exists 
      ? formData.boroughs.filter(item => item !== b)
      : [...formData.boroughs, b];
    setFormData({ ...formData, boroughs: updated });
  };

  const toggleCause = (c: CauseType) => {
    const exists = formData.causes.includes(c);
    const updated = exists 
      ? formData.causes.filter(item => item !== c)
      : [...formData.causes, c];
    setFormData({ ...formData, causes: updated });
  };

  const toggleDay = (d: string) => {
    const exists = formData.availableDays.includes(d);
    const updated = exists 
      ? formData.availableDays.filter(item => item !== d)
      : [...formData.availableDays, d];
    setFormData({ ...formData, availableDays: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...formData, isConfigured: true };
    onSaveProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9F43]/10 text-[#FF9F43] flex items-center justify-center font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">My Volunteer Profile & AI Match Preferences</h3>
              {profile.isConfigured && !isEditing && (
                <span className="bg-[#E8F5E9] text-[#10AC84] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                  Saved & Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Set your preferences once. Our platform automatically uses these to power AI Matchmaker and smart role recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile.isConfigured && !isEditing ? (
            <>
              <button
                onClick={onQuickAIMatch}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF9F43] hover:brightness-105 shadow-sm shadow-[#FF9F4333] transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Smart Match</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Preferences</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isEditing ? 'Collapse' : 'Expand'}</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl px-4 py-3 text-xs text-[#1B5E20] font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#2E7D32]" />
          <span>✨ Profile and preferences saved successfully! AI Smart Match is now personalized for you.</span>
        </div>
      )}

      {/* Summary View when not editing */}
      {!isEditing && profile.isConfigured && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Preferred Boroughs</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.boroughs.length > 0 ? profile.boroughs.map(b => (
                <span key={b} className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-gray-800 font-bold text-[11px]">
                  {b}
                </span>
              )) : <span className="text-gray-400">None selected</span>}
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Preferred Causes ({profile.causes.length})</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.causes.slice(0, 3).map(c => (
                <span key={c} className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-gray-800 font-bold text-[11px]">
                  {c}
                </span>
              ))}
              {profile.causes.length > 3 && (
                <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500 font-bold text-[11px]">
                  +{profile.causes.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Availability & Skills</span>
            <p className="font-bold text-gray-900 mt-1">
              {profile.availableDays.length > 0 ? profile.availableDays.join(', ') : 'Flexible schedule'} ({profile.maxHoursPerWeek} hrs/wk)
            </p>
            {profile.skillsOrInterests && (
              <p className="text-gray-600 truncate">Skills: {profile.skillsOrInterests}</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Rivera"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9F43]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email for Notifications <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                placeholder="e.g. jordan@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9F43]"
              />
            </div>
          </div>

          {/* Boroughs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Preferred NYC Boroughs
            </label>
            <div className="flex flex-wrap gap-2">
              {BOROUGHS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBorough(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    formData.boroughs.includes(b)
                      ? 'bg-[#FF5E57] text-white border-[#FF5E57]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {formData.boroughs.includes(b) && <Check className="w-3.5 h-3.5" />}
                  <span>{b}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Causes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Preferred Volunteer Causes
            </label>
            <div className="flex flex-wrap gap-2">
              {CAUSES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCause(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    formData.causes.includes(c)
                      ? 'bg-[#54A0FF] text-white border-[#54A0FF]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {formData.causes.includes(c) && <Check className="w-3.5 h-3.5" />}
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Available Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      formData.availableDays.includes(d)
                        ? 'bg-[#10AC84] text-white border-[#10AC84]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Max Commitment (Hours / Week)
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={formData.maxHoursPerWeek}
                onChange={e => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9F43]"
              />
            </div>
          </div>

          {/* Skills / Interests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Skills, Languages, or Special Interests
            </label>
            <input
              type="text"
              placeholder="e.g. Bilingual Spanish, Heavy Lifting, Event Planning, Graphic Design"
              value={formData.skillsOrInterests}
              onChange={e => setFormData({ ...formData, skillsOrInterests: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9F43]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {profile.isConfigured && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF9F43] hover:brightness-105 shadow-md shadow-[#FF9F4333] transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Preferences</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

import React from 'react';
import { Search, Filter, X, ShieldCheck, Accessibility, Compass, Building2, MapPin, CalendarOff, AlertTriangle } from 'lucide-react';
import { Borough, CauseType, CommitmentType, SourcePlatform } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange?: (q: string) => void;
  setSearchQuery?: (q: string) => void;
  selectedBorough: string;
  onBoroughChange?: (b: string) => void;
  setSelectedBorough?: (b: string) => void;
  selectedCause: string;
  onCauseChange?: (c: string) => void;
  setSelectedCause?: (c: string) => void;
  selectedCommitment: string;
  onCommitmentChange?: (c: string) => void;
  setSelectedCommitment?: (c: string) => void;
  selectedSource: string;
  onSourceChange?: (s: string) => void;
  setSelectedSource?: (s: string) => void;
  wheelchairOnly: boolean;
  onWheelchairOnlyChange?: (val: boolean) => void;
  setWheelchairOnly?: (val: boolean) => void;
  indoorOutdoor?: string;
  setIndoorOutdoor?: (val: string) => void;
  hideConflicts?: boolean;
  onHideConflictsChange?: (val: boolean) => void;
  setHideConflicts?: (val: boolean) => void;
  conflictingCount?: number;
  onResetFilters: () => void;
  totalCount?: number;
  filteredCount?: number;
  totalFilteredCount?: number;
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

const COMMITMENTS: CommitmentType[] = [
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

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  setSearchQuery,
  selectedBorough,
  onBoroughChange,
  setSelectedBorough,
  selectedCause,
  onCauseChange,
  setSelectedCause,
  selectedCommitment,
  onCommitmentChange,
  setSelectedCommitment,
  selectedSource,
  onSourceChange,
  setSelectedSource,
  wheelchairOnly,
  onWheelchairOnlyChange,
  setWheelchairOnly,
  indoorOutdoor = 'All',
  setIndoorOutdoor,
  hideConflicts = false,
  onHideConflictsChange,
  setHideConflicts,
  conflictingCount = 0,
  onResetFilters,
  totalCount,
  filteredCount,
  totalFilteredCount
}) => {
  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    if (setSearchQuery) setSearchQuery(val);
  };

  const handleBoroughChange = (val: string) => {
    if (onBoroughChange) onBoroughChange(val);
    if (setSelectedBorough) setSelectedBorough(val);
  };

  const handleCauseChange = (val: string) => {
    if (onCauseChange) onCauseChange(val);
    if (setSelectedCause) setSelectedCause(val);
  };

  const handleCommitmentChange = (val: string) => {
    if (onCommitmentChange) onCommitmentChange(val);
    if (setSelectedCommitment) setSelectedCommitment(val);
  };

  const handleSourceChange = (val: string) => {
    if (onSourceChange) onSourceChange(val);
    if (setSelectedSource) setSelectedSource(val);
  };

  const handleWheelchairToggle = () => {
    const next = !wheelchairOnly;
    if (onWheelchairOnlyChange) onWheelchairOnlyChange(next);
    if (setWheelchairOnly) setWheelchairOnly(next);
  };

  const effectiveFilteredCount = filteredCount ?? totalFilteredCount ?? 0;

  const handleConflictToggle = () => {
    const next = !hideConflicts;
    if (onHideConflictsChange) onHideConflictsChange(next);
    if (setHideConflicts) setHideConflicts(next);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBorough !== 'All' ||
    selectedCause !== 'All' ||
    selectedCommitment !== 'All' ||
    selectedSource !== 'All' ||
    wheelchairOnly ||
    hideConflicts ||
    indoorOutdoor !== 'All';

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Top row: Search Bar & Quick Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search causes, organizations, skills, or neighborhoods (e.g. Harlem, Gowanus)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[#F1F3F5] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E57] border-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            id="btn-reset-filters"
            onClick={onResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#FF5E57] hover:bg-[#FFF0F0] border border-[#FFDADA] rounded-full transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Borough Filter Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap pl-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          Borough:
        </span>
        <button
          onClick={() => handleBoroughChange('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedBorough === 'All'
              ? 'bg-[#FF5E57] text-white shadow-sm shadow-[#FF5E5733]'
              : 'bg-[#F0F2F5] text-gray-700 hover:bg-gray-200'
          }`}
        >
          All 5 Boroughs
        </button>
        {BOROUGHS.map((b) => {
          const isSelected = selectedBorough === b;
          return (
            <button
              key={b}
              onClick={() => handleBoroughChange(b)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#10AC84] text-white shadow-sm shadow-[#10AC8433]'
                  : 'bg-[#F0F2F5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>

      {/* Dropdown Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
        {/* Cause Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Primary Cause
          </label>
          <select
            id="select-cause"
            value={selectedCause}
            onChange={(e) => handleCauseChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
          >
            <option value="All">All Causes</option>
            {CAUSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Commitment Duration */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Commitment Schedule
          </label>
          <select
            id="select-commitment"
            value={selectedCommitment}
            onChange={(e) => handleCommitmentChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
          >
            <option value="All">Any Duration / Schedule</option>
            {COMMITMENTS.map((com) => (
              <option key={com} value={com}>{com}</option>
            ))}
          </select>
        </div>

        {/* Source Platform */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Source Platform
          </label>
          <select
            id="select-source"
            value={selectedSource}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
          >
            <option value="All">All Sources (Idealist, Eventbrite, Point)</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Indoor / Outdoor */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Environment
          </label>
          <select
            id="select-environment"
            value={indoorOutdoor}
            onChange={(e) => setIndoorOutdoor && setIndoorOutdoor(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5E57]"
          >
            <option value="All">Indoor & Outdoor</option>
            <option value="Indoor">Indoor Only</option>
            <option value="Outdoor">Outdoor Only</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Feature Badges & Quick Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="toggle-wheelchair"
            onClick={handleWheelchairToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              wheelchairOnly
                ? 'bg-[#E1F5FE] border-[#90CAF9] text-[#039BE5] shadow-xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-[#F0F2F5]'
            }`}
          >
            <Accessibility className={`w-3.5 h-3.5 ${wheelchairOnly ? 'text-[#039BE5]' : 'text-gray-400'}`} />
            <span>Wheelchair Accessible</span>
          </button>

          {typeof conflictingCount === 'number' && conflictingCount > 0 && (
            <button
              id="toggle-hide-conflicts"
              onClick={handleConflictToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                hideConflicts
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-gray-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <CalendarOff className={`w-3.5 h-3.5 ${hideConflicts ? 'text-amber-700' : 'text-amber-500'}`} />
              <span>Hide Schedule Conflicts ({conflictingCount})</span>
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-gray-500">
          Showing <span className="font-extrabold text-gray-900">{effectiveFilteredCount}</span> NYC opportunities
        </div>
      </div>
    </div>
  );
};

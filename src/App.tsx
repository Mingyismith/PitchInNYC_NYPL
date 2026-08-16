import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar, 
  TabType 
} from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ApplyModal } from './components/ApplyModal';
import { PostOpportunityView } from './components/PostOpportunityView';
import { AIMatchmakerView } from './components/AIMatchmaker';
import { ApplicationTrackerView } from './components/ApplicationTracker';
import { NYCMapVisualizer } from './components/NYCMapVisualizer';
import { UserProfileCard, UserVolunteerProfile } from './components/UserProfileCard';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { OrganizationProfileCard } from './components/OrganizationProfileCard';
import { AccountAuthModal } from './components/AccountAuthModal';
import { VolunteerOpportunity, Application, CauseType, CommitmentType, Borough, SourcePlatform, ScheduleConflictInfo, UserProfile, OrganizationAccount, OrgMember } from './types';
import { checkOpportunityConflictWithConfirmedApps } from './utils/conflictUtils';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  ShieldCheck, 
  Globe, 
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('find');
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({ totalOpportunities: 0, totalApplications: 0, boroughsRepresented: 5, causesCovered: 10 });
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationAccount[]>([]);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'vol-jordan',
      name: 'Jordan Rivera',
      email: 'jordan.rivera@example.com',
      phone: '(917) 555-0192',
      role: 'volunteer',
      borough: 'Manhattan'
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orgViewMode, setOrgViewMode] = useState<'dashboard' | 'form'>('dashboard');

  const handleAddMember = async (orgId: string, memberData: { name: string; email: string; role: 'Admin' | 'Staff'; title: string }) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        const updatedOrg = await res.json();
        setOrganizations(prev => prev.map(o => o.id === orgId ? updatedOrg : o));
      }
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const handleRemoveMember = async (orgId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedOrg = await res.json();
        setOrganizations(prev => prev.map(o => o.id === orgId ? updatedOrg : o));
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleUpdateOrg = (updatedOrg: OrganizationAccount) => {
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  };

  const handleCreateOrganization = async (orgData: any) => {
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });
      if (res.ok) {
        const newOrg = await res.json();
        setOrganizations(prev => [newOrg, ...prev]);
        const newAdminUser: UserProfile = {
          id: `org-user-${newOrg.id}`,
          name: orgData.adminName,
          email: orgData.adminEmail,
          phone: '(212) 555-0199',
          role: 'organization',
          organizationId: newOrg.id,
          orgMemberId: newOrg.members[0].id,
          borough: newOrg.borough
        };
        setCurrentUser(newAdminUser);
        localStorage.setItem('nyc_volunteer_current_user', JSON.stringify(newAdminUser));
        setActiveTab('post');
        setOrgViewMode('dashboard');
      }
    } catch (err) {
      console.error("Failed to create organization:", err);
    }
  };

  const handleCreateVolunteer = (vData: any) => {
    const newVolUser: UserProfile = {
      id: `vol-${Date.now()}`,
      name: vData.name,
      email: vData.email,
      phone: vData.phone,
      role: 'volunteer',
      borough: vData.borough
    };
    setCurrentUser(newVolUser);
    localStorage.setItem('nyc_volunteer_current_user', JSON.stringify(newVolUser));

    const newProfile: UserVolunteerProfile = {
      ...userProfile,
      name: vData.name,
      email: vData.email,
      boroughs: [vData.borough],
      isConfigured: true
    };
    setUserProfile(newProfile);
    localStorage.setItem('nyc_volunteer_user_profile', JSON.stringify(newProfile));
    setActiveTab('find');
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('nyc_volunteer_current_user', JSON.stringify(user));
    if (user.role === 'organization') {
      setActiveTab('post');
      setOrgViewMode('dashboard');
    } else {
      setActiveTab('find');
      const updatedProfile = {
        ...userProfile,
        name: user.name,
        email: user.email,
        phone: user.phone || userProfile.phone,
        boroughs: user.borough ? [user.borough as any] : userProfile.boroughs,
        isConfigured: true
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('nyc_volunteer_user_profile', JSON.stringify(updatedProfile));
    }
  };

  // User Profile Preferences state (persistent in localStorage)
  const [userProfile, setUserProfile] = useState<UserVolunteerProfile>(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: '',
      email: '',
      boroughs: ['Manhattan', 'Brooklyn'],
      causes: ['Food Security & Hunger', 'Environment & Parks'],
      availableDays: ['Saturday', 'Sunday'],
      maxHoursPerWeek: 4,
      skillsOrInterests: '',
      isConfigured: false
    };
  });

  // Onboarding Welcome Modal state for first visit if not configured
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    try {
      const saved = localStorage.getItem('nyc_volunteer_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !parsed.isConfigured;
      }
    } catch (e) {}
    return true;
  });

  const handleSaveProfile = (newProfile: UserVolunteerProfile) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem('nyc_volunteer_user_profile', JSON.stringify(newProfile));
    } catch (e) {}
    if (currentUser.role === 'volunteer') {
      const updatedUser = { ...currentUser, name: newProfile.name, email: newProfile.email };
      setCurrentUser(updatedUser);
      localStorage.setItem('nyc_volunteer_current_user', JSON.stringify(updatedUser));
    }
    setShowWelcomeModal(false);
  };

  const handleQuickAIMatch = () => {
    setActiveTab('matchmaker');
  };

  const handleExternalApply = async (opp: VolunteerOpportunity) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          applicantName: userProfile.name || 'NYC Volunteer',
          applicantEmail: userProfile.email || 'volunteer@nyc.gov',
          applicantPhone: '',
          experienceNotes: `Registered via ${opp.source} external portal`,
          emergencyContact: 'Provided on file',
          shiftSelected: opp.shiftSchedule
        })
      });
      if (res.ok) {
        const newApp = await res.json();
        setApplications(prev => [newApp, ...prev]);
      }
    } catch (e) {
      console.error("Failed to capture external application:", e);
    }
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorough, setSelectedBorough] = useState<string>('All');
  const [selectedCause, setSelectedCause] = useState<string>('All');
  const [selectedCommitment, setSelectedCommitment] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [hideConflicts, setHideConflicts] = useState(false);

  // Modals
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<VolunteerOpportunity | null>(null);
  const [selectedOppForApply, setSelectedOppForApply] = useState<VolunteerOpportunity | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [oppsRes, appsRes, statsRes, orgsRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/applications'),
        fetch('/api/stats'),
        fetch('/api/organizations')
      ]);

      if (oppsRes.ok) {
        const oppsData = await oppsRes.json();
        setOpportunities(oppsData);
      }
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        if (Array.isArray(orgsData)) setOrganizations(orgsData);
      }
    } catch (err) {
      console.error("Failed to load NYC volunteer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute schedule conflict map for all opportunities against user's confirmed applications
  const conflictMap = useMemo(() => {
    const map: Record<string, ScheduleConflictInfo> = {};
    opportunities.forEach(opp => {
      map[opp.id] = checkOpportunityConflictWithConfirmedApps(opp, applications, opportunities, 2.5);
    });
    return map;
  }, [opportunities, applications]);

  const conflictingCount = useMemo(() => {
    return (Object.values(conflictMap) as ScheduleConflictInfo[]).filter(c => c.hasConflict).length;
  }, [conflictMap]);

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Hide conflicts toggle
      if (hideConflicts && conflictMap[opp.id]?.hasConflict) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesOrg = opp.organization.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesBorough = opp.borough.toLowerCase().includes(q);
        const matchesNeighborhood = opp.neighborhood.toLowerCase().includes(q);
        const matchesCause = opp.cause.toLowerCase().includes(q);
        const matchesSubway = opp.subwayLines.some(s => s.toLowerCase().includes(q));
        const matchesTasks = opp.whatYouWillDo.some(t => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesOrg && !matchesDesc && !matchesBorough && !matchesNeighborhood && !matchesCause && !matchesSubway && !matchesTasks) {
          return false;
        }
      }

      // Borough
      if (selectedBorough !== 'All' && opp.borough !== selectedBorough) {
        return false;
      }

      // Cause
      if (selectedCause !== 'All' && opp.cause !== selectedCause) {
        return false;
      }

      // Commitment
      if (selectedCommitment !== 'All' && opp.commitmentType !== selectedCommitment) {
        return false;
      }

      // Source
      if (selectedSource !== 'All' && opp.source !== selectedSource) {
        return false;
      }

      // Wheelchair Only
      if (wheelchairOnly && !opp.constraints.wheelchairAccessible) {
        return false;
      }

      return true;
    });
  }, [opportunities, searchQuery, selectedBorough, selectedCause, selectedCommitment, selectedSource, wheelchairOnly, hideConflicts, conflictMap]);

  // Borough opportunity counts for visual map
  const boroughCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(opp => {
      counts[opp.borough] = (counts[opp.borough] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBorough('All');
    setSelectedCause('All');
    setSelectedCommitment('All');
    setSelectedSource('All');
    setWheelchairOnly(false);
    setHideConflicts(false);
  };

  // Handlers for creating / importing opportunities
  const handleOpportunityCreated = (newOpp: VolunteerOpportunity) => {
    setOpportunities([newOpp, ...opportunities]);
    setActiveTab('find');
    setSelectedOppForDetail(newOpp);
  };

  const handleApplicationSuccess = (newApp: Application) => {
    fetchData();
  };

  const handleConfirmApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allApplications) {
          setApplications(data.allApplications);
        } else {
          fetchData();
        }
      }
    } catch (err) {
      console.error("Failed to confirm shift:", err);
    }
  };

  const handleCancelApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to cancel shift:", err);
    }
  };

  const handleLogHours = async (appId: string, hours: number) => {
    try {
      const res = await fetch(`/api/applications/${appId}/log-hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours })
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications(applications.map(a => a.id === appId ? updated : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#2D3436] flex flex-col font-sans selection:bg-[#FFD32D] selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'post' && currentUser.role === 'organization') {
            setOrgViewMode('dashboard');
          }
        }}
        opportunityCount={opportunities.length}
        applicationCount={applications.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Find Volunteer Roles */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            
            {/* Hero Banner with Vibrant Theme */}
            <div className="bg-[#2D3436] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-gray-800">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10AC84]/20 border border-[#10AC84]/50 text-[#10AC84] text-xs font-extrabold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#10AC84] animate-pulse"></span>
                  NYC Unified Volunteer Platform
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Connect with Impactful Volunteer Opportunities Across New York City.
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                  Centralized discovery platform aggregating volunteer opportunities across NYC non-profits, Idealist.org, Eventbrite, and Point App. We help you discover and compare volunteer roles in one place, then direct you to the original organization's website or platform to verify details and apply.
                </p>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="hero-btn-matchmaker"
                    onClick={() => setActiveTab('matchmaker')}
                    className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#FF9F43] hover:brightness-105 text-white shadow-md shadow-[#FF9F4333] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try AI Matchmaker</span>
                  </button>
                </div>
              </div>

              {/* Background graphic accents */}
              <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-[#FF5E57]/10 blur-3xl pointer-events-none" />
              <div className="absolute right-40 -top-10 w-60 h-60 rounded-full bg-[#54A0FF]/15 blur-3xl pointer-events-none" />
            </div>

            {/* Visual NYC Borough Explorer */}
            <NYCMapVisualizer
              selectedBorough={selectedBorough}
              onSelectBorough={(b) => setSelectedBorough(b)}
              boroughCounts={boroughCounts}
            />

            {/* Filter Bar with Cause Dropdown, Subway, Schedule, Source */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBorough={selectedBorough}
              onBoroughChange={setSelectedBorough}
              selectedCause={selectedCause}
              onCauseChange={setSelectedCause}
              selectedCommitment={selectedCommitment}
              onCommitmentChange={setSelectedCommitment}
              selectedSource={selectedSource}
              onSourceChange={setSelectedSource}
              wheelchairOnly={wheelchairOnly}
              onWheelchairOnlyChange={setWheelchairOnly}
              hideConflicts={hideConflicts}
              onHideConflictsChange={setHideConflicts}
              conflictingCount={conflictingCount}
              totalCount={opportunities.length}
              filteredCount={filteredOpportunities.length}
              onResetFilters={handleResetFilters}
            />

            {/* Opportunities List or Loading */}
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-[#FF5E57] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-500 font-medium">Loading NYC Volunteer Database...</p>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-gray-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">No matching opportunities found</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Try adjusting your search keywords, borough selection, or filters.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#FF5E57] text-white hover:brightness-105 shadow-sm shadow-[#FF5E5733] transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    conflictInfo={conflictMap[opp.id]}
                    onSelect={(selected) => setSelectedOppForDetail(selected)}
                    onDirectApply={(selected) => setSelectedOppForApply(selected)}
                    onExternalApply={handleExternalApply}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: AI Matchmaker */}
        {activeTab === 'matchmaker' && (
          <AIMatchmakerView
            opportunities={opportunities}
            applications={applications}
            onSelectOpportunity={(opp) => setSelectedOppForDetail(opp)}
            onApplyOpportunity={(opp) => setSelectedOppForApply(opp)}
          />
        )}

        {/* Tab: Post Volunteer Opportunity or Org Dashboard */}
        {activeTab === 'post' && (
          currentUser.role === 'organization' ? (
            orgViewMode === 'form' ? (
              <PostOpportunityView
                onOpportunityCreated={(newOpp) => {
                  handleOpportunityCreated(newOpp);
                  setOrgViewMode('dashboard');
                }}
                onCancel={() => setOrgViewMode('dashboard')}
              />
            ) : (
              <OrganizationDashboard
                organization={organizations.find(o => o.id === currentUser.organizationId) || organizations[0]}
                opportunities={opportunities}
                applications={applications}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onGoToPostOpportunity={() => setOrgViewMode('form')}
                onSelectOpportunity={(opp) => setSelectedOppForDetail(opp)}
              />
            )
          ) : (
            <div className="max-w-2xl mx-auto py-12 px-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FF5E57]/10 text-[#FF5E57] mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-950">Verified Non-Profit Organization Required</h2>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                    The ability to post a new opportunity on PitchInNYC is restricted to verified non-profit organizations and their authorized staff members. To maintain trusted, secure community service listings across the 5 boroughs, please switch to a verified organization account or register your organization.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#10AC84] text-white font-bold text-xs hover:brightness-105 shadow-md shadow-[#10AC8433] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Switch to Org Account / Register Org</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
                  >
                    Return to Find Roles
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Tab: My Applications & Hours */}
        {activeTab === 'my-hours' && (
          <ApplicationTrackerView
            applications={applications}
            opportunities={opportunities}
            onSelectOpportunity={(opp) => setSelectedOppForDetail(opp)}
            onLogHours={handleLogHours}
            onConfirmApplication={handleConfirmApplication}
            onCancelApplication={handleCancelApplication}
          />
        )}

        {/* Tab: User Profile or Org Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto py-8 px-4">
            {currentUser.role === 'organization' ? (
              <OrganizationProfileCard
                organization={organizations.find(o => o.id === currentUser.organizationId) || organizations[0]}
                onUpdateOrg={handleUpdateOrg}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
              />
            ) : (
              <UserProfileCard
                profile={userProfile}
                onSaveProfile={handleSaveProfile}
                onQuickAIMatch={handleQuickAIMatch}
              />
            )}
          </div>
        )}

      </main>

      {/* Account Switcher & Dual Path Registration Modal */}
      <AccountAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        organizations={organizations}
        onSwitchUser={handleSwitchUser}
        onCreateOrganization={handleCreateOrganization}
        onCreateVolunteer={handleCreateVolunteer}
      />

      {/* First-visit Onboarding Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5E57]/10 text-[#FF5E57] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Welcome to PitchInNYC!</h3>
                <p className="text-xs text-gray-500 font-medium">Set your preferences once for personalized AI matches.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Would you like to setup your volunteer profile preferences (preferred NYC boroughs, causes, and availability) now? You can save them to power our AI Matchmaker automatically, or skip and jump straight into finding roles.
            </p>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200 text-xs text-gray-700 space-y-1.5">
              <div className="font-bold text-gray-900">✨ What you get:</div>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Automated AI match scoring across all 5 NYC boroughs</li>
                <li>Instant role recommendations tailored to your schedule</li>
                <li>Edit or update your preferences anytime via the <b>My Profile</b> tab</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Skip for Now
              </button>
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  setActiveTab('profile');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E57] hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center gap-1.5"
              >
                <span>Configure My Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOppForDetail && (
        <OpportunityDetailModal
          opportunity={selectedOppForDetail}
          applications={applications}
          opportunities={opportunities}
          conflictInfo={conflictMap[selectedOppForDetail.id]}
          onClose={() => setSelectedOppForDetail(null)}
          onApply={(opp) => {
            setSelectedOppForDetail(null);
            setSelectedOppForApply(opp);
          }}
        />
      )}

      {/* Apply Modal */}
      {selectedOppForApply && (
        <ApplyModal
          opportunity={selectedOppForApply}
          applications={applications}
          opportunities={opportunities}
          currentUser={currentUser}
          userProfile={userProfile}
          onClose={() => setSelectedOppForApply(null)}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 py-6 px-4 sm:px-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-gray-900">PitchInNYC Opportunity Hub</span>
            <span>•</span>
            <span>Covering Manhattan, Brooklyn, Queens, Bronx & Staten Island</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 font-medium">
            <span>Aggregating: Point App, Eventbrite, Idealist.org & Direct Non-Profits</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

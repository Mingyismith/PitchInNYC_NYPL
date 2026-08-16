import React, { useState } from 'react';
import { User, Building2, ShieldCheck, X, Plus, Check, AlertCircle, ArrowRight, UserPlus, Lock, Zap } from 'lucide-react';
import { UserProfile, OrganizationAccount, CauseType, Borough } from '../types';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  organizations: OrganizationAccount[];
  onSwitchUser: (user: UserProfile) => void;
  onCreateOrganization: (orgData: { orgName: string; ein: string; website: string; mission: string; borough: Borough; contactEmail: string; adminName: string; adminEmail: string }) => void;
  onCreateVolunteer: (volunteerData: { name: string; email: string; phone: string; interests: CauseType[]; borough: Borough }) => void;
}

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  organizations,
  onSwitchUser,
  onCreateOrganization,
  onCreateVolunteer
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'path-volunteer' | 'path-org'>('session');

  // New Volunteer form state
  const [vName, setVName] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vBorough, setVBorough] = useState<Borough>('Manhattan');

  // New Organization form state
  const [orgName, setOrgName] = useState('');
  const [ein, setEin] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgMission, setOrgMission] = useState('');
  const [orgBorough, setOrgBorough] = useState<Borough>('Manhattan');
  const [orgEmail, setOrgEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  if (!isOpen) return null;

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vEmail) return;
    onCreateVolunteer({
      name: vName,
      email: vEmail,
      phone: vPhone || '(212) 555-0199',
      interests: ['Food Security & Hunger', 'Environment & Parks'],
      borough: vBorough
    });
    onClose();
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !ein || !adminName || !adminEmail) return;
    onCreateOrganization({
      orgName,
      ein,
      website: orgWebsite || 'https://www.nyc-nonprofit.org',
      mission: orgMission || 'Dedicated to community service and volunteer empowerment across New York City.',
      borough: orgBorough,
      contactEmail: orgEmail || adminEmail,
      adminName,
      adminEmail
    });
    onClose();
  };

  // Demo accounts for instant switching
  const demoProfiles: UserProfile[] = [
    {
      id: 'vol-jordan',
      name: 'Jordan Rivera',
      email: 'jordan.rivera@example.com',
      phone: '(917) 555-0192',
      role: 'volunteer',
      borough: 'Manhattan'
    },
    {
      id: 'sarah-jenkins',
      name: 'Sarah Jenkins',
      email: 'sjenkins@cityharvest.org',
      phone: '(212) 463-9269',
      role: 'organization',
      organizationId: 'city-harvest',
      orgMemberId: 'm1',
      borough: 'Manhattan'
    },
    {
      id: 'marcus-brody',
      name: 'Marcus Brody',
      email: 'mbrody@foodbanknyc.org',
      phone: '(212) 566-7855',
      role: 'organization',
      organizationId: 'food-bank-nyc',
      orgMemberId: 'm-fb1',
      borough: 'Manhattan'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#FF5E57] bg-[#FF5E5715] px-3 py-1 rounded-full">
              PitchInNYC Secure Session
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Account & Profile Manager
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your verified user session or instantly switch between demo roles.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode selector tabs */}
        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('session')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'session' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            My Account & Demo Switcher
          </button>
          <button
            onClick={() => setActiveTab('path-volunteer')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'path-volunteer' ? 'bg-[#FF5E57] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            New Volunteer Account
          </button>
          <button
            onClick={() => setActiveTab('path-org')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'path-org' ? 'bg-[#10AC84] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Register Org Account
          </button>
        </div>

        {/* Tab 1: Current Session Info & Instant Demo Switcher */}
        {activeTab === 'session' && (
          <div className="space-y-5">
            <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Active Verified Session</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Connected & Secured
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white ${currentUser.role === 'organization' ? 'bg-[#10AC84]' : 'bg-[#FF5E57]'}`}>
                  {currentUser.role === 'organization' ? <Building2 className="w-7 h-7" /> : currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{currentUser.name}</h4>
                  <p className="text-xs text-gray-600">{currentUser.email} • {currentUser.phone || '(212) 555-0199'}</p>
                  <p className="text-xs font-semibold mt-1 capitalize text-gray-700">
                    Role: <span className={currentUser.role === 'organization' ? 'text-[#10AC84]' : 'text-[#FF5E57]'}>
                      {currentUser.role === 'organization' ? '🏢 Verified Non-Profit Organization Admin' : '👤 Individual Community Volunteer'}
                    </span>
                  </p>
                </div>
              </div>

              {currentUser.role === 'organization' && currentUser.organizationId && (
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
                  <span className="font-bold text-gray-400 uppercase text-[9px]">Linked Organization</span>
                  <p className="font-bold text-gray-900">
                    {organizations.find(o => o.id === currentUser.organizationId)?.orgName || 'Verified Organization'}
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    EIN: {organizations.find(o => o.id === currentUser.organizationId)?.ein || 'Verified'} • Access strictly scoped to organization staff & postings.
                  </p>
                </div>
              )}
            </div>

            {/* Instant Demo Switcher */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-amber-900 uppercase tracking-wide">Instant Demo Role Switcher</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium">Click to switch instantly</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoProfiles.map((dp) => {
                  const isCurrent = currentUser.id === dp.id || currentUser.email === dp.email;
                  return (
                    <button
                      key={dp.id}
                      onClick={() => {
                        onSwitchUser(dp);
                        onClose();
                      }}
                      disabled={isCurrent}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-white border-green-300 ring-2 ring-green-400/30 cursor-default' 
                          : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-xs cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${dp.role === 'organization' ? 'bg-[#10AC84]/15 text-[#10AC84]' : 'bg-[#FF5E57]/15 text-[#FF5E57]'}`}>
                            {dp.role === 'organization' ? 'Org Admin' : 'Volunteer'}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-green-600 font-bold" />}
                        </div>
                        <p className="font-bold text-xs text-gray-900 truncate">{dp.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {dp.role === 'organization' ? (dp.organizationId === 'city-harvest' ? 'City Harvest' : 'Food Bank NYC') : 'Volunteer Search'}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <span>{isCurrent ? 'Active Now' : 'Switch Mode'}</span>
                        {!isCurrent && <ArrowRight className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">Switching to Jordan Rivera immediately returns you to the Volunteer Search view.</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Individual Volunteer Registration */}
        {activeTab === 'path-volunteer' && (
          <form onSubmit={handleVolunteerSubmit} className="space-y-4">
            <div className="bg-[#FFF8E7] border border-[#FFE082] rounded-2xl p-3.5 text-xs text-[#92400E] flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Individual Volunteer Profile.</strong> Create your personal volunteer account to search 5-borough opportunities, apply with conflict protection, and track community service hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={vName}
                  onChange={e => setVName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF5E57]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={vEmail}
                  onChange={e => setVEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF5E57]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={vPhone}
                  onChange={e => setVPhone(e.target.value)}
                  placeholder="(917) 555-0144"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF5E57]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary NYC Borough</label>
                <select 
                  value={vBorough}
                  onChange={e => setVBorough(e.target.value as Borough)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF5E57] bg-white"
                >
                  <option value="Manhattan">Manhattan</option>
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Queens">Queens</option>
                  <option value="Bronx">Bronx</option>
                  <option value="Staten Island">Staten Island</option>
                  <option value="Remote / Citywide">Remote / Citywide</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF5E57] text-white font-bold text-xs hover:brightness-105 shadow-md shadow-[#FF5E5733] transition-all flex items-center justify-center gap-2"
              >
                <span>Create Volunteer Profile & Start Searching</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Organization Account & Member Creation */}
        {activeTab === 'path-org' && (
          <form onSubmit={handleOrgSubmit} className="space-y-4">
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-3.5 text-xs text-[#1B5E20] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Verified Non-Profit Organization & Member Accounts.</strong> Establish your organization, verify your 501(c)(3) EIN against the New York charities registry, and create authorized member accounts before posting roles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Organization Name *</label>
                <input 
                  type="text" 
                  required
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Brooklyn Mutual Aid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">IRS EIN / 501(c)(3) Number *</label>
                <input 
                  type="text" 
                  required
                  value={ein}
                  onChange={e => setEin(e.target.value)}
                  placeholder="13-9876543"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin / Coordinator Name *</label>
                <input 
                  type="text" 
                  required
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="e.g. Taylor Swift"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Email *</label>
                <input 
                  type="email" 
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="taylor@brooklynmutual.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Organization Website</label>
                <input 
                  type="text" 
                  value={orgWebsite}
                  onChange={e => setOrgWebsite(e.target.value)}
                  placeholder="https://www.brooklynmutual.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Borough</label>
                <select 
                  value={orgBorough}
                  onChange={e => setOrgBorough(e.target.value as Borough)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84] bg-white"
                >
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Manhattan">Manhattan</option>
                  <option value="Queens">Queens</option>
                  <option value="Bronx">Bronx</option>
                  <option value="Staten Island">Staten Island</option>
                  <option value="Remote / Citywide">Remote / Citywide</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs">Mission & Non-Profit Summary</label>
              <textarea 
                rows={2}
                value={orgMission}
                onChange={e => setOrgMission(e.target.value)}
                placeholder="Briefly describe your non-profit's mission in NYC..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84] text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#10AC84] text-white font-bold text-xs hover:brightness-105 shadow-md shadow-[#10AC8433] transition-all flex items-center justify-center gap-2"
              >
                <span>Verify Non-Profit & Create Account</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

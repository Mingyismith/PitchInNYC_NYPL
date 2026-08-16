import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  UserPlus, 
  Trash2, 
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { OrganizationAccount, OrgMember, VolunteerOpportunity, Application } from '../types';

interface OrganizationDashboardProps {
  organization: OrganizationAccount;
  opportunities: VolunteerOpportunity[];
  applications: Application[];
  onAddMember: (orgId: string, member: { name: string; email: string; role: 'Admin' | 'Staff'; title: string }) => void;
  onRemoveMember: (orgId: string, memberId: string) => void;
  onGoToPostOpportunity: () => void;
  onSelectOpportunity: (opp: VolunteerOpportunity) => void;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  organization,
  opportunities,
  applications,
  onAddMember,
  onRemoveMember,
  onGoToPostOpportunity,
  onSelectOpportunity
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'opportunities' | 'volunteers' | 'members'>('opportunities');
  
  // New member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Staff'>('Staff');
  const [newMemberTitle, setNewMemberTitle] = useState('Volunteer Coordinator');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Filter opportunities belonging to this organization
  const orgOpportunities = opportunities.filter(o => 
    o.organization.toLowerCase() === organization.orgName.toLowerCase() ||
    o.contactEmail.toLowerCase() === organization.contactEmail.toLowerCase()
  );

  // Filter applications for these opportunities
  const orgOpportunityIds = new Set(orgOpportunities.map(o => o.id));
  const orgApplications = applications.filter(a => orgOpportunityIds.has(a.opportunityId));

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    onAddMember(organization.id, {
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      title: newMemberTitle
    });
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMemberModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      
      {/* Organization Header & Verification Card */}
      <div className="bg-gradient-to-r from-[#10AC84] to-[#1DD1A1] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {organization.verificationBadge}
              </span>
              <span className="text-xs font-bold bg-black/10 px-3 py-1 rounded-full">
                EIN: {organization.ein}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {organization.orgName}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
              {organization.mission}
            </p>
          </div>

          <button
            onClick={onGoToPostOpportunity}
            className="px-6 py-3 rounded-2xl bg-white text-[#10AC84] font-bold text-xs sm:text-sm hover:bg-gray-50 transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Opportunity</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-xs">
          <div>
            <span className="text-white/75 font-bold uppercase text-[10px]">Active Roles Posted</span>
            <p className="text-lg font-black mt-0.5">{orgOpportunities.length}</p>
          </div>
          <div>
            <span className="text-white/75 font-bold uppercase text-[10px]">Total Volunteers Registered</span>
            <p className="text-lg font-black mt-0.5">{orgApplications.length}</p>
          </div>
          <div>
            <span className="text-white/75 font-bold uppercase text-[10px]">Authorized Staff Members</span>
            <p className="text-lg font-black mt-0.5">{organization.members.length}</p>
          </div>
          <div>
            <span className="text-white/75 font-bold uppercase text-[10px]">Borough Base</span>
            <p className="text-lg font-black mt-0.5">{organization.borough}</p>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveSubTab('opportunities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubTab === 'opportunities' ? 'bg-[#10AC84] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Organization Roles ({orgOpportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubTab === 'volunteers' ? 'bg-[#10AC84] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Volunteers ({orgApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubTab === 'members' ? 'bg-[#10AC84] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Organization Members ({organization.members.length})</span>
        </button>
      </div>

      {/* Tab 1: Organization Opportunities */}
      {activeSubTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Opportunities Created by {organization.orgName}</h2>
            <button
              onClick={onGoToPostOpportunity}
              className="text-xs font-bold text-[#10AC84] hover:underline flex items-center gap-1"
            >
              + Post New Role
            </button>
          </div>

          {orgOpportunities.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-800 text-sm">No opportunities posted yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                As a verified non-profit organization, you can post volunteer shifts for New York City community members.
              </p>
              <button
                onClick={onGoToPostOpportunity}
                className="px-4 py-2 rounded-xl bg-[#10AC84] text-white text-xs font-bold hover:brightness-105"
              >
                Post Your First Role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgOpportunities.map(opp => {
                const appCount = applications.filter(a => a.opportunityId === opp.id).length;
                return (
                  <div key={opp.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#10AC84] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                          {opp.cause}
                        </span>
                        <span className="text-gray-500 font-semibold">{opp.borough}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{opp.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{opp.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">
                        {appCount} Volunteers Registered ({opp.spotsRemaining} spots open)
                      </span>
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Registered Volunteers */}
      {activeSubTab === 'volunteers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Registered Volunteers</h2>
              <p className="text-xs text-gray-500">Volunteers signed up for your organization's NYC service opportunities.</p>
            </div>
          </div>

          {orgApplications.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-800 text-sm">No volunteer registrations yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Once volunteers apply to your posted opportunities, their contact details and shift selections will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Volunteer Name</th>
                      <th className="p-4">Opportunity Role</th>
                      <th className="p-4">Shift Selected</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Hours Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orgApplications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">
                          {app.applicantName}
                          <span className="block text-[10px] text-gray-400 font-normal">Emergency: {app.emergencyContact}</span>
                        </td>
                        <td className="p-4 text-gray-800 font-medium max-w-xs truncate">
                          {app.opportunityTitle}
                        </td>
                        <td className="p-4 text-gray-600">
                          {app.shiftSelected}
                        </td>
                        <td className="p-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{app.applicantEmail}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{app.applicantPhone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            app.status === 'Confirmed' ? 'bg-[#E8F5E9] text-[#10AC84]' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[#10AC84]">
                          {app.hoursCompleted || 0} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Organization Members */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Authorized Organization Members</h2>
              <p className="text-xs text-gray-500">Only authorized staff and administrators can create or edit opportunities for this organization.</p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 rounded-xl bg-[#10AC84] text-white font-bold text-xs hover:brightness-105 flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organization.members.map(member => (
              <div key={member.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.role === 'Admin' ? 'bg-[#FF5E5722] text-[#FF5E57]' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                    {organization.members.length > 1 && (
                      <button
                        onClick={() => onRemoveMember(organization.id, member.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.title || 'Staff Coordinator'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900">Add Staff Member Account</h3>
                <p className="text-xs text-gray-500">Create an authorized user account for someone in your non-profit organization.</p>
                
                <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={e => setNewMemberEmail(e.target.value)}
                      placeholder="elena@organization.org"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Title / Role</label>
                    <input
                      type="text"
                      value={newMemberTitle}
                      onChange={e => setNewMemberTitle(e.target.value)}
                      placeholder="Volunteer Outreach Director"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Permission Level</label>
                    <select
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value as 'Admin' | 'Staff')}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="Staff">Staff (Can post & manage opportunities)</option>
                      <option value="Admin">Admin (Can manage members & organization settings)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#10AC84] text-white font-bold"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

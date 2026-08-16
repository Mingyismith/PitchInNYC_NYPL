import React, { useState } from 'react';
import { Building2, ShieldCheck, Mail, Phone, Globe, Award, UserPlus, Trash2, Check, ExternalLink } from 'lucide-react';
import { OrganizationAccount, OrgMember, Borough } from '../types';

interface OrganizationProfileCardProps {
  organization: OrganizationAccount;
  onUpdateOrg: (org: OrganizationAccount) => void;
  onAddMember: (orgId: string, memberData: { name: string; email: string; role: 'Admin' | 'Staff'; title: string }) => void;
  onRemoveMember: (orgId: string, memberId: string) => void;
}

export const OrganizationProfileCard: React.FC<OrganizationProfileCardProps> = ({
  organization,
  onUpdateOrg,
  onAddMember,
  onRemoveMember
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [orgName, setOrgName] = useState(organization.orgName);
  const [mission, setMission] = useState(organization.mission);
  const [website, setWebsite] = useState(organization.website);
  const [contactEmail, setContactEmail] = useState(organization.contactEmail);
  const [contactPhone, setContactPhone] = useState(organization.contactPhone || '');
  const [borough, setBorough] = useState<Borough>(organization.borough);
  
  // New member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'Admin' | 'Staff'>('Staff');
  const [memberTitle, setMemberTitle] = useState('Volunteer Coordinator');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OrganizationAccount = {
      ...organization,
      orgName,
      mission,
      website,
      contactEmail,
      contactPhone,
      borough
    };
    onUpdateOrg(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberEmail) return;
    onAddMember(organization.id, {
      name: memberName,
      email: memberEmail,
      role: memberRole,
      title: memberTitle
    });
    setMemberName('');
    setMemberEmail('');
    setShowAddMember(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10AC84]/10 text-[#10AC84] flex items-center justify-center font-bold flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{organization.orgName}</h2>
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-black px-3 py-1 rounded-full border border-[#C8E6C9] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {organization.verificationBadge}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Verified 501(c)(3) Non-Profit Organization • EIN: {organization.ein}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#10AC84] bg-[#E8F5E9] hover:bg-[#C8E6C9] transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>{isEditing ? 'Cancel Editing' : 'Edit Organization Profile'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-3.5 text-xs text-[#1B5E20] font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#2E7D32]" />
            <span>Organization profile successfully updated!</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary NYC Borough</label>
                <select
                  value={borough}
                  onChange={e => setBorough(e.target.value as Borough)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84] bg-white"
                >
                  <option value="Manhattan">Manhattan</option>
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Queens">Queens</option>
                  <option value="Bronx">Bronx</option>
                  <option value="Staten Island">Staten Island</option>
                  <option value="Remote / Citywide">Remote / Citywide</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mission & About</label>
              <textarea
                rows={3}
                value={mission}
                onChange={e => setMission(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#10AC84]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#10AC84] text-white font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px]">Mission & Purpose</span>
              <p className="text-gray-700 leading-relaxed">{organization.mission}</p>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px]">Borough Location</span>
                <p className="font-bold text-gray-900 mt-0.5">{organization.borough}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px]">EIN / Tax ID</span>
                <p className="font-bold text-gray-900 mt-0.5">{organization.ein}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px]">Contact Email</span>
                <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {organization.contactEmail}
                </p>
              </div>
              {organization.website && (
                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px]">Website</span>
                  <p className="font-bold text-[#10AC84] mt-0.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {organization.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Authorized Staff Roster Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Authorized Organization Members ({organization.members.length})</h3>
            <p className="text-xs text-gray-500">Staff members authorized to post shifts and manage applications for {organization.orgName}.</p>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2 rounded-xl bg-[#10AC84] text-white font-bold text-xs hover:brightness-105 flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {organization.members.map(member => (
            <div key={member.id} className="p-4 rounded-2xl border border-gray-100 bg-[#F8F9FA] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">{member.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    member.role === 'Admin' ? 'bg-[#FF5E5722] text-[#FF5E57]' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{member.title || 'Staff Coordinator'} • {member.email}</p>
              </div>

              {organization.members.length > 1 && (
                <button
                  onClick={() => onRemoveMember(organization.id, member.id)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Add Staff Member Account</h3>
            <p className="text-xs text-gray-500">Create an authorized staff account for {organization.orgName}.</p>
            
            <form onSubmit={handleMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="elena@organization.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Title / Role</label>
                <input
                  type="text"
                  value={memberTitle}
                  onChange={e => setMemberTitle(e.target.value)}
                  placeholder="Volunteer Outreach Director"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Permission Level</label>
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value as 'Admin' | 'Staff')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Staff">Staff (Can post & manage opportunities)</option>
                  <option value="Admin">Admin (Can manage organization & members)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#10AC84] text-white font-bold"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

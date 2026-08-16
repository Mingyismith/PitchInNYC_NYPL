import React from 'react';
import { HeartHandshake, Search, PlusCircle, ShieldCheck, Sparkles, CalendarCheck, User, Building2, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

export type TabType = 'find' | 'matchmaker' | 'post' | 'my-hours' | 'profile';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  opportunityCount: number;
  applicationCount: number;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  opportunityCount, 
  applicationCount,
  currentUser,
  onOpenAuthModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand matching Vibrant Palette */}
          <div 
            id="nav-logo"
            onClick={() => onTabChange('find')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 bg-[#FF5E57] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#FF5E5733] group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-[#2D3436] tracking-tight">
                  PitchIn<span className="text-[#FF5E57]">NYC</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                  5 Boroughs
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block font-medium">Verified NYC Volunteer Platform</p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {currentUser.role === 'organization' ? (
              <>
                <button
                  id="tab-org-dashboard"
                  onClick={() => onTabChange('post')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'post'
                      ? 'bg-[#10AC84] text-white shadow-md shadow-[#10AC8433]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Org Dashboard & Postings</span>
                </button>

                <button
                  id="tab-org-profile"
                  onClick={() => onTabChange('profile')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'bg-[#10AC84] text-white shadow-md shadow-[#10AC8433]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Org Profile & Team</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-find-opportunities"
                  onClick={() => onTabChange('find')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'find'
                      ? 'bg-[#FF5E57] text-white shadow-md shadow-[#FF5E5733]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Find Roles</span>
                </button>

                <button
                  id="tab-ai-matchmaker"
                  onClick={() => onTabChange('matchmaker')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'matchmaker'
                      ? 'bg-[#FF9F43] text-white shadow-md shadow-[#FF9F4333]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#FF9F43]" />
                  <span>AI Matchmaker</span>
                </button>



                <button
                  id="tab-my-applications"
                  onClick={() => onTabChange('my-hours')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                    activeTab === 'my-hours'
                      ? 'bg-[#2D3436] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>My Hours</span>
                  {applicationCount > 0 && (
                    <span className="w-4 h-4 bg-[#FF5E57] text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-0.5">
                      {applicationCount}
                    </span>
                  )}
                </button>

                <button
                  id="tab-user-profile"
                  onClick={() => onTabChange('profile')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'bg-[#54A0FF] text-white shadow-md shadow-[#54A0FF33]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
              </>
            )}
          </nav>

          {/* User Account Switcher Pill */}
          <div className="flex items-center">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-800 transition-colors shadow-xs"
            >
              {currentUser.role === 'organization' ? (
                <Building2 className="w-3.5 h-3.5 text-[#10AC84]" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#FF5E57]" />
              )}
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black ${
                currentUser.role === 'organization' ? 'bg-[#10AC8422] text-[#10AC84]' : 'bg-[#FF5E5722] text-[#FF5E57]'
              }`}>
                {currentUser.role === 'organization' ? 'Org' : 'Volunteer'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};


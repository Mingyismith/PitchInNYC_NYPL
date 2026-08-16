import React from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';
import { Borough } from '../types';

interface NYCMapVisualizerProps {
  selectedBorough: string;
  onSelectBorough: (borough: string) => void;
  boroughCounts: Record<string, number>;
}

interface BoroughMeta {
  name: Borough;
  tagline: string;
  accent: string;
  iconBg: string;
  popularNeighborhoods: string[];
}

const NYC_BOROUGHS: BoroughMeta[] = [
  {
    name: "Manhattan",
    tagline: "Food rescue, soup kitchens, marine restoration & youth arts",
    accent: "border-[#B3E5FC] text-[#0277BD] bg-[#E1F5FE]/60 hover:bg-[#E1F5FE]",
    iconBg: "bg-[#54A0FF] text-white",
    popularNeighborhoods: ["Lower East Side", "Bowery", "SoHo", "Harlem", "Midtown"]
  },
  {
    name: "Brooklyn",
    tagline: "Urban bioswales, literacy mentoring, community gardens & food pantries",
    accent: "border-[#C8E6C9] text-[#2E7D32] bg-[#E8F5E9]/60 hover:bg-[#E8F5E9]",
    iconBg: "bg-[#10AC84] text-white",
    popularNeighborhoods: ["Gowanus", "Flatbush", "Crown Heights", "Williamsburg", "Park Slope"]
  },
  {
    name: "Queens",
    tagline: "Senior digital clinics, community arts, youth coding & food relief",
    accent: "border-[#FFE0B2] text-[#EF6C00] bg-[#FFF3E0]/60 hover:bg-[#FFF3E0]",
    iconBg: "bg-[#FF9F43] text-white",
    popularNeighborhoods: ["Forest Hills", "Flushing", "Corona", "Astoria", "Jackson Heights"]
  },
  {
    name: "Bronx",
    tagline: "Fresh produce markets, nutrition hubs, park forestry & community health",
    accent: "border-[#FFCDD2] text-[#C62828] bg-[#FFEBEE]/60 hover:bg-[#FFEBEE]",
    iconBg: "bg-[#FF5E57] text-white",
    popularNeighborhoods: ["Mott Haven", "South Bronx", "Riverdale", "Pelham Bay"]
  },
  {
    name: "Staten Island",
    tagline: "Urban organic farms, composting stewardship & cultural heritage centers",
    accent: "border-[#E1BEE7] text-[#8E24AA] bg-[#F3E5F5]/60 hover:bg-[#F3E5F5]",
    iconBg: "bg-[#8E24AA] text-white",
    popularNeighborhoods: ["Randall Manor", "St. George", "Snug Harbor", "Tottenville"]
  }
];

export const NYCMapVisualizer: React.FC<NYCMapVisualizerProps> = ({
  selectedBorough,
  onSelectBorough,
  boroughCounts
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#2D3436] flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#FF5E57]" />
            <span>
              Available in <span className="underline decoration-[#FFD32D] decoration-4 underline-offset-4">{selectedBorough === 'All' ? 'All 5 NYC Boroughs' : selectedBorough}</span>
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Click any borough to filter volunteer opportunities across the city</p>
        </div>

        {selectedBorough !== 'All' && (
          <button
            onClick={() => onSelectBorough('All')}
            className="text-xs font-bold text-[#FF5E57] hover:underline"
          >
            Show All 5 Boroughs
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {NYC_BOROUGHS.map((b) => {
          const count = boroughCounts[b.name] || 0;
          const isSelected = selectedBorough === b.name;

          return (
            <div
              key={b.name}
              onClick={() => onSelectBorough(isSelected ? 'All' : b.name)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#FF5E57] text-white ring-2 ring-[#FF5E57] border-transparent shadow-md shadow-[#FF5E5733]'
                  : `${b.accent}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {b.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white text-[#FF5E57]' : 'bg-white/90 text-gray-800 shadow-xs'
                  }`}>
                    {count} {count === 1 ? 'Role' : 'Roles'}
                  </span>
                </div>
                <p className={`text-[11px] leading-snug line-clamp-2 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                  {b.tagline}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-black/5 text-[9px]">
                {b.popularNeighborhoods.slice(0, 2).map((nh, i) => (
                  <span key={i} className={`px-1.5 py-0.5 rounded font-medium ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-white/70 text-gray-700'
                  }`}>
                    {nh}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

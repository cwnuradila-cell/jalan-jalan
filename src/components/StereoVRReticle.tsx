import React from 'react';

interface StereoVRReticleProps {
  progress: number;
  targetName: string | null;
  onExitVR: () => void;
}

export const StereoVRReticle: React.FC<StereoVRReticleProps> = ({
  progress,
  targetName,
  onExitVR,
}) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const renderEyeReticle = (eye: 'Kiri' | 'Kanan') => (
    <div className="relative flex-1 flex flex-col items-center justify-center h-full pointer-events-none select-none">
      {/* Reticle Dot & Progress Ring */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* SVG Progress Circle */}
        {progress > 0 && (
          <svg className="absolute w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="#38BDF8"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Center Reticle Dot */}
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-all ${
            progress > 0 ? 'bg-amber-400 scale-125' : 'bg-white/80'
          }`}
        />
      </div>

      {/* Target Notification on Gaze */}
      {targetName && (
        <div className="mt-4 px-3 py-1 bg-slate-900/80 text-white font-bold text-xs rounded-full border border-sky-400 animate-pulse">
          Melihat: {targetName} ({Math.round(progress * 100)}%)
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex pointer-events-none">
      {/* Left Eye View */}
      {renderEyeReticle('Kiri')}

      {/* Center Black Divider Line for VR Box */}
      <div className="w-1.5 h-full bg-black z-50 pointer-events-auto shrink-0 flex flex-col justify-between items-center py-4">
        <div className="w-1 h-8 bg-slate-800 rounded-full" />
        <button
          onClick={onExitVR}
          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-md shadow-md uppercase tracking-wider transform -rotate-90 pointer-events-auto"
        >
          Keluar VR
        </button>
        <div className="w-1 h-8 bg-slate-800 rounded-full" />
      </div>

      {/* Right Eye View */}
      {renderEyeReticle('Kanan')}
    </div>
  );
};

import React, { useState } from 'react';
import { PlayerStats, VRMode, ZoneId } from '../types/game';
import { InteractiveStation } from '../three/cityBuilder';
import { ZONES } from '../data/questionsData';
import {
  Award,
  Compass,
  Volume2,
  VolumeX,
  Music,
  Glasses,
  Smartphone,
  ChevronDown,
  ChevronUp,
  MapPin,
  HelpCircle,
  Zap,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface HUDProps {
  stats: PlayerStats;
  nearbyStation: InteractiveStation | null;
  vrMode: VRMode;
  seatedMode: boolean;
  moveSpeed: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  robiMessage: string;
  isRobiVisible: boolean;
  onDismissRobiMessage: () => void;
  onToggleRobiVisible: () => void;
  onOpenStation: (stationId: string) => void;
  onToggleMinimap: () => void;
  onToggleVRGuide: () => void;
  onOpenCertificate: () => void;
  onSetVRMode: (mode: VRMode) => void;
  onToggleSeatedMode: () => void;
  onSetMoveSpeed: (speed: number) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onTeleportToCenter: () => void;
  onTeleportToZone: (zoneId: ZoneId) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  nearbyStation,
  vrMode,
  seatedMode,
  moveSpeed,
  soundEnabled,
  musicEnabled,
  robiMessage,
  isRobiVisible,
  onDismissRobiMessage,
  onToggleRobiVisible,
  onOpenStation,
  onToggleMinimap,
  onToggleVRGuide,
  onOpenCertificate,
  onSetVRMode,
  onToggleSeatedMode,
  onSetMoveSpeed,
  onToggleSound,
  onToggleMusic,
  onTeleportToCenter,
  onTeleportToZone,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const totalAnswered = Object.keys(stats.answeredQuestions).length;
  const isAllCompleted = totalAnswered >= 8;

  if (vrMode === 'stereo') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5">
      {/* 1. TOP BAR: Mario Title, Coins, Misi Counter, Quick Actions */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Left: Mario App Title & Coin Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Mario Title Badge */}
          <div className="bg-red-600 text-white rounded-2xl px-4 py-2 shadow-xl border-3 border-amber-300 flex items-center space-x-2.5">
            <span className="text-2xl">🍄</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                Dunia Mario 3D
              </div>
              <h1 className="text-sm sm:text-base font-black text-white leading-none font-['Fredoka',sans-serif]">
                Wira Kata Pemeri
              </h1>
            </div>
          </div>

          {/* Mario Gold Coin Counter */}
          <div className="bg-amber-400 text-amber-950 rounded-2xl px-4 py-2 shadow-xl border-3 border-amber-200 flex items-center space-x-2 font-['Fredoka',sans-serif]">
            <span className="text-xl">🪙</span>
            <div>
              <div className="text-[10px] font-black uppercase text-amber-900 leading-none">
                Syiling & Markah
              </div>
              <div className="text-lg font-black leading-tight text-amber-950">
                {stats.score} / 80
              </div>
            </div>
          </div>

          {/* Misi Progress */}
          <div className="hidden md:flex bg-white/95 rounded-2xl px-3 py-2 shadow-lg border-2 border-slate-300 items-center space-x-2 text-xs font-black text-slate-700">
            <span>Misi:</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white font-extrabold shadow-xs">
              {totalAnswered} / 8 ?
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Certificate Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCertificate();
            }}
            className={`px-3 py-2 rounded-2xl shadow-lg border-2 font-bold text-xs flex items-center space-x-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
              isAllCompleted
                ? 'bg-amber-400 text-amber-950 border-amber-200 animate-bounce font-black'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Sijil Wira</span>
          </button>

          {/* Toggle Robi Companion 3D Visibility */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleRobiVisible();
            }}
            className={`p-2 sm:px-3 sm:py-2 rounded-2xl shadow-lg border-2 text-xs font-black flex items-center space-x-1.5 transition-transform hover:scale-105 cursor-pointer ${
              isRobiVisible
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}
            title={isRobiVisible ? 'Sorok Robi (Kosongkan Pandangan)' : 'Tunjuk Robi'}
          >
            {isRobiVisible ? <Eye size={15} className="text-sky-600" /> : <EyeOff size={15} />}
            <span className="hidden sm:inline">{isRobiVisible ? 'Robi: Ada' : 'Robi: Sorok'}</span>
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMinimap();
            }}
            className="p-2 sm:px-3 sm:py-2 bg-white/95 hover:bg-white text-slate-700 font-bold text-xs rounded-2xl shadow-lg border-2 border-slate-200 flex items-center space-x-1.5 transition-transform hover:scale-105 cursor-pointer"
            title="Peta Mini"
          >
            <Compass className="w-4 h-4 text-sky-500" />
            <span className="hidden sm:inline">Peta</span>
          </button>

          {/* VR Launcher */}
          <div className="flex items-center space-x-1 bg-white/95 p-1 rounded-2xl shadow-lg border-2 border-indigo-200">
            <button
              onClick={() => {
                sound.playClick();
                onSetVRMode('webxr');
              }}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-transform hover:scale-105 cursor-pointer"
              title="Masuk Meta Quest WebXR"
            >
              <Glasses size={14} />
              <span className="hidden md:inline">Quest</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSetVRMode('stereo');
              }}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-transform hover:scale-105 cursor-pointer"
              title="Mod VR Box Telefon"
            >
              <Smartphone size={14} />
              <span className="hidden md:inline">VR Box</span>
            </button>
          </div>

          {/* Guide / Help */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleVRGuide();
            }}
            className="p-2.5 bg-white/95 hover:bg-white text-slate-700 rounded-2xl shadow-lg border-2 border-slate-200 transition-transform hover:scale-105 cursor-pointer"
            title="Panduan Kawalan"
          >
            <HelpCircle size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* 2. TOP ROBI SPEECH BANNER (Dismissible with X, never blocks center) */}
      {robiMessage && (
        <div className="w-full flex justify-center mt-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl shadow-xl border-2 border-sky-400 max-w-lg text-center flex items-center justify-between space-x-3 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="text-left flex-1">
              <div className="flex items-center space-x-1.5 text-[10px] font-black text-sky-700">
                <span>🤖</span>
                <span>ROBI PEMERI:</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">{robiMessage}</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onDismissRobiMessage();
              }}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer"
              title="Tutup Mesej"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. PROXIMITY "JAWAB SOALAN" PROMPT (Above bottom dock) */}
      {nearbyStation && (
        <div className="w-full flex justify-center mb-3 pointer-events-auto animate-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              sound.playClick();
              onOpenStation(nearbyStation.id);
            }}
            className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 text-base sm:text-xl font-black rounded-3xl shadow-2xl border-4 border-white flex items-center space-x-3 transition-transform hover:scale-108 active:scale-95 cursor-pointer animate-pulse font-['Fredoka',sans-serif]"
          >
            <span className="text-2xl">❓</span>
            <div className="text-left">
              <div className="text-xs font-black uppercase text-amber-900">
                {nearbyStation.label}
              </div>
              <div>BUKA KOTAK SOALAN ? (Klik Di Sini)</div>
            </div>
          </button>
        </div>
      )}

      {/* 4. UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        <button
          onClick={() => {
            sound.playClick();
            setIsDockCollapsed(!isDockCollapsed);
          }}
          className="mb-1 px-4 py-1 bg-white/95 hover:bg-white text-slate-700 text-xs font-bold rounded-t-xl shadow-md border-t-2 border-x-2 border-slate-200 flex items-center space-x-1 transition-transform cursor-pointer"
        >
          {isDockCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isDockCollapsed ? 'Buka Kawalan' : 'Tutup Kawalan'}</span>
        </button>

        {!isDockCollapsed && (
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xs rounded-2xl p-3 sm:p-4 shadow-2xl border-2 border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            {/* Quick Warp Pipes to Zones */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
              <span className="text-xs font-extrabold text-slate-500 flex items-center mr-1">
                <MapPin size={13} className="mr-0.5" /> Paip:
              </span>
              <button
                onClick={() => {
                  sound.playTeleport();
                  onTeleportToCenter();
                }}
                className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black rounded-xl flex items-center space-x-1 transition-colors cursor-pointer border border-emerald-300"
                title="Warp ke Dataran Pusat"
              >
                <Zap size={12} className="text-amber-500" />
                <span>Pusat</span>
              </button>
              {(Object.keys(ZONES) as ZoneId[]).map((zid) => {
                const z = ZONES[zid];
                return (
                  <button
                    key={zid}
                    onClick={() => {
                      sound.playTeleport();
                      onTeleportToZone(zid);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-black rounded-xl flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                  >
                    <span>{z.badgeIcon}</span>
                    <span className="hidden sm:inline">{z.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Comfort Settings (Speed, Seated Mode, Audio) */}
            <div className="flex items-center space-x-2">
              {/* Move Speed */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-bold">
                <span className="px-1.5 text-[10px] text-slate-500">Laju:</span>
                {[
                  { label: '1x', val: 0.8 },
                  { label: '1.5x', val: 1.2 },
                  { label: '2x', val: 1.6 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      sound.playClick();
                      onSetMoveSpeed(s.val);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      moveSpeed === s.val
                        ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Seated Mode */}
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSeatedMode();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  seatedMode
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Tukar antara mod berdiri dan mod duduk"
              >
                {seatedMode ? '🪑 Duduk' : '🧍 Berdiri'}
              </button>

              {/* Sound & Music */}
              <button
                onClick={onToggleSound}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title={soundEnabled ? 'Matikan Bunyi' : 'Hidupkan Bunyi'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-500" />}
              </button>

              <button
                onClick={onToggleMusic}
                className={`p-1.5 rounded-xl border cursor-pointer ${
                  musicEnabled
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
                title={musicEnabled ? 'Matikan Muzik Mario' : 'Mainkan Muzik Mario'}
              >
                <Music size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

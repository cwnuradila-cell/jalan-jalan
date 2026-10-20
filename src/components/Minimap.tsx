import React from 'react';
import { ZoneId } from '../types/game';
import { ZONES, QUESTIONS } from '../data/questionsData';
import { Compass, Zap } from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  answeredQuestions: Record<string, boolean>;
  onTeleportToZone: (zoneId: ZoneId) => void;
  onTeleportToCenter: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerYaw,
  answeredQuestions,
  onTeleportToZone,
  onTeleportToCenter,
}) => {
  // World bounds from -55 to 55 maps to 0 to 100%
  const mapRange = 55;
  const toMapCoord = (x: number, z: number) => {
    const leftPercent = Math.max(5, Math.min(95, ((x + mapRange) / (mapRange * 2)) * 100));
    const topPercent = Math.max(5, Math.min(95, ((z + mapRange) / (mapRange * 2)) * 100));
    return { left: `${leftPercent}%`, top: `${topPercent}%` };
  };

  const playerPosStyle = toMapCoord(playerX, playerZ);

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-3 sm:p-4 shadow-xl border-3 border-sky-300 w-64 sm:w-72">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700">
          <Compass className="w-4 h-4 text-sky-500" />
          <span>PETA MINI BANDAR</span>
        </div>
        <button
          onClick={() => {
            sound.playTeleport();
            onTeleportToCenter();
          }}
          className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1 transition-colors"
          title="Kembali ke Dataran Pusat"
        >
          <Zap size={12} />
          <span>Pusat</span>
        </button>
      </div>

      {/* Radar Map Canvas Representation */}
      <div className="relative w-full aspect-square bg-emerald-100 rounded-2xl border-2 border-slate-300 overflow-hidden shadow-inner">
        {/* Roads cross */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[14%] bg-slate-500 opacity-60" />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[14%] bg-slate-500 opacity-60" />

        {/* Center Plaza circle */}
        <div
          onClick={() => {
            sound.playTeleport();
            onTeleportToCenter();
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-sky-200 border-2 border-sky-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          title="Dataran Pusat Bandar"
        >
          <span className="text-[10px] font-black text-sky-800">U</span>
        </div>

        {/* 4 Zone Areas */}
        {(Object.keys(ZONES) as ZoneId[]).map((zid) => {
          const z = ZONES[zid];
          const pos = z.spawnPosition;
          const { left, top } = toMapCoord(pos[0], pos[2]);

          return (
            <button
              key={zid}
              onClick={() => {
                sound.playTeleport();
                onTeleportToZone(zid);
              }}
              style={{ left, top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-white shadow-md border-2 border-slate-300 flex items-center justify-center hover:scale-125 transition-transform cursor-pointer group"
              title={`Klik untuk ke ${z.name}`}
            >
              <span className="text-sm">{z.badgeIcon}</span>
              <span className="sr-only">{z.name}</span>
            </button>
          );
        })}

        {/* Question Stations Dots */}
        {QUESTIONS.map((q) => {
          const { left, top } = toMapCoord(q.position[0], q.position[2]);
          const isDone = !!answeredQuestions[q.id];

          return (
            <div
              key={q.id}
              style={{ left, top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center shadow-sm ${
                isDone ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
              }`}
              title={`Stesen Misi: ${q.title}`}
            >
              {isDone && <span className="text-[8px] text-white font-black leading-none">✓</span>}
            </div>
          );
        })}

        {/* Player Cursor with Heading Cone */}
        <div
          style={{ left: playerPosStyle.left, top: playerPosStyle.top }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100"
        >
          <div
            style={{ transform: `rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            className="relative flex items-center justify-center w-6 h-6"
          >
            {/* View Direction Cone */}
            <div className="absolute -top-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-rose-500 opacity-80" />
            {/* Player Dot */}
            <div className="w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-white shadow-md" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Misi Belum</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Selesai</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Anda</span>
        </div>
      </div>
    </div>
  );
};

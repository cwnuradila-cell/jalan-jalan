import React, { useState } from 'react';
import { ZONES } from '../data/questionsData';
import { ZoneId } from '../types/game';
import { Award, Printer, X, Sparkles, CheckCircle } from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface CertificateModalProps {
  score: number;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  score,
  playerName,
  onUpdatePlayerName,
  onClose,
}) => {
  const [name, setName] = useState(playerName || 'Wira Bahasa');
  const today = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    onUpdatePlayerName(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-6 sm:p-8 my-6">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:scale-110 print:hidden"
        >
          <X size={20} />
        </button>

        {/* Certificate Printable Canvas Border */}
        <div className="p-6 sm:p-8 border-4 border-double border-amber-500 rounded-2xl bg-amber-50/40 relative overflow-hidden text-center space-y-4">
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Award size={360} className="text-amber-800" />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full uppercase tracking-widest">
              <Sparkles size={14} className="text-amber-600" />
              <span>DUNIA PEMERI VR: PENGEMBARAAN BANDAR SELAMAT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight pt-1">
              SIJIL PENGHARGAAN WIRA KATA PEMERI
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Sijil ini dengan sukacitanya dianugerahkan kepada:
            </p>
          </div>

          {/* Recipient Name Input */}
          <div className="py-2">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Masukkan Nama Murid"
              className="text-xl sm:text-3xl font-black text-amber-800 text-center border-b-2 border-amber-400 focus:border-amber-600 outline-none bg-transparent w-full max-w-md mx-auto py-1 font-serif tracking-wide print:border-none"
            />
            <div className="text-[11px] text-slate-500 mt-1 print:hidden">
              (Klik nama di atas untuk menukar nama penerima)
            </div>
          </div>

          {/* Citation Body */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-lg mx-auto font-medium">
            Kerana telah berjaya meneroka keseluruhan <span className="font-bold text-slate-900">4 Zon Bandar Selamat</span>,
            menguasai penggunaan kata pemeri <span className="font-bold text-blue-600">"ialah"</span> dan{' '}
            <span className="font-bold text-amber-600">"adalah"</span>, serta mencapai markah:
          </p>

          {/* Score Badge */}
          <div className="inline-flex items-center space-x-3 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl shadow-lg border-2 border-amber-300">
            <Award className="w-8 h-8 text-white drop-shadow-sm" />
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-100">
                Keputusan Rasmi
              </div>
              <div className="text-2xl font-black">{score} / 80 MATA</div>
            </div>
          </div>

          {/* 4 Badges Display */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Lencana Keselamatan Yang Diperoleh:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto">
              {(Object.keys(ZONES) as ZoneId[]).map((zid) => {
                const z = ZONES[zid];
                return (
                  <div
                    key={zid}
                    className="p-2 bg-white rounded-xl border-2 border-amber-200 shadow-xs flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{z.badgeIcon}</span>
                    <span className="text-[10px] font-black text-slate-700 text-center leading-tight">
                      {z.name}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center mt-0.5">
                      <CheckCircle size={10} className="mr-0.5" /> Selesai
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-4 flex items-center justify-between border-t border-amber-200/80 px-4 text-left">
            <div>
              <div className="text-[11px] text-slate-500 font-bold">Tarikh Penganugerahan:</div>
              <div className="text-xs font-extrabold text-slate-800">{today}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">Status: Disahkan Sah</div>
            </div>

            {/* Official Seal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-amber-600 bg-amber-100/80 flex flex-col items-center justify-center text-center p-1 shadow-inner rotate-6">
              <span className="text-base sm:text-lg">🤖</span>
              <span className="text-[7px] sm:text-[8px] font-black text-amber-900 leading-tight">
                ROBI PEMERI
                <br />
                WIRA VR
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer"
          >
            <Printer size={18} />
            <span>Cetak / Simpan Sijil</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

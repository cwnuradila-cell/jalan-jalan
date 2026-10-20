import React, { useState } from 'react';
import { Glasses, Smartphone, Monitor, ShieldCheck, X, Check, HelpCircle } from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface VRGuideModalProps {
  onClose: () => void;
}

export const VRGuideModal: React.FC<VRGuideModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'quest' | 'cardboard' | 'desktop'>('quest');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-sky-300 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Glasses className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Panduan Peranti & Kawalan VR</h2>
              <p className="text-xs text-sky-100">Cara bermain pada Meta Quest, VR Box telefon & Desktop</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 space-x-2">
          <button
            onClick={() => {
              sound.playClick();
              setTab('quest');
            }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer ${
              tab === 'quest'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Glasses size={18} />
            <span>Meta Quest (WebXR)</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('cardboard');
            }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer ${
              tab === 'cardboard'
                ? 'bg-white text-emerald-600 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone size={18} />
            <span>VR Box Telefon</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('desktop');
            }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer ${
              tab === 'desktop'
                ? 'bg-white text-sky-600 border-t-2 border-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor size={18} />
            <span>Desktop & Sentuh</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {tab === 'quest' && (
            <div className="space-y-4 text-slate-700">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
                <div className="font-extrabold text-indigo-900 flex items-center space-x-2">
                  <Check className="w-5 h-5 text-indigo-600" />
                  <span>Pengujian & Penerbitan Meta Quest Browser (HTTPS)</span>
                </div>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  WebXR memerlukan protokol selamat (HTTPS). Buka pautan aplikasi di dalam Meta Quest Browser, kemudian klik butang <strong>"Masuk WebXR (Meta Quest)"</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">🕹️ Kawalan Pengawal:</span>
                  <p className="text-xs text-slate-600">
                    Gunakan analog thumbstick kiri untuk berjalan, dan gerakkan kepala anda secara bebas dalam 360 darjah.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">🎯 Teleportasi Selesa:</span>
                  <p className="text-xs text-slate-600">
                    Bagi mengelakkan pening siber, gunakan titik teleportasi di dataran bandar untuk lompatan segera.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'cardboard' && (
            <div className="space-y-4 text-slate-700">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="font-extrabold text-emerald-900 flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Mod Stereoskopik & Gaze Selection (Pandangan Mata)</span>
                </div>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Untuk menggunakan telefon dalam headset VR Box / Google Cardboard tanpa alat kawalan:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 pl-2">
                <li>Klik butang <strong>"VR Box Telefon"</strong> di menu atas.</li>
                <li>Pusingkan telefon ke mod landskap dan masukkan ke dalam slot VR Box.</li>
                <li>Gerakkan kepala untuk mengarahkan titik sasaran (Reticle).</li>
                <li>
                  <strong className="text-slate-800">Sistem Gaze:</strong> Halakan titik ke papan soalan selama <strong>1.4 saat</strong>. Bulatan sasaran akan penuh dan membuka soalan secara automatik!
                </li>
                <li>Terdapat butang merah "Keluar VR" di garisan pembahagi tengah untuk kembali ke mod biasa.</li>
              </ol>
            </div>
          )}

          {tab === 'desktop' && (
            <div className="space-y-4 text-slate-700">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                <div className="font-extrabold text-sky-900 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-sky-600" />
                  <span>Kawalan Komputer / Tablet Skrin Sentuh</span>
                </div>
                <p className="text-sm text-sky-800 leading-relaxed">
                  Boleh dimainkan secara langsung tanpa peranti VR:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">💻 Papan Kekunci & Tetikus:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• <strong>W / A / S / D</strong>: Bergerak ke hadapan, kiri, undur, kanan</li>
                    <li>• <strong>Tetikus</strong>: Klik dan heret untuk toleh pandangan</li>
                    <li>• <strong>Klik Stesen</strong>: Jawab soalan</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">📱 Telefon / Tablet Skrin Sentuh:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• Gunakan <strong>Kayu Bedik Maya (Joystick)</strong> di kiri bawah</li>
                    <li>• Leret jari pada skrin untuk memusingkan kamera</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Safety & Comfort Note */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Panduan Keselamatan Murid:</span>
              Jika berasa pening atau kurang selesa dalam mod VR, tanggalkan headset dengan segera. Tukar ke <strong>Mod Duduk (Seated Mode)</strong> atau main dalam mod paparan skrin biasa.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105"
          >
            Faham, Mulakan Misi!
          </button>
        </div>
      </div>
    </div>
  );
};

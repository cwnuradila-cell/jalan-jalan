import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';

interface WalkControlsProps {
  onSetDirection: (dir: { x: number; y: number }) => void;
  onTurn: (yawDelta: number) => void;
}

export const WalkControls: React.FC<WalkControlsProps> = ({ onSetDirection, onTurn }) => {
  const activeKeys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const turnInterval = useRef<number | null>(null);
  const quickStepTimer = useRef<number | null>(null);

  const updateVector = () => {
    let y = 0;
    let x = 0;
    if (activeKeys.current.up) y += 1;
    if (activeKeys.current.down) y -= 1;
    if (activeKeys.current.left) x -= 1;
    if (activeKeys.current.right) x += 1;
    onSetDirection({ x, y });
  };

  const handlePressDirection = (dir: 'up' | 'down' | 'left' | 'right', isPressed: boolean) => {
    if (quickStepTimer.current) {
      clearTimeout(quickStepTimer.current);
      quickStepTimer.current = null;
    }
    activeKeys.current[dir] = isPressed;
    updateVector();
  };

  const handleQuickStep = (dir: 'up' | 'down' | 'left' | 'right') => {
    activeKeys.current[dir] = true;
    updateVector();
    if (quickStepTimer.current) clearTimeout(quickStepTimer.current);
    quickStepTimer.current = window.setTimeout(() => {
      activeKeys.current[dir] = false;
      updateVector();
    }, 250);
  };

  const startTurning = (delta: number) => {
    onTurn(delta);
    if (turnInterval.current) clearInterval(turnInterval.current);
    turnInterval.current = window.setInterval(() => {
      onTurn(delta);
    }, 40);
  };

  const stopTurning = () => {
    if (turnInterval.current) {
      clearInterval(turnInterval.current);
      turnInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (turnInterval.current) clearInterval(turnInterval.current);
      if (quickStepTimer.current) clearTimeout(quickStepTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-slate-900/85 backdrop-blur-xs p-2 sm:p-2.5 rounded-3xl border-2 border-white/50 shadow-2xl pointer-events-auto select-none touch-none">
      <div className="text-[10px] font-black text-sky-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
        <span>🚶</span>
        <span>KAWALAN BERJALAN</span>
      </div>

      {/* D-Pad Layout */}
      <div className="grid grid-cols-3 gap-1.5 w-32 sm:w-36">
        {/* Top-left: Turn Left */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            startTurning(0.06);
          }}
          onPointerUp={stopTurning}
          onPointerCancel={stopTurning}
          onClick={() => onTurn(0.18)}
          className="h-10 rounded-xl bg-white/20 hover:bg-white/30 active:bg-sky-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          title="Pusing Kiri (Q)"
        >
          <RotateCcw size={16} />
          <span className="text-[8px] font-bold text-white/70">Q</span>
        </button>

        {/* Top-center: Forward (W) */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            handlePressDirection('up', true);
          }}
          onPointerUp={() => handlePressDirection('up', false)}
          onPointerCancel={() => handlePressDirection('up', false)}
          onClick={() => handleQuickStep('up')}
          className="h-10 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white flex flex-col items-center justify-center shadow-md transition-all cursor-pointer active:scale-95 font-bold"
          title="Maju Berjalan (W / ⬆)"
        >
          <ArrowUp size={18} />
          <span className="text-[8px] font-black">W</span>
        </button>

        {/* Top-right: Turn Right */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            startTurning(-0.06);
          }}
          onPointerUp={stopTurning}
          onPointerCancel={stopTurning}
          onClick={() => onTurn(-0.18)}
          className="h-10 rounded-xl bg-white/20 hover:bg-white/30 active:bg-sky-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          title="Pusing Kanan (E)"
        >
          <RotateCw size={16} />
          <span className="text-[8px] font-bold text-white/70">E</span>
        </button>

        {/* Middle-left: Strafe Left (A) */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            handlePressDirection('left', true);
          }}
          onPointerUp={() => handlePressDirection('left', false)}
          onPointerCancel={() => handlePressDirection('left', false)}
          onClick={() => handleQuickStep('left')}
          className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-sky-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 font-bold"
          title="Langkah Kiri (A / ⬅)"
        >
          <ArrowLeft size={18} />
          <span className="text-[8px] font-bold">A</span>
        </button>

        {/* Middle-center: Backward (S) */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            handlePressDirection('down', true);
          }}
          onPointerUp={() => handlePressDirection('down', false)}
          onPointerCancel={() => handlePressDirection('down', false)}
          onClick={() => handleQuickStep('down')}
          className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-sky-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 font-bold"
          title="Undur Berjalan (S / ⬇)"
        >
          <ArrowDown size={18} />
          <span className="text-[8px] font-bold">S</span>
        </button>

        {/* Middle-right: Strafe Right (D) */}
        <button
          onPointerDown={(e) => {
            try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
            handlePressDirection('right', true);
          }}
          onPointerUp={() => handlePressDirection('right', false)}
          onPointerCancel={() => handlePressDirection('right', false)}
          onClick={() => handleQuickStep('right')}
          className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-sky-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 font-bold"
          title="Langkah Kanan (D / ➡️)"
        >
          <ArrowRight size={18} />
          <span className="text-[8px] font-bold">D</span>
        </button>
      </div>

      <div className="mt-1.5 text-[8px] text-slate-300 font-semibold text-center">
        Papan Kekunci: W A S D / Anak Panah
      </div>
    </div>
  );
};

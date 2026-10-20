import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { WorldManager } from './three/WorldManager';
import { InteractiveStation } from './three/cityBuilder';
import { PlayerStats, VRMode, ZoneId, Question } from './types/game';
import { QUESTIONS, ZONES } from './data/questionsData';
import { HUD } from './components/HUD';
import { QuestionModal } from './components/QuestionModal';
import { Minimap } from './components/Minimap';
import { VirtualJoystick } from './components/VirtualJoystick';
import { WalkControls } from './components/WalkControls';
import { StereoVRReticle } from './components/StereoVRReticle';
import { CertificateModal } from './components/CertificateModal';
import { VRGuideModal } from './components/VRGuideModal';
import { sound } from './audio/soundEffects';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<WorldManager | null>(null);

  // Player & Game State
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    totalQuestions: 8,
    answeredQuestions: {},
    completedZones: {
      sekolah: false,
      rumah: false,
      jalan: false,
      taman: false,
    },
    playerName: 'Murid Cemerlang',
    hasStarted: true,
    startTime: Date.now(),
  });

  // UI state
  const [nearbyStation, setNearbyStation] = useState<InteractiveStation | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [vrMode, setVrMode] = useState<VRMode>('none');
  const [showMinimap, setShowMinimap] = useState(false);
  const [showVRGuide, setShowVRGuide] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0, yaw: 0 });
  const [gazeState, setGazeState] = useState<{ progress: number; targetName: string | null }>({
    progress: 0,
    targetName: null,
  });

  // Comfort & Audio & Robi
  const [seatedMode, setSeatedMode] = useState(false);
  const [moveSpeed, setMoveSpeed] = useState(1.2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [isRobiVisible, setIsRobiVisible] = useState(true);
  const [robiMessage, setRobiMessage] = useState(
    'Selamat datang ke Dunia Mario Kata Pemeri! Selesaikan 4 zon dan kumpul semua syiling serta bintang!'
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Initialize 3D Engine
  useEffect(() => {
    // Touch detection
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (!mountRef.current) return;

    const manager = new WorldManager(mountRef.current, {
      onNearbyStation: (station) => {
        setNearbyStation(station);
      },
      onGazeProgress: (progress, targetName) => {
        setGazeState({ progress, targetName });
        // In phone VR mode, if gaze reaches 1.0, automatically open the question modal
        if (progress >= 1.0 && targetName) {
          const matched = QUESTIONS.find((q) => q.title.includes(targetName) || targetName.includes(q.title));
          if (matched) {
            setActiveQuestion(matched);
          }
        }
      },
      onPlayerMoved: (x, z, yaw) => {
        setPlayerCoords({ x, z, yaw });
      },
    });

    worldRef.current = manager;

    return () => {
      manager.dispose();
      worldRef.current = null;
    };
  }, []);

  // Handle Station Interaction
  const handleOpenStation = useCallback((stationId: string) => {
    const q = QUESTIONS.find((item) => item.id === stationId);
    if (q) {
      setActiveQuestion(q);
      sound.playClick();
      setRobiMessage(`Bagus! Mari selesaikan soalan di ${q.title}. Perhatikan frasa nama atau frasa sendi!`);
    }
  }, []);

  // Handle Question Answer
  const handleAnswerQuestion = useCallback(
    (isCorrect: boolean) => {
      if (!activeQuestion) return;

      if (isCorrect) {
        const qId = activeQuestion.id;
        const wasAlreadyDone = !!stats.answeredQuestions[qId];

        // Trigger 3D star burst animation at station in world
        worldRef.current?.triggerStarBurstAt(qId);

        if (!wasAlreadyDone) {
          // Add 10 points
          const newAnswered = { ...stats.answeredQuestions, [qId]: true };
          const newScore = stats.score + 10;

          // Check if this zone is completed (both questions answered)
          const zoneQuestions = QUESTIONS.filter((q) => q.zoneId === activeQuestion.zoneId);
          const isZoneDone = zoneQuestions.every((q) => newAnswered[q.id]);
          const newCompletedZones = {
            ...stats.completedZones,
            [activeQuestion.zoneId]: isZoneDone,
          };

          setStats((prev) => ({
            ...prev,
            score: newScore,
            answeredQuestions: newAnswered,
            completedZones: newCompletedZones,
          }));

          // Confetti & zone celebration
          if (isZoneDone) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            const zInfo = ZONES[activeQuestion.zoneId];
            setRobiMessage(`Tahniah! Anda telah menamatkan ${zInfo.name} dan meraih ${zInfo.badgeName}!`);
            sound.playFanfareVictory();
          }

          // If all 8 questions answered
          if (Object.keys(newAnswered).length === 8) {
            setTimeout(() => {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
              });
              setRobiMessage('SYABAS WIRA! Anda telah menyelesaikan SEMUA 8 soalan! Sijil anda sedia dijana!');
              setShowCertificate(true);
            }, 1200);
          }
        }
      }
    },
    [activeQuestion, stats]
  );

  // Teleportation handlers
  const handleTeleportToCenter = useCallback(() => {
    worldRef.current?.teleportTo(0, 1.6, 6.0);
    setRobiMessage('Kembali ke Dataran Pusat Bandar. Pilih mana-mana zon yang ingin anda teroka!');
  }, []);


  const handleTeleportToZone = useCallback((zoneId: ZoneId) => {
    const z = ZONES[zoneId];
    worldRef.current?.teleportTo(...z.spawnPosition);
    setRobiMessage(`Selamat tiba di ${z.name}! ${z.description}`);
  }, []);

  // VR mode switch
  const handleSetVRMode = useCallback(async (mode: VRMode) => {
    setVrMode(mode);
    if (mode === 'stereo') {
      // Request device orientation permission for phone cardboard
      await worldRef.current?.requestGyroPermission();
    }
    worldRef.current?.setVRMode(mode);
  }, []);

  const handleToggleSeatedMode = useCallback(() => {
    setSeatedMode((prev) => {
      const next = !prev;
      worldRef.current?.setSeatedMode(next);
      return next;
    });
  }, []);

  const handleSetMoveSpeed = useCallback((speed: number) => {
    setMoveSpeed(speed);
    worldRef.current?.setMoveSpeed(speed);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sound.setMuted(!next);
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      sound.toggleMusic(next);
      return next;
    });
  }, []);

  const handleToggleRobiVisible = useCallback(() => {
    setIsRobiVisible((prev) => {
      const next = !prev;
      worldRef.current?.setRobiVisible(next);
      return next;
    });
  }, []);


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-400 select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Main Game HUD Overlay */}
      <HUD
        stats={stats}
        nearbyStation={nearbyStation}
        vrMode={vrMode}
        seatedMode={seatedMode}
        moveSpeed={moveSpeed}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        robiMessage={robiMessage}
        isRobiVisible={isRobiVisible}
        onDismissRobiMessage={() => setRobiMessage('')}
        onToggleRobiVisible={handleToggleRobiVisible}
        onOpenStation={handleOpenStation}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onToggleVRGuide={() => setShowVRGuide((prev) => !prev)}
        onOpenCertificate={() => setShowCertificate(true)}
        onSetVRMode={handleSetVRMode}
        onToggleSeatedMode={handleToggleSeatedMode}
        onSetMoveSpeed={handleSetMoveSpeed}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onTeleportToCenter={handleTeleportToCenter}
        onTeleportToZone={handleTeleportToZone}
      />


      {/* On-Screen Walking Controls (D-Pad + Keyboard info) for all devices */}
      {vrMode === 'none' && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-30 pointer-events-auto">
          <WalkControls
            onSetDirection={(dir) => {
              if (worldRef.current) {
                worldRef.current.dpadVector = dir;
              }
            }}
            onTurn={(yawDelta) => {
              worldRef.current?.turn(yawDelta);
            }}
          />
        </div>
      )}

      {/* Stereoscopic Reticle with Gaze Progress for Phone VR Box */}
      {vrMode === 'stereo' && (
        <StereoVRReticle
          progress={gazeState.progress}
          targetName={gazeState.targetName}
          onExitVR={() => handleSetVRMode('none')}
        />
      )}

      {/* Minimap Popup Overlay */}
      {showMinimap && vrMode === 'none' && (
        <div className="fixed top-18 right-4 z-40 animate-in fade-in zoom-in-95 duration-150">
          <Minimap
            playerX={playerCoords.x}
            playerZ={playerCoords.z}
            playerYaw={playerCoords.yaw}
            answeredQuestions={stats.answeredQuestions}
            onTeleportToZone={handleTeleportToZone}
            onTeleportToCenter={handleTeleportToCenter}
          />
        </div>
      )}

      {/* Interactive Question Station Modal */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          isAlreadyAnswered={!!stats.answeredQuestions[activeQuestion.id]}
          onAnswer={handleAnswerQuestion}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {/* Digital Certificate of Achievement Modal */}
      {showCertificate && (
        <CertificateModal
          score={stats.score}
          playerName={stats.playerName}
          onUpdatePlayerName={(name) => setStats((prev) => ({ ...prev, playerName: name }))}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* VR Guide and Device Setup Modal */}
      {showVRGuide && (
        <VRGuideModal onClose={() => setShowVRGuide(false)} />
      )}
    </div>
  );
}

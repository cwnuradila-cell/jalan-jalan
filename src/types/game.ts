export type ZoneId = 'sekolah' | 'rumah' | 'jalan' | 'taman';

export interface Question {
  id: string;
  zoneId: ZoneId;
  stationIndex: number; // 1 or 2
  title: string;
  questionText: string;
  blankSentence?: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hint: string;
  position: [number, number, number]; // 3D coordinates in city
}

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  title: string;
  subtitle: string;
  color: string;
  badgeName: string;
  badgeIcon: string;
  iconBg: string;
  spawnPosition: [number, number, number];
  themeColor: string;
  description: string;
}

export type VRMode = 'none' | 'stereo' | 'webxr';

export interface GameSettings {
  moveSpeed: number; // 1: perlahan, 1.5: biasa, 2: laju
  comfortMode: boolean; // teleport vs smooth
  seatedMode: boolean; // adjust eye height
  soundEnabled: boolean;
  musicEnabled: boolean;
  invertLookY: boolean;
}

export interface PlayerStats {
  score: number;
  totalQuestions: number;
  answeredQuestions: Record<string, boolean>; // id -> isCorrect
  completedZones: Record<ZoneId, boolean>;
  playerName: string;
  hasStarted: boolean;
  startTime: number;
  endTime?: number;
}

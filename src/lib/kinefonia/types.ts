import type { MODES, MODE_PARAMS, CAMERA_FILTERS } from './constants';

export type ModeId = keyof typeof MODES;
export type FilterId = keyof typeof CAMERA_FILTERS;

export type ModeParams = typeof MODE_PARAMS;

export type Controls = {
  p1: number;
  p2: number;
  p3: number;
  sensitivity: number;
  audioGain: number;
};

export type Preset = Controls & {
  id: string;
  userId: string;
  mode: ModeId;
  filter: FilterId;
};

export type LogEntry = {
  time: string;
  text: string;
};

export type Session = {
  id: string;
  userId: string;
  timestamp: string;
  modesUsed: ModeId[];
  motionAvg: number;
  audioAvg: number;
  manifesto: string;
  videoURL?: string;
};

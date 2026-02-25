import {
  Activity,
  BrainCircuit,
  Clock,
  Eye,
  Grid,
  Hexagon,
  Layers,
  Moon,
  Palette,
  Radio,
  Share2,
  Sparkles,
  Sun,
  Triangle,
  Type,
  Waves,
  Zap,
} from 'lucide-react';

export const MODES = {
  SONIC_MESH: { id: 'SONIC_MESH', label: 'MALLA SÓNICA', Icon: Grid },
  KALEIDO: { id: 'KALEIDO', label: 'CALEIDOSCOPIO', Icon: Hexagon },
  FRACTAL: { id: 'FRACTAL', label: 'FRACTAL', Icon: Triangle },
  TRACE: { id: 'TRACE', label: 'ESTELA', Icon: Zap },
  SLITSCAN: { id: 'SLITSCAN', label: 'CRONOGRAFÍA', Icon: Clock },
  PARTICLES: { id: 'PARTICLES', label: 'POLVO ESTELAR', Icon: Sparkles },
  HEATMAP: { id: 'HEATMAP', label: 'MAPA TÉRMICO', Icon: Activity },
  NETWORK: { id: 'NETWORK', label: 'RED NEURONAL', Icon: Share2 },
  SCANNER: { id: 'SCANNER', label: 'ESCÁNER', Icon: Radio },
  POETIC: { id: 'POETIC', label: 'LÍRICA DIGITAL', Icon: Type },
  SYNAPSE: { id: 'SYNAPSE', label: 'SYNAPSE', Icon: BrainCircuit },
  OCEAN: { id: 'OCEAN', label: 'OCÉANO DIGITAL', Icon: Waves },
} as const;

export const MODE_PARAMS = {
  SONIC_MESH: {
    p1: { label: 'TENSIÓN', min: 1, max: 100, def: 30 },
    p2: { label: 'PERSPECTIVA', min: 100, max: 1500, def: 800 },
    p3: { label: 'AMPLITUD Z', min: 0, max: 200, def: 100 },
  },
  KALEIDO: {
    p1: { label: 'SEGMENTOS', min: 2, max: 24, def: 8 },
    p2: { label: 'ZOOM', min: 50, max: 300, def: 100 },
    p3: { label: 'VEL. ROTACIÓN', min: 0, max: 100, def: 20 },
  },
  FRACTAL: {
    p1: { label: 'PROFUNDIDAD', min: 1, max: 5, def: 3 },
    p2: { label: 'DISPERSIÓN', min: 0, max: 150, def: 40 },
    p3: { label: 'ESCALA', min: 30, max: 70, def: 50 },
  },
  TRACE: {
    p1: { label: 'DECAIMIENTO', min: 1, max: 50, def: 10 },
    p2: { label: 'UMBRAL RGB', min: 10, max: 100, def: 25 },
    p3: { label: 'GLITCH', min: 0, max: 100, def: 0 },
  },
  SLITSCAN: {
    p1: { label: 'VELOCIDAD', min: 1, max: 20, def: 2 },
    p2: { label: 'ANCHO', min: 1, max: 50, def: 5 },
    p3: { label: 'DISTORSIÓN', min: 0, max: 100, def: 10 },
  },
  PARTICLES: {
    p1: { label: 'VIDA', min: 10, max: 100, def: 60 },
    p2: { label: 'CAOS', min: 1, max: 50, def: 15 },
    p3: { label: 'GRAVEDAD', min: 0, max: 50, def: 0 },
  },
  HEATMAP: {
    p1: { label: 'ENFRIAMIENTO', min: 1, max: 50, def: 5 },
    p2: { label: 'RADIO', min: 5, max: 100, def: 30 },
    p3: { label: 'INTENSIDAD', min: 10, max: 200, def: 100 },
  },
  NETWORK: {
    p1: { label: 'CONEXIÓN', min: 20, max: 150, def: 70 },
    p2: { label: 'NODOS MAX', min: 50, max: 400, def: 150 },
    p3: { label: 'GROSOR', min: 1, max: 10, def: 1 },
  },
  SCANNER: {
    p1: { label: 'VELOCIDAD', min: 1, max: 30, def: 5 },
    p2: { label: 'PERSISTENCIA', min: 0, max: 100, def: 20 },
    p3: { label: 'COLOR SHIFT', min: 0, max: 100, def: 0 },
  },
  POETIC: {
    p1: { label: 'TAMAÑO', min: 10, max: 200, def: 60 },
    p2: { label: 'JITTER', min: 0, max: 100, def: 10 },
    p3: { label: 'SOMBRA', min: 0, max: 100, def: 50 },
  },
  SYNAPSE: {
    p1: { label: 'NEURONAS', min: 20, max: 200, def: 80 },
    p2: { label: 'SENSIBILIDAD', min: 1, max: 100, def: 50 },
    p3: { label: 'DECAIMIENTO', min: 800, max: 999, def: 950 },
  },
  OCEAN: {
    p1: { label: 'COMPLEJIDAD', min: 1, max: 10, def: 4 },
    p2: { label: 'AMPLITUD', min: 10, max: 200, def: 80 },
    p3: { label: 'VELOCIDAD', min: 1, max: 100, def: 30 },
  },
};

export const CAMERA_FILTERS = {
  REAL: { id: 'REAL', label: 'NATURAL', filter: 'none', Icon: Eye },
  BW_CONTRAST: { id: 'BW_CONTRAST', label: 'GRAFITO', filter: 'grayscale(100%) contrast(120%)', Icon: Moon },
  VIBRANT: { id: 'VIBRANT', label: 'CROMÁTICO', filter: 'saturate(250%) contrast(110%)', Icon: Palette },
  DREAM: { id: 'DREAM', label: 'ONÍRICO', filter: 'sepia(50%) hue-rotate(190deg) saturate(150%) blur(0.5px)', Icon: Sun },
  INVERT: { id: 'INVERT', label: 'NEGATIVO', filter: 'invert(100%)', Icon: Layers },
} as const;

export const ZONES = [
  { id: 0, label: 'A1', x: 0, y: 0, w: 0.5, h: 0.5, role: 'GRAVES' },
  { id: 1, label: 'A2', x: 0.5, y: 0, w: 0.5, h: 0.5, role: 'MEDIOS' },
  { id: 2, label: 'B1', x: 0, y: 0.5, w: 0.5, h: 0.5, role: 'RUIDO' },
  { id: 3, label: 'B2', x: 0.5, y: 0.5, w: 0.5, h: 0.5, role: 'ETÉREO' },
];

export const SCALE_FREQUENCIES = [
  130.81, 155.56, 174.61, 196.0, 233.08, 261.63, 311.13, 349.23, 392.0, 466.16, 523.25, 622.25, 698.46, 783.99, 932.33,
];

"use client";

import { generatePoeticPhrase } from '@/ai/flows/generate-poetic-phrases';
import { generateSessionSummary } from '@/ai/flows/generate-session-summary';
import { wrapText } from '@/lib/kinefonia/canvas';
import { CAMERA_FILTERS, MODES, MODE_PARAMS, ZONES } from '@/lib/kinefonia/constants';
import { MeshPoint, Particle, Neuron } from '@/lib/kinefonia/physics';
import type { Controls, FilterId, LogEntry, ModeId, Preset, Session } from '@/lib/kinefonia/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudio } from './useAudio';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  initiateAnonymousSignIn,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';

// --- CONFIGURACIÓN DE OBRA: KINEFONÍA ---

// CONSTANTES ESTÁTICAS
const MESH_COLS = 40;
const MESH_ROWS = 30;
const HEAT_W = 60;
const HEAT_H = 45;

export function useKinefoniaState() {
  // 0. FIREBASE & AUTH
  const { firestore, auth, user, isUserLoading } = useFirebase();

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  // 1. ESTADO
  const [appStarted, setAppStarted] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeId>('SONIC_MESH');
  const [activeFilter, setActiveFilter] = useState<FilterId>('REAL');
  const [autoMode, setAutoMode] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [galleryMode, setGalleryMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [osdMessage, setOsdMessage] = useState('');
  const [fps, setFps] = useState(0);

  const [controls, setControls] = useState<Controls>({
    p1: MODE_PARAMS.SONIC_MESH.p1.def,
    p2: MODE_PARAMS.SONIC_MESH.p2.def,
    p3: MODE_PARAMS.SONIC_MESH.p3.def,
    sensitivity: 60,
    audioGain: 50,
  });

  const [presets, setPresets] = useState<(Preset | null)[]>([null, null, null]);

  // Firestore-backed presets & sessions
  const presetsCollectionRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'presets') : null),
    [firestore, user]
  );
   const sessionsCollectionRef = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc')) : null),
    [firestore, user]
  );
  const { data: firestorePresets } = useCollection<Preset>(presetsCollectionRef);
  const { data: firestoreSessions } = useCollection<Session>(sessionsCollectionRef);

  useEffect(() => {
    if (firestorePresets) {
      const newPresets: (Preset | null)[] = [null, null, null];
      firestorePresets.forEach(p => {
        const index = parseInt(p.id, 10);
        if (!isNaN(index) && index >= 0 && index < 3) {
          newPresets[index] = p;
        }
      });
      setPresets(newPresets);
    }
  }, [firestorePresets]);


  const [uiMotionScore, setUiMotionScore] = useState(0);
  const [uiAudioScore, setUiAudioScore] = useState(0);
  const [uiCentroid, setUiCentroid] = useState({ x: 0.5, y: 0.5 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessionLogs, setSessionLogs] = useState<LogEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const addLog = useCallback(
    (text: string, record = true) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [{ time: timestamp, text }, ...prev.slice(0, 9)]);
      if (record && isRecording) {
        setSessionLogs(prev => [...prev, { time: timestamp, text }]);
      }
    },
    [isRecording]
  );
  
  const {
    audioConfig,
    setAudioConfig,
    audioBand,
    setAudioBand,
    audioEnabled,
    micAnalyserRef,
    initAudio,
    updateAudio,
    closeAudioContext,
  } = useAudio(addLog);

  // 2. REFS
  const controlsRef = useRef(controls);
  const activeModeRef = useRef(activeMode);
  const activeZoneRef = useRef(activeZone);
  const currentPoeticPhraseRef = useRef('ESPERANDO SEÑAL...');
  const motionScoreRef = useRef(0);
  const audioScoreRef = useRef(0);
  const centroidRef = useRef({ x: 0.5, y: 0.5 });
  const prevCentroidRef = useRef({ x: 0.5, y: 0.5 });
  const frameCounterRef = useRef(0);
  const lastDimensions = useRef({ w: 0, h: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameData = useRef<ImageData | null>(null);
  const scanLineY = useRef(0);
  const lastAICall = useRef(0);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const neuronsRef = useRef<Neuron[]>([]);
  const heatmapGrid = useRef(new Array(HEAT_W * HEAT_H).fill(0));
  const meshPointsRef = useRef<MeshPoint[]>([]);
  const lastFpsCheckTimeRef = useRef(0);
  const framesSinceLastCheckRef = useRef(0);

  // Refs for recording metadata
  const recordingMetricsRef = useRef({ motionSum: 0, audioSum: 0, frameCount: 0 });
  const recordingStartModeRef = useRef<ModeId | null>(null);
  const recordingStartPhraseRef = useRef<string | null>(null);

  // Session tracking refs
  const sessionModesUsedRef = useRef(new Set<ModeId>());
  const sessionMetricsRef = useRef({ motionSum: 0, audioSum: 0, frameCount: 0 });

  // 3. EFECTOS DE SINCRONIZACIÓN DE ESTADO/REFS
  useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { controlsRef.current = controls; }, [controls]);
  useEffect(() => { activeZoneRef.current = activeZone; }, [activeZone]);


  const setActiveModeHandler = (newMode: ModeId) => {
    setActiveMode(newMode);
    sessionModesUsedRef.current.add(newMode);
  }

  const updateControl = (key: keyof Controls, value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const initNeurons = useCallback((width: number, height: number) => {
    neuronsRef.current = [];
    // Access p1 from controls ref to get the latest value
    const neuronCount = controlsRef.current.p1;
    for(let i=0; i < neuronCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        neuronsRef.current.push(new Neuron(x, y));
    }
  }, []);

  useEffect(() => {
    setOsdMessage(MODES[activeMode].label);
    const timer = setTimeout(() => setOsdMessage(''), 2000);

    const defaults = MODE_PARAMS[activeMode];
    if (defaults) {
      const newControls = {
        ...controls,
        p1: defaults.p1.def,
        p2: defaults.p2.def,
        p3: defaults.p3.def,
      };
      setControls(newControls);
    }

    particlesRef.current = [];
    scanLineY.current = 0;
    heatmapGrid.current.fill(0);
    if (activeMode === MODES.SONIC_MESH.id && lastDimensions.current.w > 0) {
      initMesh(lastDimensions.current.w, lastDimensions.current.h);
    }
    if (activeMode === 'SYNAPSE' && lastDimensions.current.w > 0) {
      initNeurons(lastDimensions.current.w, lastDimensions.current.h);
    }
    if (videoRef.current) {
      videoRef.current.style.transform = 'scale(1)';
    }

    return () => clearTimeout(timer);
  }, [activeMode, initNeurons]); // eslint-disable-line react-hooks/exhaustive-deps

  
  const savePreset = (index: number) => {
    if (!user) {
      addLog('ERROR: Usuario no autenticado', false);
      return;
    }
    const presetData: Preset = {
      id: index.toString(),
      userId: user.uid,
      mode: activeMode,
      filter: activeFilter,
      ...controlsRef.current,
    };
    const presetDocRef = doc(firestore, 'users', user.uid, 'presets', index.toString());
    setDocumentNonBlocking(presetDocRef, presetData, { merge: true });
    addLog(`MEMORIA ${index + 1} GUARDADA EN NUBE`, false);
  };
  
  const loadPreset = (index: number) => {
    const preset = presets[index];
    if (preset) {
      setControls({
        p1: preset.p1, p2: preset.p2, p3: preset.p3,
        sensitivity: preset.sensitivity, audioGain: preset.audioGain,
      });
      if (preset.mode) setActiveModeHandler(preset.mode);
      if (preset.filter) setActiveFilter(preset.filter);
      addLog(`MEMORIA ${index + 1} CARGADA`, false);
    } else {
      addLog(`MEMORIA ${index + 1} VACÍA`, false);
    }
  };
  
  const initMesh = (width: number, height: number) => {
    meshPointsRef.current = [];
    const stepX = (width * 1.2) / MESH_COLS;
    const stepY = (height * 1.2) / MESH_ROWS;
    const offsetX = (width - stepX * MESH_COLS) / 2;
    const offsetY = (height - stepY * MESH_ROWS) / 2;

    for (let y = 0; y < MESH_ROWS; y++) {
      for (let x = 0; x < MESH_COLS; x++) {
        const pX = x * stepX + offsetX;
        const pY = y * stepY + offsetY;
        meshPointsRef.current.push(new MeshPoint(pX, pY, 0));
      }
    }
  };
  
  const callGeminiPoet = useCallback(async () => {
    if (isLoadingAI) return;
    const now = Date.now();
    if (now - lastAICall.current < 8000) return;
    setIsLoadingAI(true);
    addLog('SINTONIZANDO ORÁCULO...', false);
    lastAICall.current = now;
    const currentMotion = motionScoreRef.current;
    const currentAudio = audioScoreRef.current;
    const currentModeLabel = MODES[activeModeRef.current].label;
    try {
      const { phrase } = await generatePoeticPhrase({
        motionScore: currentMotion,
        audioScore: currentAudio,
        activeMode: currentModeLabel,
      });
      currentPoeticPhraseRef.current = phrase;
      addLog(`[IA] ${phrase}`, true);
    } catch (e) {
      addLog('[IA] OFFLINE', false);
      console.error(e);
    } finally {
      setIsLoadingAI(false);
    }
  }, [isLoadingAI, addLog]);
  
  const startRecording = () => {
    if (!displayCanvasRef.current) return;
  
    // Reset recording-specific metrics
    recordingMetricsRef.current = { motionSum: 0, audioSum: 0, frameCount: 0 };
    recordingStartModeRef.current = activeModeRef.current;
    recordingStartPhraseRef.current = currentPoeticPhraseRef.current;
  
    recordedChunksRef.current = [];
    const stream = displayCanvasRef.current.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
  
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
  
    mediaRecorder.onstop = () => {
      const timestamp = Date.now();
      const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KINEFONIA_REC_${timestamp}.mp4`;
      a.click();
      addLog('VIDEO GUARDADO', false);
  
      // Metadata export logic from PLAN PRO
      const recMetrics = recordingMetricsRef.current;
      if (recMetrics.frameCount > 0) {
        const avgMotion = recMetrics.motionSum / recMetrics.frameCount;
        const avgAudio = recMetrics.audioSum / recMetrics.frameCount;
  
        const metadata = {
          mode: recordingStartModeRef.current,
          avgMotion: parseFloat(avgMotion.toFixed(2)),
          avgAudio: parseFloat(avgAudio.toFixed(2)),
          timestamp: new Date(timestamp).toISOString(),
          phrase: recordingStartPhraseRef.current,
          parameters: { ...controlsRef.current },
        };
  
        const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `KINEFONIA_REC_${timestamp}_meta.json`;
        jsonLink.click();
        addLog('METADATOS GUARDADOS', false);
      }
    };
  
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    addLog('GRABANDO VIDEO...', false);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        addLog("PROCESANDO...", false);
    }
  };

  const takeSnapshot = () => {
    if (!displayCanvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const displayCanvas = displayCanvasRef.current;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = displayCanvas.width;
    tempCanvas.height = displayCanvas.height;
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) {
      addLog('ERROR AL CREAR IMAGEN', false);
      return;
    }

    // 1. Fondo negro como en la UI
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Dibujar el video con su filtro y opacidad
    ctx.save();
    // La opacidad está en `opacity-40` en el className del video
    ctx.globalAlpha = 0.4;
    // El filtro se aplica directamente al estilo del video
    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.restore();

    // 3. Dibujar el canvas generativo encima con mix-blend-mode
    // El canvas tiene `mix-blend-screen` en su className
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(displayCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // 4. Crear el enlace de descarga desde el canvas temporal
    const link = document.createElement('a');
    link.download = `IMG_${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    addLog("FOTO GUARDADA", false);
  };

  const processFrame = useCallback(() => {
    if (!isSystemActive) return;
    
    // --- FPS Calculation & Self-Protection ---
    framesSinceLastCheckRef.current++;
    const now = performance.now();
    if (now - lastFpsCheckTimeRef.current > 1000) {
      const calculatedFps = Math.round((framesSinceLastCheckRef.current * 1000) / (now - lastFpsCheckTimeRef.current));
      setFps(calculatedFps);
      lastFpsCheckTimeRef.current = now;
      framesSinceLastCheckRef.current = 0;

      // Self-protection logic
      if (calculatedFps < 25 && frameCounterRef.current > 120) { // check after ~2 seconds
        addLog('SISTEMA: BAJO FPS. OPTIMIZANDO...', false);
        const currentMode = activeModeRef.current;
        if (currentMode === 'PARTICLES') {
          updateControl('p2', Math.max(MODE_PARAMS.PARTICLES.p2.min, Math.floor(controlsRef.current.p2 / 2)));
        } else if (currentMode === 'FRACTAL') {
          updateControl('p1', Math.max(MODE_PARAMS.FRACTAL.p1.min, controlsRef.current.p1 - 1));
        } else if (currentMode === 'KALEIDO') {
          updateControl('p1', Math.max(MODE_PARAMS.KALEIDO.p1.min, Math.floor(controlsRef.current.p1 * 0.75)));
        } else if (currentMode === 'SONIC_MESH') {
          updateControl('p2', Math.max(MODE_PARAMS.SONIC_MESH.p2.min, controlsRef.current.p2 - 200));
        }
      }
    }
    // --- End FPS ---

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displayCanvas = displayCanvasRef.current;

    if (!video || !canvas || !displayCanvas || video.paused || video.ended) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const currentMode = activeModeRef.current;
    const { p1, p2, p3, sensitivity, audioGain } = controlsRef.current;
    const currentThreshold = (101 - sensitivity) * 2.5;
    const audioGainMult = audioGain / 50;

    let rawMic = 0;
    if (micAnalyserRef.current && audioConfig.mic) {
      const bufferLen = micAnalyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLen);
      micAnalyserRef.current.getByteFrequencyData(dataArray);

      let startBin = 0,
        endBin = bufferLen;
      if (audioBand === 'LOW') endBin = 20;
      else if (audioBand === 'MID') { startBin = 20; endBin = 100; } 
      else if (audioBand === 'HIGH') startBin = 100;

      let sum = 0, count = 0;
      for (let i = startBin; i < endBin && i < bufferLen; i++) {
        sum += dataArray[i];
        count++;
      }
      rawMic = count > 0 ? sum / count : 0;
    }

    const newAudioScore = (audioScoreRef.current * 0.85 + rawMic * 0.15) * audioGainMult;
    audioScoreRef.current = newAudioScore;
    const effectiveAudio = newAudioScore;
    const audioSpike = effectiveAudio > 40 * audioGainMult;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const displayCtx = displayCanvas.getContext('2d');
    if (!displayCtx) return;

    const vW = video.videoWidth, vH = video.videoHeight;
    if (vW && vH && (displayCanvas.width !== vW || displayCanvas.height !== vH)) {
      displayCanvas.width = vW;
      displayCanvas.height = vH;
      lastDimensions.current = { w: vW, h: vH };
      if (currentMode === MODES.SONIC_MESH.id) initMesh(vW, vH);
      if (currentMode === 'SYNAPSE') initNeurons(vW, vH);
    }
    if (canvas.width !== 320) {
      canvas.width = 320;
      canvas.height = 240;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frameData.data;

    let changedPixels = 0, sumX = 0, sumY = 0;
    
    if (['SONIC_MESH', 'KALEIDO', 'FRACTAL', 'NETWORK', 'SYNAPSE', 'OCEAN'].includes(currentMode)) {
      displayCtx.fillStyle = '#020204';
      displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    } else if (currentMode === 'TRACE') {
      const fade = (100 - p1) / 1000;
      displayCtx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.01, fade)})`;
      displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    } else if (currentMode === 'HEATMAP') {
      displayCtx.fillStyle = `rgba(0, 0, 0, 0.25)`;
      displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    } else if (currentMode !== 'SLITSCAN') {
      displayCtx.fillStyle = `rgba(0, 0, 0, 0.1)`;
      displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    }

    if (lastFrameData.current) {
      const prevData = lastFrameData.current.data;
      for (let i = 0; i < data.length; i += 16) {
        const rDiff = Math.abs(data[i] - prevData[i]);
        const gDiff = Math.abs(data[i + 1] - prevData[i + 1]);
        const bDiff = Math.abs(data[i + 2] - prevData[i + 2]);
        const diff = rDiff + gDiff + bDiff;

        if (diff > currentThreshold) {
          changedPixels++;
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          sumX += x;
          sumY += y;

          const displayX = x * (displayCanvas.width / canvas.width);
          const displayY = y * (displayCanvas.height / canvas.height);

          if (currentMode === 'TRACE') {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if ((r + g + b) / 3 > p2) {
              displayCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              displayCtx.fillRect(displayX, displayY, 2, 2);
            }
          }

          if (currentMode === 'HEATMAP') {
            const hx = Math.floor(x / canvas.width * HEAT_W);
            const hy = Math.floor(y / canvas.height * HEAT_H);
            const hIdx = hy * HEAT_W + hx;
            if (heatmapGrid.current[hIdx] !== undefined) {
              heatmapGrid.current[hIdx] += p3 / 10;
            }
          }

          if (currentMode === 'NETWORK' && particlesRef.current.length < p2 && Math.random() > 0.7) {
            const hue = 180 + Math.random() * 60;
            particlesRef.current.push(new Particle(displayX, displayY, hue));
          }

          if (currentMode === 'SONIC_MESH') {
            const col = Math.floor((x / canvas.width) * MESH_COLS);
            const row = Math.floor((y / canvas.height) * MESH_ROWS);
            const idx = row * MESH_COLS + col;
            if (meshPointsRef.current[idx]) meshPointsRef.current[idx].applyForce(-50);
          }
          if (currentMode === 'PARTICLES' && Math.random() > 0.8) {
            const hue = (x / canvas.width) * 60 + 240;
            const cx = centroidRef.current.x * displayCanvas.width;
            const cy = centroidRef.current.y * displayCanvas.height;
            const px = prevCentroidRef.current.x * displayCanvas.width;
            const py = prevCentroidRef.current.y * displayCanvas.height;
            particlesRef.current.push(new Particle(displayX, displayY, hue, p2/10, (cx-px)*0.1, (cy-py)*0.1));
          }
          if (currentMode === 'SCANNER' && Math.abs(displayY - scanLineY.current) < 20) {
            const hue = 120 + p3;
            displayCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
            displayCtx.fillRect(displayX, displayY, 3, 3);
          }
        }
      }
    }
    lastFrameData.current = frameData;
    
    let centerX = 0.5, centerY = 0.5;
    if (changedPixels > 0) {
      centerX = (sumX / changedPixels) / canvas.width;
      centerY = (sumY / changedPixels) / canvas.height;
      prevCentroidRef.current = centroidRef.current;
      centroidRef.current = { x: centerX, y: centerY };
    }

    const motionAmount = Math.min(1, changedPixels / (canvas.width * canvas.height * 0.01)) * 100;
    const newMotionScore = (motionScoreRef.current * 0.8) + (motionAmount * 0.2);
    motionScoreRef.current = newMotionScore;

    let currentZoneId = null;
    for (const zone of ZONES) {
      if (centerX > zone.x && centerX < zone.x + zone.w && centerY > zone.y && centerY < zone.y + zone.h) {
        currentZoneId = zone.id;
        break;
      }
    }
    const zoneTriggered = activeZoneRef.current !== currentZoneId && currentZoneId !== null;
    if (activeZoneRef.current !== currentZoneId) {
      setActiveZone(currentZoneId);
    }
    
    // VISUALS
    if (currentMode === 'SONIC_MESH') {
        const time = Date.now() * 0.002;
        if (meshPointsRef.current.length > 0) {
            const projected: { x: number; y: number; visible: boolean }[] = [];
            const tensionVal = 0.01 + (p1 / 100) * 0.1;
            meshPointsRef.current.forEach((p, i) => {
                const col = i % MESH_COLS;
                const row = Math.floor(i / MESH_COLS);
                p.targetZ = Math.sin(col * 0.2 + time) * Math.cos(row * 0.2 + time) * p3;
                if (effectiveAudio > 10) {
                     const dx = col - MESH_COLS/2;
                     const dy = row - MESH_ROWS/2;
                     const dist = Math.sqrt(dx*dx + dy*dy);
                     p.applyForce(Math.sin(dist * 0.5 - time * 5) * effectiveAudio * 0.1);
                }
                p.update(tensionVal);
                const MESH_BASE_Z = 200;
                const scale = p2 / (p2 + p.currentZ + MESH_BASE_Z);
                projected.push({ x: (p.baseX - displayCanvas.width/2) * scale + displayCanvas.width/2, y: (p.baseY - displayCanvas.height/2) * scale + displayCanvas.height/2, visible: scale > 0 });
            });

            displayCtx.lineWidth = 1;
            displayCtx.strokeStyle = `hsl(${180 + (effectiveAudio)}, 100%, 50%)`;
            displayCtx.beginPath();
            for (let y = 0; y < MESH_ROWS; y++) {
                for (let x = 0; x < MESH_COLS; x++) {
                    const i = y * MESH_COLS + x;
                    if (!projected[i].visible) continue;
                    if (x < MESH_COLS - 1 && projected[i+1].visible) { displayCtx.moveTo(projected[i].x, projected[i].y); displayCtx.lineTo(projected[i+1].x, projected[i+1].y); }
                    if (y < MESH_ROWS - 1 && projected[i+MESH_COLS].visible) { displayCtx.moveTo(projected[i].x, projected[i].y); displayCtx.lineTo(projected[i+MESH_COLS].x, projected[i+MESH_COLS].y); }
                }
            }
            displayCtx.stroke();
        }
    }
    if (currentMode === 'PARTICLES') {
        const lifeDecay = (100 - p1) / 1000;
        const gravity = p3 / 10; 
        particlesRef.current = particlesRef.current.filter(p => p.update(lifeDecay, gravity));
        particlesRef.current.forEach(p => p.draw(displayCtx));
    }
    if (currentMode === 'FRACTAL') {
        const depthMax = Math.floor(p1); 
        const spread = p2 + effectiveAudio; 
        const scaleFact = p3 / 100; 
        const drawRecursive = (x:number, y:number, w:number, h:number, depth:number) => {
            if (depth <= 0) return;
            displayCtx.drawImage(video, x, y, w, h);
            const nextW = w * scaleFact, nextH = h * scaleFact;
            const offset = spread * (depth/depthMax);
            drawRecursive(x + (w-nextW)/2, y - offset, nextW, nextH, depth - 1);
            drawRecursive(x - offset, y + h - nextH/2, nextW, nextH, depth - 1);
            drawRecursive(x + w + offset - nextW, y + h - nextH/2, nextW, nextH, depth - 1);
        };
        drawRecursive((displayCanvas.width - displayCanvas.width*0.4)/2, (displayCanvas.height - displayCanvas.height*0.4)/2, displayCanvas.width*0.4, displayCanvas.height*0.4, depthMax);
    }
    if (currentMode === 'KALEIDO') {
        const slices = p1 + Math.floor(effectiveAudio / 20); 
        const angle = (Math.PI * 2) / slices;
        const cx = displayCanvas.width / 2, cy = displayCanvas.height / 2;
        const rot = Date.now() * (p3/1000);
        displayCtx.save();
        displayCtx.translate(cx, cy);
        displayCtx.rotate(rot);
        for (let i = 0; i < slices; i++) {
            displayCtx.save();
            displayCtx.rotate(i * angle);
            if (i % 2 === 1) displayCtx.scale(1, -1);
            displayCtx.beginPath();
            displayCtx.moveTo(0, 0);
            displayCtx.arc(0, 0, Math.max(displayCanvas.width, displayCanvas.height) * 1.5, -angle/2-0.01, angle/2+0.01);
            displayCtx.clip();
            const zoom = (p2 / 100) + (effectiveAudio * 0.005);
            displayCtx.scale(zoom, zoom);
            displayCtx.drawImage(video, -displayCanvas.width/2, -displayCanvas.height/2, displayCanvas.width, displayCanvas.height);
            displayCtx.restore();
        }
        displayCtx.restore();
    }
    if (currentMode === 'SLITSCAN') {
        const shiftSpeed = p1; 
        displayCtx.drawImage(displayCanvas, -shiftSpeed, 0); 
        const sliceW = p2 + (effectiveAudio / 40); 
        const centerV = video.videoWidth / 2;
        const distort = p3 / 10; 
        const sourceX = centerV + (Math.sin(Date.now() * 0.005) * (effectiveAudio * distort));
        displayCtx.drawImage(video, sourceX, 0, sliceW, video.videoHeight, displayCanvas.width - sliceW, 0, sliceW, displayCanvas.height);
    }
    if (currentMode === 'POETIC') {
        displayCtx.save();
        displayCtx.font = `900 ${Math.floor(p1 + effectiveAudio)}px "Courier New", monospace`; 
        displayCtx.fillStyle = `hsl(${300 - effectiveAudio*2}, 100%, 60%)`;
        displayCtx.textAlign = 'center';
        displayCtx.shadowColor = `rgba(255, 0, 255, ${p3/100})`;
        displayCtx.shadowBlur = 20;
        displayCtx.strokeStyle = 'rgba(0,0,0,0.7)';
        displayCtx.lineWidth = 4;
        const jitter = p2, jX = (Math.random()-0.5)*jitter, jY = (Math.random()-0.5)*jitter;
        const targetX = (centerX * displayCanvas.width) + jX;
        const targetY = (centerY * displayCanvas.height) + jY;
        wrapText(displayCtx, currentPoeticPhraseRef.current, targetX, targetY, displayCanvas.width * 0.8, (p1 + effectiveAudio) * 1.1);
        displayCtx.restore();
    }
     if (currentMode === 'SCANNER') {
        const speed = p1; 
        scanLineY.current += speed;
        if (scanLineY.current > displayCanvas.height) scanLineY.current = 0;
        displayCtx.strokeStyle = '#00ff00';
        displayCtx.lineWidth = 2;
        displayCtx.beginPath();
        displayCtx.moveTo(0, scanLineY.current);
        displayCtx.lineTo(displayCanvas.width, scanLineY.current);
        displayCtx.stroke();
    }
    if (currentMode === 'HEATMAP') {
        const cooling = p1 / 1000;
        const cellW = displayCanvas.width / HEAT_W;
        const cellH = displayCanvas.height / HEAT_H;

        for (let i = 0; i < heatmapGrid.current.length; i++) {
            heatmapGrid.current[i] = Math.max(0, heatmapGrid.current[i] - cooling);
            const heat = heatmapGrid.current[i];
            if (heat > 0.01) {
                const hx = i % HEAT_W;
                const hy = Math.floor(i / HEAT_W);
                const px = hx * cellW;
                const py = hy * cellH;
                const hue = 240 - Math.min(heat * 10, 240);
                const alpha = Math.min(heat * 0.5, 0.7);
                displayCtx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                const radius = (p2 / 100) * cellW * Math.min(heat, 1.5);
                displayCtx.beginPath();
                displayCtx.arc(px + cellW / 2, py + cellH / 2, radius, 0, Math.PI * 2);
                displayCtx.fill();
            }
        }
    }
    if (currentMode === 'NETWORK') {
        particlesRef.current.forEach(p => {
            p.life -= 0.003;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);

        particlesRef.current.forEach(p => {
            displayCtx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life * 0.8})`;
            displayCtx.beginPath();
            displayCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            displayCtx.fill();
        });
        
        const connectDist = p1;
        displayCtx.lineWidth = p3 / 4;

        for (let i = 0; i < particlesRef.current.length; i++) {
            for (let j = i + 1; j < particlesRef.current.length; j++) {
                const p1_node = particlesRef.current[i];
                const p2_node = particlesRef.current[j];
                const dx = p1_node.x - p2_node.x;
                const dy = p1_node.y - p2_node.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < connectDist) {
                    const alpha = ((connectDist - dist) / connectDist) * 0.2 * p1_node.life * p2_node.life;
                    displayCtx.strokeStyle = `hsla(210, 100%, 70%, ${alpha})`;
                    displayCtx.beginPath();
                    displayCtx.moveTo(p1_node.x, p1_node.y);
                    displayCtx.lineTo(p2_node.x, p2_node.y);
                    displayCtx.stroke();
                }
            }
        }
    }
    if (currentMode === 'SYNAPSE') {
      const decay = p3 / 1000;
      if (neuronsRef.current.length !== p1) {
        initNeurons(displayCanvas.width, displayCanvas.height);
      }
      neuronsRef.current.forEach(neuron => {
        const dx = neuron.x - centroidRef.current.x * displayCanvas.width;
        const dy = neuron.y - centroidRef.current.y * displayCanvas.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const motionRadius = 150 + motionScoreRef.current * 5;
        if (dist < motionRadius) {
          neuron.energy += ((motionRadius - dist) / motionRadius) * 0.1 * (p2 / 50);
        }
        if (audioSpike) {
          neuron.energy += 0.2 * (p2 / 50);
        }
        neuron.energy *= decay;
        neuron.energy = Math.min(1, neuron.energy);
        neuron.draw(displayCtx);
      });

      const connectDist = 120;
      displayCtx.lineWidth = 0.5;
      for (let i = 0; i < neuronsRef.current.length; i++) {
        for (let j = i + 1; j < neuronsRef.current.length; j++) {
          const n1 = neuronsRef.current[i];
          const n2 = neuronsRef.current[j];
          if (n1.energy > 0.3 && n2.energy > 0.3) {
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectDist) {
              const alpha = ((connectDist - dist) / connectDist) * n1.energy * n2.energy * 0.4;
              displayCtx.strokeStyle = `hsla(200, 100%, 80%, ${alpha})`;
              displayCtx.beginPath();
              displayCtx.moveTo(n1.x, n1.y);
              displayCtx.lineTo(n2.x, n2.y);
              displayCtx.stroke();
            }
          }
        }
      }
    }
    if (currentMode === 'OCEAN') {
      const time = Date.now() * 0.0001 * p3;
      const numLines = 50;
      const amplitude = p2 + effectiveAudio;
      const complexity = p1;
  
      displayCtx.lineWidth = 1.5;
      for (let i = 0; i < numLines; i++) {
          const y = (i / numLines) * displayCanvas.height;
          const hue = 180 + (i / numLines) * 60;
          const saturation = 70 + (effectiveAudio / 100) * 30;
          displayCtx.strokeStyle = `hsl(${hue}, ${saturation}%, 50%)`;
          
          displayCtx.beginPath();
          displayCtx.moveTo(0, y);
  
          for (let x = 0; x < displayCanvas.width; x += 10) {
              let waveY = y;
              for (let j = 1; j <= complexity; j++) {
                waveY += Math.sin(x * (0.005 * j) + time * j * 5 + i * 0.1) * (amplitude / numLines) * (motionScoreRef.current / 50 + 0.5);
              }
              displayCtx.lineTo(x, waveY);
          }
          displayCtx.stroke();
      }
    }

    // Automatic AI Poet call for POETIC mode
    if (currentMode === 'POETIC' && isSystemActive) {
      callGeminiPoet();
    }
    
    // Update session metrics
    sessionMetricsRef.current.motionSum += newMotionScore;
    sessionMetricsRef.current.audioSum += newAudioScore;
    sessionMetricsRef.current.frameCount++;

    // Update recording metrics if active
    if (isRecording) {
      recordingMetricsRef.current.motionSum += newMotionScore;
      recordingMetricsRef.current.audioSum += newAudioScore;
      recordingMetricsRef.current.frameCount++;
    }

    // Update audio synthesis on every frame for smooth reactivity
    updateAudio(newAudioScore, centerX, centerY, newMotionScore, controlsRef.current.audioGain);

    frameCounterRef.current += 1;
    if (frameCounterRef.current % 10 === 0) {
      setUiMotionScore(newMotionScore);
      setUiAudioScore(newAudioScore);
      setUiCentroid({ x: centerX, y: centerY });
      setGlitchActive(audioSpike || zoneTriggered);
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [isSystemActive, isRecording, updateAudio, audioBand, audioConfig.mic, firestore, sessionsCollectionRef, user, sessionLogs, addLog, initNeurons, callGeminiPoet]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoMode && isSystemActive) {
      addLog('PILOTO AUTOMÁTICO: ACTIVO', false);
      interval = setInterval(() => {
        const modeKeys = Object.keys(MODES) as ModeId[];
        const randomMode = modeKeys[Math.floor(Math.random() * modeKeys.length)];
        setActiveModeHandler(randomMode);
        addLog(`AUTO-SWITCH: ${randomMode}`, false);
      }, 12000);
    }
    return () => clearInterval(interval);
  }, [autoMode, isSystemActive, addLog]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    setIsScanning(true);
    addLog('ACCEDIENDO...', false);

    // Reset session trackers
    sessionMetricsRef.current = { motionSum: 0, audioSum: 0, frameCount: 0 };
    sessionModesUsedRef.current.clear();
    sessionModesUsedRef.current.add(activeModeRef.current);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(false);
      setIsSystemActive(true);
      addLog('SISTEMA ONLINE', false);
      await initAudio();
    } catch (e) {
      setIsScanning(false);
      addLog('ERROR_CAMARA', false);
      console.error(e);
    }
  };

  useEffect(() => {
    if (isSystemActive) {
      requestRef.current = requestAnimationFrame(processFrame);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isSystemActive, processFrame]);

  const stopSystem = async () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    
    // ARCHIVE SESSION LOGIC from PLAN PRO
    const metrics = sessionMetricsRef.current;
    if (metrics.frameCount > 300 && user && sessionsCollectionRef) { // Archive if active for > ~10 seconds
      addLog('ARCHIVANDO SESIÓN...', false);
      setIsLoadingAI(true);
      
      // 1. Calculate Averages
      const motionAvg = metrics.motionSum / metrics.frameCount;
      const audioAvg = metrics.audioSum / metrics.frameCount;

      // 2. Generate Manifesto from sessionLogs (if any)
      let manifesto = 'N/A';
      if (sessionLogs.length > 3) {
          try {
              const { summary } = await generateSessionSummary({ sessionLogs: sessionLogs.slice(-20) });
              manifesto = summary;
          } catch (e) {
              console.error(e);
              manifesto = 'Error generating manifesto.';
          }
      }
      
      // 3. Construct Session Object
      const sessionData = {
          userId: user.uid,
          timestamp: new Date().toISOString(),
          modesUsed: Array.from(sessionModesUsedRef.current),
          motionAvg: parseFloat(motionAvg.toFixed(2)),
          audioAvg: parseFloat(audioAvg.toFixed(2)),
          manifesto: manifesto,
      };

      // 4. Save to Firestore
      addDocumentNonBlocking(sessionsCollectionRef, sessionData);
      addLog('SESIÓN ARCHIVADA', false);
      setIsLoadingAI(false);
    }

    // Reset session trackers
    sessionMetricsRef.current = { motionSum: 0, audioSum: 0, frameCount: 0 };
    sessionModesUsedRef.current.clear();
    setSessionLogs([]);

    setIsSystemActive(false);
    await closeAudioContext();
    setUiMotionScore(0);
    motionScoreRef.current = 0;
    setIsRecording(false);
    addLog('SISTEMA APAGADO', false);
  };
  
  return {
    appStarted,
    setAppStarted,
    activeMode,
    setActiveMode: setActiveModeHandler,
    activeFilter,
    setActiveFilter,
    autoMode,
    setAutoMode,
    isSystemActive,
    isScanning,
    isRecording,
    galleryMode,
    setGalleryMode,
    fullscreen,
    setFullscreen,
    audioBand,
    setAudioBand,
    osdMessage,
    controls,
    presets,
    uiMotionScore,
    uiAudioScore,
    uiCentroid,
    logs,
    sessionLogs,
    audioEnabled,
    audioConfig,
    setAudioConfig,
    recordingTime,
    glitchActive,
    activeZone,
    isLoadingAI,
    videoRef,
    canvasRef,
    displayCanvasRef,
    oscCanvasRef,
    updateControl,
    savePreset,
    loadPreset,
    addLog,
    callGeminiPoet,
    startRecording,
    stopRecording,
    takeSnapshot,
    startCamera,
    stopSystem,
    fps,
    firestoreSessions,
  };
}

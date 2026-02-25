"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

type AudioConfig = {
  melody: boolean;
  drone: boolean;
  noise: boolean;
  mic: boolean;
};

// This hook will encapsulate all audio logic.
export function useAudio(addLog: (text: string, record?: boolean) => void) {
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({ melody: true, drone: true, noise: true, mic: true });
  const [audioBand, setAudioBand] = useState('LOW');
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Refs for audio nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Synth refs
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const droneRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);

  // Sync refs with state
  const audioConfigRef = useRef(audioConfig);
  useEffect(() => { audioConfigRef.current = audioConfig; }, [audioConfig]);

  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);

  const toggleMasterMute = useCallback((shouldEnable: boolean) => {
    if (!audioContextRef.current || !masterGainRef.current) return;
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    masterGainRef.current.gain.setTargetAtTime(shouldEnable ? 1 : 0, audioContextRef.current.currentTime, 0.1);
    setAudioEnabled(shouldEnable);
  }, []);

  const initAudio = useCallback(async () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
        if (audioContextRef.current.state === 'running') { toggleMasterMute(true); return; }
        audioContextRef.current.close();
    }
    audioContextRef.current = new AudioContext();
    const ctx = audioContextRef.current;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(1, ctx.currentTime);
    masterGainRef.current = masterGain;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512; 
    masterGain.connect(analyser);
    analyserRef.current = analyser;

    // Melody Oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth'; 
    osc.connect(gain); gain.connect(masterGain); gain.gain.setValueAtTime(0, ctx.currentTime); osc.start();
    oscRef.current = osc; gainNodeRef.current = gain;
    
    // Drone Oscillator
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.value = 55;
    drone.connect(droneGain); droneGain.connect(masterGain); droneGain.gain.value = 0; drone.start();
    droneRef.current = drone; droneGainRef.current = droneGain;

    // Noise Generator
    const noiseGain = ctx.createGain();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseNode.connect(noiseGain);
    noiseNode.start();
    noiseGain.gain.value = 0; 
    noiseGain.connect(masterGain);
    noiseGainRef.current = noiseGain;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = ctx.createMediaStreamSource(stream);
        const micAnalyser = ctx.createAnalyser();
        micAnalyser.fftSize = 512;
        source.connect(micAnalyser);
        micAnalyserRef.current = micAnalyser;
    } catch (e) { addLog("MIC: ERROR", false); }
    setAudioEnabled(true);
  }, [addLog, toggleMasterMute]);
  
  const updateAudio = useCallback((intensity: number, xPos: number, yPos: number, motionScore: number, audioGain: number) => {
    if (!audioContextRef.current || !audioEnabledRef.current || audioContextRef.current.state === 'closed') return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const config = audioConfigRef.current; 
    
    const userGain = audioGain / 50; 

    // Melody
    const melodyVol = config.melody ? Math.min((intensity / 100) * 0.4, 0.4) * userGain : 0;
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(melodyVol, now, 0.2);
    const pitch = 100 + (xPos * 400);
    if(oscRef.current) oscRef.current.frequency.setTargetAtTime(pitch, now, 0.1);

    // Drone
    const droneVol = config.drone ? (0.1 + yPos * 0.2) * userGain : 0;
    if (droneGainRef.current) droneGainRef.current.gain.setTargetAtTime(droneVol, now, 0.5);
    if (droneRef.current) {
        const dronePitch = 55 + (1 - yPos) * 55;
        droneRef.current.frequency.setTargetAtTime(dronePitch, now, 0.5);
    }
    
    // Noise
    const noiseVol = config.noise ? (motionScore / 250) * userGain : 0;
    if (noiseGainRef.current) noiseGainRef.current.gain.setTargetAtTime(noiseVol, now, 0.3);
  }, []);

  const closeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioEnabled(false);
  }, []);

  return {
    audioConfig,
    setAudioConfig,
    audioBand,
    setAudioBand,
    audioEnabled,
    micAnalyserRef,
    initAudio,
    updateAudio,
    closeAudioContext,
  };
}

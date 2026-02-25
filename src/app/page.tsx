"use client";

import { useKinefoniaState } from '@/hooks/useKinefoniaState';
import { CAMERA_FILTERS, MODES, MODE_PARAMS } from '@/lib/kinefonia/constants';
import {
  Aperture,
  Archive,
  EyeOff,
  Film,
  Gauge,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Radio,
  Save,
  Sparkles,
  Square,
  Target,
} from 'lucide-react';
import React, { useState } from 'react';
import type { FilterId, ModeId } from '@/lib/kinefonia/types';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SystemLog } from '@/components/SystemLog';
import { Button } from '@/components/ui/button';
import { SessionGallery } from '@/components/SessionGallery';

export default function KinefoniaPage() {
  const {
    appStarted,
    setAppStarted,
    activeMode,
    setActiveMode,
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
    uiAudioScore,
    uiCentroid,
    audioConfig,
    setAudioConfig,
    recordingTime,
    glitchActive,
    isLoadingAI,
    videoRef,
    canvasRef,
    displayCanvasRef,
    updateControl,
    savePreset,
    loadPreset,
    callGeminiPoet,
    startRecording,
    stopRecording,
    takeSnapshot,
    startCamera,
    stopSystem,
    fps,
    logs,
    firestoreSessions,
  } = useKinefoniaState();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  if (!appStarted) {
    return (
       <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl border-l-4 border-primary pl-6 py-4 animate-fade-in-up">
              <div className="w-64 mx-auto mb-6">
              <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 viewBox="0 0 884.2 387.8" xmlSpace="preserve" className="fill-white">
<g>
	<g>
		<path d="M403.9,258.6c-2.3,0-4.5-0.4-6.4-1.2c-2-0.8-3.7-1.9-5.1-3.3c-1.4-1.4-2.6-3.1-3.4-5s-1.2-4-1.2-6.2
			s0.4-4.3,1.2-6.2c0.8-1.9,1.9-3.6,3.4-5s3.2-2.5,5.1-3.3s4.1-1.2,6.4-1.2c2.2,0,4.3,0.4,6.3,1.1c2,0.7,3.6,1.9,5,3.4l-2.1,2.1
			c-1.3-1.3-2.7-2.2-4.2-2.8s-3.2-0.9-4.9-0.9c-1.8,0-3.6,0.3-5.1,0.9c-1.6,0.6-3,1.5-4.1,2.7c-1.2,1.2-2.1,2.5-2.8,4
			c-0.7,1.5-1,3.2-1,5.1c0,1.8,0.3,3.5,1,5.1c0.7,1.5,1.6,2.9,2.8,4c1.2,1.2,2.6,2.1,4.1,2.7c1.6,0.6,3.3,0.9,5.1,0.9
			c1.8,0,3.4-0.3,4.9-0.9c1.5-0.6,2.9-1.5,4.2-2.8l2.1,2.1c-1.3,1.5-3,2.6-5,3.4C408.3,258.3,406.1,258.6,403.9,258.6z"/>
		<path d="M452.7,258.6c-2.3,0-4.5-0.4-6.4-1.2c-2-0.8-3.7-1.9-5.1-3.3c-1.5-1.4-2.6-3.1-3.4-5s-1.2-4-1.2-6.2
			s0.4-4.3,1.2-6.2c0.8-1.9,1.9-3.5,3.4-5s3.2-2.5,5.1-3.3c2-0.8,4.1-1.2,6.5-1.2c2.3,0,4.5,0.4,6.4,1.2s3.7,1.9,5.1,3.3
			c1.5,1.4,2.6,3.1,3.4,5s1.2,4,1.2,6.2s-0.4,4.3-1.2,6.2c-0.8,1.9-1.9,3.6-3.4,5s-3.2,2.5-5.1,3.3S455,258.6,452.7,258.6z
			 M452.7,255.7c1.8,0,3.6-0.3,5.1-0.9c1.6-0.6,2.9-1.5,4.1-2.7s2.1-2.5,2.7-4s1-3.2,1-5.1c0-1.8-0.3-3.5-1-5.1
			c-0.6-1.5-1.5-2.9-2.7-4c-1.2-1.2-2.5-2.1-4.1-2.7c-1.6-0.6-3.3-0.9-5.1-0.9s-3.6,0.3-5.1,0.9c-1.6,0.6-3,1.5-4.1,2.7
			c-1.2,1.2-2.1,2.5-2.7,4s-1,3.2-1,5.1c0,1.8,0.3,3.5,1,5.1c0.6,1.6,1.6,2.9,2.7,4.1c1.2,1.2,2.6,2.1,4.1,2.7
			C449.2,255.4,450.9,255.7,452.7,255.7z"/>
		<path d="M495.3,258.4v-30.8h3.3v28h17.2v2.8H495.3z"/>
		<path d="M540.3,258.4v-30.8h21.1v2.8h-17.9v25.2H562v2.8H540.3z M543.2,244.1v-2.8h16.3v2.8H543.2z"/>
		<path d="M602,258.6c-2.3,0-4.5-0.4-6.4-1.2c-2-0.8-3.7-1.9-5.1-3.3s-2.6-3.1-3.4-5c-0.8-1.9-1.2-4-1.2-6.2
			s0.4-4.3,1.2-6.2s1.9-3.6,3.4-5s3.2-2.5,5.1-3.3c2-0.8,4.1-1.2,6.4-1.2c2.2,0,4.3,0.4,6.3,1.1c2,0.7,3.6,1.9,5,3.4l-2.1,2.1
			c-1.3-1.3-2.7-2.2-4.2-2.8s-3.2-0.9-4.9-0.9c-1.8,0-3.6,0.3-5.1,0.9c-1.6,0.6-3,1.5-4.1,2.7c-1.2,1.2-2.1,2.5-2.8,4s-1,3.2-1,5.1
			c0,1.8,0.3,3.5,1,5.1c0.7,1.5,1.6,2.9,2.8,4c1.2,1.2,2.6,2.1,4.1,2.7c1.6,0.6,3.3,0.9,5.1,0.9s3.4-0.3,4.9-0.9
			c1.5-0.6,2.9-1.5,4.2-2.8l2.1,2.1c-1.3,1.5-3,2.6-5,3.4C606.3,258.3,604.2,258.6,602,258.6z"/>
		<path d="M644.4,258.4v-28h-10.8v-2.8h24.9v2.8h-10.8v28H644.4z"/>
		<path d="M682.8,258.4v-30.8h3.3v30.8H682.8z"/>
		<path d="M723.3,258.4l-13.6-30.8h3.5l12.8,29h-2l12.8-29h3.3l-13.6,30.8L723.3,258.4L723.3,258.4z"/>
		<path d="M776.9,258.6c-2.3,0-4.5-0.4-6.4-1.2c-2-0.8-3.7-1.9-5.1-3.3c-1.5-1.4-2.6-3.1-3.4-5c-0.8-1.9-1.2-4-1.2-6.2
			s0.4-4.3,1.2-6.2s1.9-3.5,3.4-5s3.2-2.5,5.1-3.3c2-0.8,4.1-1.2,6.5-1.2c2.3,0,4.5,0.4,6.4,1.2c2,0.8,3.7,1.9,5.1,3.3
			c1.5,1.4,2.6,3.1,3.4,5c0.8,1.9,1.2,4,1.2,6.2s-0.4,4.3-1.2,6.2s-1.9,3.6-3.4,5s-3.2,2.5-5.1,3.3
			C781.4,258.3,779.2,258.6,776.9,258.6z M776.9,255.7c1.8,0,3.6-0.3,5.1-0.9c1.6-0.6,2.9-1.5,4.1-2.7c1.2-1.2,2.1-2.5,2.7-4
			c0.6-1.5,1-3.2,1-5.1c0-1.8-0.3-3.5-1-5.1c-0.6-1.5-1.5-2.9-2.7-4c-1.2-1.2-2.5-2.1-4.1-2.7c-1.6-0.6-3.3-0.9-5.1-0.9
			s-3.6,0.3-5.1,0.9c-1.6,0.6-3,1.5-4.1,2.7c-1.2,1.2-2.1,2.5-2.7,4s-1,3.2-1,5.1c0,1.8,0.3,3.5,1,5.1c0.6,1.6,1.6,2.9,2.7,4.1
			c1.2,1.2,2.6,2.1,4.1,2.7C773.4,255.4,775.1,255.7,776.9,255.7z"/>
	</g>
</g>
<g>
	<g>
		<g>
			<g>
				<g>
					<path d="M445,196.4l-44.6-40.3v40.3h-13v-67.7h1.4l44.6,40.9v-40.9h13v67.7L445,196.4L445,196.4z"/>
					<path d="M490.3,197.6c-4.4,0-8.4-0.7-11.9-2.1c-3.6-1.4-6.6-3.3-9.2-5.8c-2.5-2.5-4.5-5.5-5.9-9s-2.1-7.4-2.1-11.8
						v-40.4h13V169c0,3.4,0.6,6.2,1.7,8.4s2.5,4,4.1,5.3s3.4,2.2,5.3,2.7s3.6,0.7,5,0.7s3.2-0.2,5-0.7c1.9-0.5,3.6-1.4,5.3-2.7
						c1.6-1.3,3-3.1,4.1-5.3s1.7-5,1.7-8.4v-40.4h13V169c0,4.3-0.7,8.2-2,11.8c-1.4,3.5-3.3,6.5-5.8,9s-5.6,4.4-9.2,5.8
						C498.8,197,494.7,197.6,490.3,197.6z M494,111.4l10.7,4.6l-12.4,9.4h-9.2L494,111.4z"/>
					<path d="M596.3,179.8c-1.5,2.7-3.3,5.2-5.5,7.4s-4.6,4.1-7.2,5.6c-2.6,1.6-5.5,2.8-8.5,3.7s-6.2,1.3-9.5,1.3
						c-4.8,0-9.4-0.9-13.6-2.8s-8-4.4-11.2-7.5c-3.2-3.2-5.7-6.9-7.5-11.2s-2.8-8.8-2.8-13.6s0.9-9.4,2.8-13.6s4.4-8,7.5-11.2
						c3.2-3.2,6.9-5.7,11.2-7.5s8.8-2.8,13.6-2.8c3.3,0,6.4,0.4,9.5,1.3s5.9,2.1,8.5,3.7c2.6,1.6,5,3.5,7.2,5.7s4,4.6,5.5,7.3
						l-12.1,4.9c-1-1.5-2.1-2.9-3.5-4.2c-1.3-1.3-2.8-2.4-4.4-3.4c-1.6-1-3.3-1.8-5.1-2.3s-3.6-0.8-5.6-0.8c-3.1,0-6,0.6-8.7,1.9
						c-2.7,1.3-5,2.9-7,5s-3.6,4.6-4.7,7.4c-1.2,2.8-1.8,5.7-1.8,8.8s0.6,6,1.8,8.8s2.7,5.2,4.7,7.3s4.3,3.8,7,5
						c2.7,1.3,5.6,1.9,8.7,1.9c1.9,0,3.8-0.3,5.6-0.8s3.5-1.3,5.1-2.3s3.1-2.1,4.4-3.5c1.3-1.3,2.5-2.7,3.5-4.2L596.3,179.8z"/>
					<path d="M655.1,185v11.5h-48.8v-67.8h13V185H655.1z"/>
					<path d="M676.2,140.1v17H709v11.8h-32.8v15.9h37v11.7h-49.9v-67.8h49.9v11.5L676.2,140.1L676.2,140.1z"/>
					<path d="M758.2,197.7c-4.8,0-9.4-0.9-13.6-2.8s-8-4.4-11.2-7.5c-3.2-3.2-5.7-6.9-7.5-11.2s-2.8-8.8-2.8-13.7
						c0-4.8,0.9-9.4,2.8-13.7s4.4-8,7.5-11.2c3.2-3.2,6.9-5.7,11.2-7.5s8.8-2.8,13.6-2.8c4.9,0,9.4,0.9,13.7,2.8s8,4.4,11.2,7.5
						c3.2,3.2,5.7,6.9,7.5,11.2s2.8,8.8,2.8,13.7s-0.9,9.4-2.8,13.7s-4.4,8-7.5,11.2c-3.2,3.2-6.9,5.7-11.2,7.5
						S763.1,197.7,758.2,197.7z M758.2,139.5c-3.1,0-6,0.6-8.6,1.9c-2.7,1.3-5,2.9-7,5s-3.6,4.6-4.8,7.4c-1.2,2.8-1.8,5.7-1.8,8.8
						s0.6,6,1.8,8.8s2.8,5.2,4.8,7.4c2,2.1,4.3,3.8,7,5.1s5.6,1.9,8.6,1.9c3.1,0,6-0.6,8.6-1.9c2.7-1.3,5-3,7-5.1s3.6-4.6,4.8-7.4
						c1.2-2.8,1.8-5.7,1.8-8.8c0-3-0.6-5.9-1.8-8.8c-1.2-2.8-2.8-5.3-4.8-7.4c-2-2.1-4.3-3.8-7-5
						C764.2,140.1,761.3,139.5,758.2,139.5z"/>
				</g>
			</g>
		</g>
		<g>
			<path d="M180.7,206.9l21.8,11.9c0.5,0.3,1,0.4,1.5,0.4s1-0.1,1.5-0.4l21.8-11.9c1-0.6,1.6-1.6,1.6-2.8v-23.8
				c0-1.2-0.6-2.2-1.6-2.8l-21.8-11.9c-0.9-0.5-2.1-0.5-3,0l-21.8,11.9c-1,0.6-1.6,1.6-1.6,2.8v23.8
				C179.1,205.3,179.7,206.3,180.7,206.9z M185.3,182.2L204,172l18.7,10.2v20.1L204,212.4l-18.7-10.2V182.2z"/>
			<path d="M313.8,196.4l-61-33.3c-0.1-0.1-0.1-0.1-0.2-0.1l-0.1-0.1c-0.2-0.1-0.4-0.3-0.6-0.4l-35.7-19.4l14.2-7.7
				c26.1,14.3,61.6,34.3,62,34.5c0.5,0.3,1,0.4,1.5,0.4c1.1,0,2.2-0.6,2.7-1.6c0.9-1.5,0.3-3.4-1.2-4.3
				c-0.4-0.2-32.8-18.5-58.5-32.6l17.2-9.4l41.5,22.9c0.2,0.1,0.5,0.2,0.8,0.2c0.6,0,1.1-0.3,1.4-0.8c0.4-0.8,0.1-1.7-0.6-2.1
				l-39.7-21.9l13.7-7.4c2.8-1.5,3.8-5,2.3-7.8s-5-3.8-7.8-2.3l-63.4,34.5c-0.3,0.1-0.6,0.2-1,0.4L164.8,158v-15l82.7-44.9
				c1.5-0.8,2.1-2.7,1.3-4.3c-0.8-1.5-2.7-2.1-4.3-1.3l-79.7,43.2v-19.4l40-21.8c0.8-0.4,1-1.4,0.6-2.1c-0.4-0.8-1.4-1-2.1-0.6
				l-38.5,21v-15c0-3.2-2.6-5.8-5.8-5.8s-5.8,2.6-5.8,5.8v68.8c-0.1,0.3-0.1,0.7-0.1,1v39.3l-14-7.6v-68.1c0-1.7-1.4-3.1-3.1-3.1
				s-3.1,1.4-3.1,3.1v64.7l-18-9.8v-41.9c0-0.9-0.7-1.6-1.6-1.6s-1.6,0.7-1.6,1.6v40.2L98,177c-2.8-1.5-6.3-0.5-7.8,2.3
				s-0.5,6.3,2.3,7.8l62.8,34.2c0.2,0.2,0.5,0.4,0.8,0.5l36.2,19.8l-13.2,7.2l-44.2-24.1L114,212.9c-1.5-0.9-3.4-0.3-4.3,1.2
				s-0.3,3.4,1.2,4.3l20.9,11.8l40.6,22.1l-18.1,9.9c-5.3-2.9-12.3-6.8-19-10.5c-9-5-17.6-9.7-21.3-11.7c-0.8-0.4-1.7-0.1-2.1,0.6
				c-0.4,0.8-0.1,1.7,0.6,2.1c3.7,2,12.2,6.7,21.3,11.7c6.1,3.3,12.2,6.8,17.3,9.5l-13.2,7.2c-2.8-1.5-3.8,5-2.3,7.8
				c1,1.9,3,3,5.1,3c0.9,0,1.9-0.2,2.8-0.7l99.9-54.4V241l-40.9,22.6l-20.9,11.8c-1.5,0.9-2,2.8-1.2,4.3c0.6,1,1.6,1.6,2.7,1.6
				c0.5,0,1.1-0.1,1.5-0.4l20.9-11.8l37.8-20.9v19.6l-40.1,21.9c-0.8,0.4-1,1.4-0.6,2.1c0.3,0.5,0.8,0.8,1.4,0.8
				c0.3,0,0.5-0.1,0.8-0.2l38.6-21.1v14.2c0,3.2,2.6,5.8,5.8,5.8s5.8-2.6,5.8-5.8v-68.9v-39.2l14,7.6v67c0,1.7,1.4,3.1,3.1,3.1
				s3.1-1.4,3.1-3.1v-63.5l18,9.8v42.6c0,0.9,0.7,1.6,1.6,1.6s1.6-0.7,1.6-1.6V200l12,6.5c0.9,0.5,1.8,0.7,2.8,0.7c2,0,4-1.1,5.1-3
				C317.6,201.5,316.6,198,313.8,196.4z M204,149.6l39.3,21.5v42.2L204,234.7l-37.1-20.3c-0.3-0.2-0.5-0.4-0.8-0.5l-1.3-0.7V171
				L204,149.6z"/>
		</g>
	</g>
</g>
</svg>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-2 glitch-text tracking-tighter font-headline">KINEFONÍA</h1>
              <h2 className="text-xl md:text-2xl text-accent font-code tracking-[0.5em] mb-8">GENERATIVE ART STUDIO</h2>
              <button onClick={() => setAppStarted(true)} className="group relative px-8 py-4 bg-white text-black font-black text-lg tracking-widest hover:bg-primary hover:text-white transition-all clip-path-button overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2 font-headline">INGRESAR AL SISTEMA <Sparkles size={16}/></span>
                  <div className="absolute inset-0 bg-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20"></div>
              </button>
          </div>
          <div className="absolute bottom-4 text-xs text-gray-500 font-code tracking-widest">
            MANUEL PALACIO / NÚCLEO COLECTIVO 2026
          </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
        {osdMessage && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[60] bg-black/80 border border-primary px-6 py-2 text-primary font-black text-xl tracking-[0.3em] animate-pulse font-headline">{osdMessage}</div>}
        
        <SidebarInset className="p-2">
          {/* Main Display Panel */}
          <div className={`flex flex-col gap-2 relative border border-primary/30 bg-[#0a0a0f] p-2 h-full transition-all duration-500 text-gray-300 font-body selection:bg-primary selection:text-white ${galleryMode || fullscreen ? 'fixed inset-0 z-40 bg-black p-0 border-0' : ''} ${glitchActive ? 'glitch-container' : ''}`}>
            {(!galleryMode && !fullscreen) && (
              <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                <div>
                  <h1 className="text-xl font-black tracking-[0.2em] text-white glitch-text font-headline">KINEFONÍA <span className="text-primary text-[10px] font-normal tracking-normal font-code">Generative Art Studio</span></h1>
                  <p className="text-[10px] text-accent font-code tracking-wider">SYSTEM_ULTRA // {MODES[activeMode].label}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold font-code">
                  <Button variant="ghost" size="sm" className="h-auto px-2 py-1 bg-black/50 hover:bg-white/20 text-gray-400 hover:text-white" onClick={() => setIsGalleryOpen(true)}>
                    <Archive size={12} className="mr-1"/> ARCHIVO
                  </Button>
                  <span className="text-gray-500 w-16 text-right">{fps} FPS</span>
                  <span className={isRecording ? "text-primary animate-pulse" : "text-gray-600"}>{isRecording ? `REC ${recordingTime}s` : "STANDBY"}</span>
                  <div className={`px-2 py-0.5 text-[10px] border border-current ${isSystemActive ? 'text-accent border-accent shadow-[0_0_10px_theme(colors.accent)]' : 'text-gray-600 border-gray-600'}`}>{isSystemActive ? 'ONLINE' : 'OFFLINE'}</div>
                  <SidebarTrigger className="bg-black/50 hover:bg-white/20 text-gray-400" />
                </div>
              </div>
            )}
            <div className={`relative bg-black flex-1 overflow-hidden flex items-center justify-center group ${!galleryMode && !fullscreen ? 'min-h-[400px] border border-gray-900' : 'w-full h-full'}`}>
              {!isSystemActive && !isScanning && <div className="text-center text-gray-800"><Aperture className="w-24 h-24 mx-auto mb-4 opacity-20" /><p className="text-xs tracking-[0.5em] font-bold font-code">NO SIGNAL</p></div>}
              {isScanning && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40"><Target className="w-16 h-16 text-primary animate-spin opacity-80 mb-4" /><p className="text-xs text-primary animate-pulse font-code">INICIALIZANDO...</p></div>}
              <canvas ref={canvasRef} className="hidden" />
              <div className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${isRecording ? 'border-4 border-red-600 opacity-100 animate-pulse' : 'opacity-0'}`}></div>
              <video ref={videoRef} style={{ filter: CAMERA_FILTERS[activeFilter].filter }} className={`absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 ${glitchActive ? 'scale-[1.02] translate-x-1' : ''}`} muted playsInline />
              <canvas ref={displayCanvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-screen" />
              {isSystemActive && (
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30">
                      {(!galleryMode && !fullscreen) && <div className="flex justify-between text-[10px] text-cyan-700 font-code"><span>INPUT: CAM_01</span><span className={uiAudioScore > 20 ? 'text-primary font-bold' : ''}>DB: {uiAudioScore.toFixed(0)}</span></div>}
                      {activeMode !== 'POETIC' && <div className="absolute w-4 h-4 border border-accent rounded-full transition-all duration-100" style={{ left: `${uiCentroid.x * 100}%`, top: `${uiCentroid.y * 100}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 0 10px var(--tw-color-accent)' }} />}
                  </div>
              )}
              <div className="absolute top-4 right-4 z-50 flex gap-2">
                  <button onClick={() => setFullscreen(!fullscreen)} className={`p-2 transition-all rounded-full bg-black/50 hover:bg-white/20 ${fullscreen ? 'text-primary' : 'text-gray-400'}`}>{fullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button>
                  <button onClick={() => setGalleryMode(!galleryMode)} className={`p-2 transition-all rounded-full bg-black/50 hover:bg-white/20 ${galleryMode ? 'text-white' : 'text-gray-400'}`}>{galleryMode ? <EyeOff size={16}/> : <Monitor size={16}/>}</button>
              </div>
            </div>
          </div>
        </SidebarInset>

        {!galleryMode && !fullscreen && (
          <Sidebar side="right" variant="sidebar" className="bg-[#0a0a0f] border-l border-primary/30 p-2 font-code">
            <SidebarContent asChild>
              <div className="flex flex-col h-full overflow-hidden">
                <ScrollArea className="pr-2 -mr-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                      {!isSystemActive ? <button onClick={startCamera} disabled={isScanning} className="col-span-2 py-4 bg-primary hover:bg-white hover:text-primary text-white font-black text-xs tracking-widest transition-all clip-path-button font-headline">{isScanning ? 'CARGANDO...' : 'EJECUTAR'}</button> : <button onClick={stopSystem} className="col-span-2 py-4 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-700 font-bold text-xs tracking-widest transition-all font-headline">ABORTAR</button>}
                      <button onClick={isRecording ? stopRecording : startRecording} disabled={!isSystemActive} className={`py-2 text-[10px] border font-bold transition-colors flex items-center justify-center gap-1 ${isRecording ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'border-gray-800 text-gray-500 hover:border-white hover:text-white'}`}>{isRecording ? <><Square size={8} fill="currentColor"/> DETENER</> : <><Film size={10}/> GRABAR</>}</button>
                      <button onClick={takeSnapshot} disabled={!isSystemActive} className="py-2 text-[10px] border border-gray-800 text-gray-500 hover:text-accent hover:border-accent transition-colors flex items-center justify-center gap-1 font-bold"><Save size={10} /> FOTO</button>
                      <button onClick={callGeminiPoet} disabled={!isSystemActive || isLoadingAI} className={`col-span-2 py-3 text-[10px] border transition-colors flex items-center justify-center gap-2 font-bold ${isLoadingAI ? 'bg-yellow-900/20 border-yellow-800 text-yellow-600' : 'bg-transparent border-accent/30 text-accent hover:bg-accent/10'}`}><Sparkles size={12} /> {isLoadingAI ? 'PROCESANDO...' : 'CONSULTAR ORÁCULO'}</button>
                  </div>

                  <div className="border-t border-gray-800 pt-2 mb-2">
                    <h3 className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2 flex items-center gap-2"><Layers size={10}/> SISTEMA</h3>
                    <div className="space-y-3 text-xs px-1">
                        <div>
                            <label htmlFor="filter-select" className="text-[9px] text-gray-400 font-bold mb-1 block">FILTRO CÁMARA</label>
                            <select id="filter-select" value={activeFilter} onChange={e => setActiveFilter(e.target.value as FilterId)} className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded p-1.5">
                                {(Object.keys(CAMERA_FILTERS) as FilterId[]).map(filterId => (
                                    <option key={filterId} value={filterId}>{CAMERA_FILTERS[filterId].label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold mb-1 block">BANDA MICRÓFONO</label>
                            <div className="grid grid-cols-3 gap-1">
                                {['LOW', 'MID', 'HIGH'].map(band => (
                                    <button key={band} onClick={() => setAudioBand(band)} className={`flex-1 text-[9px] py-1 border font-bold rounded-sm transition-colors ${audioBand === band ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:text-white'}`}>{band}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <input type="checkbox" id="auto-mode" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} className="accent-primary h-3 w-3"/>
                            <label htmlFor="auto-mode" className="text-[10px] font-bold">PILOTO AUTOMÁTICO</label>
                        </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-2 mb-2">
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="text-[10px] text-primary uppercase tracking-wider font-bold flex items-center gap-2"><Gauge size={10}/> AJUSTES</h3>
                          <div className="flex gap-1">{[0, 1, 2].map(i => (<button key={i} onClick={(e) => { if(e.shiftKey) savePreset(i); else loadPreset(i); }} className="w-4 h-4 bg-gray-800 hover:bg-accent text-[8px] flex items-center justify-center text-white font-bold rounded-sm" title="Click: Cargar / Shift+Click: Guardar">{i+1}</button>))}</div>
                      </div>
                      <div className="space-y-3 mb-2 px-1">
                          <div className="grid grid-cols-2 gap-2">
                              <div><div className="flex justify-between text-[8px] text-gray-500 font-bold mb-1"><span>SENSIBILIDAD</span><span className="text-accent">{controls.sensitivity}%</span></div><input type="range" min="0" max="100" value={controls.sensitivity} onChange={(e) => updateControl('sensitivity', parseInt(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"/></div>
                              <div><div className="flex justify-between text-[8px] text-gray-500 font-bold mb-1"><span>GAIN AUDIO</span><span className="text-accent">{controls.audioGain}%</span></div><input type="range" min="0" max="100" value={controls.audioGain} onChange={(e) => updateControl('audioGain', parseInt(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"/></div>
                          </div>
                          <div className="border-t border-gray-800 pt-2 space-y-2">
                              {(['p1', 'p2', 'p3'] as const).map(p => (
                                  <div key={p}>
                                    <div className="flex justify-between text-[9px] text-gray-400 font-bold mb-1">
                                      <span>{MODE_PARAMS[activeMode][p].label}</span>
                                      <span className="text-white">{controls[p]}</span>
                                    </div>
                                    <input type="range" min={MODE_PARAMS[activeMode][p].min} max={MODE_PARAMS[activeMode][p].max} value={controls[p]} onChange={(e) => updateControl(p, parseInt(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent"/>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="border-t border-gray-800 pt-2 mb-2">
                      <h3 className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2 flex items-center gap-2"><Radio size={10}/> CONTROL AUDIO</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs px-1">
                          <div className="flex items-center gap-2">
                              <input type="checkbox" id="melody-switch" checked={audioConfig.melody} onChange={(e) => setAudioConfig(p => ({...p, melody: e.target.checked}))} className="accent-primary h-3 w-3"/>
                              <label htmlFor="melody-switch" className="text-[10px] font-bold">MELODÍA</label>
                          </div>
                          <div className="flex items-center gap-2">
                              <input type="checkbox" id="drone-switch" checked={audioConfig.drone} onChange={(e) => setAudioConfig(p => ({...p, drone: e.target.checked}))} className="accent-primary h-3 w-3"/>
                              <label htmlFor="drone-switch" className="text-[10px] font-bold">DRON</label>
                          </div>
                          <div className="flex items-center gap-2">
                              <input type="checkbox" id="noise-switch" checked={audioConfig.noise} onChange={(e) => setAudioConfig(p => ({...p, noise: e.target.checked}))} className="accent-primary h-3 w-3"/>
                              <label htmlFor="noise-switch" className="text-[10px] font-bold">RUIDO</label>
                          </div>
                          <div className="flex items-center gap-2">
                              <input type="checkbox" id="mic-switch" checked={audioConfig.mic} onChange={(e) => setAudioConfig(p => ({...p, mic: e.target.checked}))} className="accent-primary h-3 w-3"/>
                              <label htmlFor="mic-switch" className="text-[10px] font-bold">MIC</label>
                          </div>
                      </div>
                  </div>

                  <div className="border-t border-gray-800 pt-2">
                      <h3 className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2">Protocolo Visual</h3>
                      <div className="grid grid-cols-2 gap-1 mb-4">
                          {(Object.keys(MODES) as ModeId[]).map(modeId => {
                            const mode = MODES[modeId];
                            return (
                              <button key={mode.id} onClick={() => setActiveMode(mode.id)} className={`text-[9px] py-2 px-2 text-left truncate transition-all border flex items-center gap-2 font-bold ${activeMode === mode.id ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'}`}>
                                  <mode.Icon size={12} /> {mode.label}
                              </button>
                            );
                          })}
                      </div>
                  </div>
                </ScrollArea>
                <SystemLog logs={logs} />
              </div>
            </SidebarContent>
          </Sidebar>
        )}

        <SessionGallery sessions={firestoreSessions} isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} />

    </SidebarProvider>
  );
}

'use client';

import type { Session } from '@/lib/kinefonia/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Droplets, Film } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionGalleryProps {
  sessions: Session[] | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SessionGallery({ sessions, isOpen, onOpenChange }: SessionGalleryProps) {
  const sortedSessions = sessions ? [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0f] border-primary/30 max-w-4xl h-[80vh] flex flex-col font-code text-gray-300">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary glitch-text">ARCHIVO DE SESIONES</DialogTitle>
          <DialogDescription className="text-accent font-code tracking-wider">
            Un registro vivo de exploraciones generativas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          {sortedSessions && sortedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {sortedSessions.map((session) => (
                <Card key={session.id} className="bg-black/40 border-gray-800 hover:border-accent transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-accent text-base leading-tight font-mono">
                      &quot;{session.manifesto}&quot;
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-xs pt-1">
                      {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true, locale: es })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-xs">
                     <div className="flex items-center gap-2 text-gray-400">
                        <Activity size={14} className="text-primary/70"/>
                        <span>Movimiento: <span className="text-white font-bold">{session.motionAvg.toFixed(1)}%</span></span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-400">
                        <Droplets size={14} className="text-primary/70"/>
                        <span>Audio: <span className="text-white font-bold">{session.audioAvg.toFixed(1)}%</span></span>
                     </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-wrap gap-1.5">
                       {session.modesUsed.map(mode => (
                          <Badge key={mode} variant="outline" className="text-[10px] border-gray-700 bg-gray-900/50 text-gray-400">{mode}</Badge>
                       ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-center text-gray-700">
                <div>
                  <Film size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">No hay sesiones archivadas.</p>
                  <p className="text-xs">Completa una sesión para verla aquí.</p>
                </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

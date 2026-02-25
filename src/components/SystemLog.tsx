'use client';

import type { LogEntry } from '@/lib/kinefonia/types';
import { ScrollArea } from './ui/scroll-area';
import React from 'react';

export function SystemLog({ logs }: { logs: LogEntry[] }) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Find the viewport element within the ScrollArea
    const viewport = scrollAreaRef.current?.querySelector<HTMLDivElement>(':scope > div');
    if (viewport) {
      // Scroll to the top when logs change (since new logs are added at the top)
      viewport.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="border-t border-gray-800 pt-2 flex-1 flex flex-col min-h-0 font-code">
      <h3 className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2 px-1">
        &gt;_ SYSTEM LOG
      </h3>
      <ScrollArea className="flex-1 pr-1" ref={scrollAreaRef}>
        <div className="px-1 space-y-1 text-xs">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="text-gray-600">[{log.time}]</span>
                <span className={`flex-1 break-words ${log.text.startsWith('[IA]') || log.text.startsWith('[SYSTEM]') ? 'text-accent' : 'text-gray-400'}`}>{log.text}</span>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";
import { Pause, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface LogsViewerProps {
  logs: string[];
  isStreaming?: boolean;
}

export function LogsViewer({ logs, isStreaming = false }: LogsViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && !isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isPaused]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs {isStreaming && <span className="text-sm text-muted-foreground">(Streaming...)</span>}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              Auto-scroll: {autoScroll ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          <div className="space-y-1 font-mono text-sm" ref={scrollRef}>
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

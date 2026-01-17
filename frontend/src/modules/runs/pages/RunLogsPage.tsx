import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LogsViewer } from "../components/LogsViewer";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL } from "../../../app/env";

export function RunLogsPage() {
  const { id } = useParams<{ id: string }>();
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) return;

    // Start streaming logs
    const startStreaming = async () => {
      setIsStreaming(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(`${API_URL}/runs/${id}/logs/stream`, {
          signal: abortController.signal,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              try {
                const logEntry = JSON.parse(line);
                setLogs((prev) => [...prev, JSON.stringify(logEntry, null, 2)]);
              } catch (e) {
                // If not valid JSON, just add as text
                setLogs((prev) => [...prev, line]);
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          // Stream was aborted, this is expected
          return;
        }
        console.error("Error streaming logs:", error);
      } finally {
        setIsStreaming(false);
      }
    };

    startStreaming();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run Logs"
        description={`Logs for run ${id?.slice(0, 8)}...`}
        actions={
          <Link to={`/runs/${id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Run
            </Button>
          </Link>
        }
      />

      <LogsViewer logs={logs} isStreaming={isStreaming} />
    </div>
  );
}

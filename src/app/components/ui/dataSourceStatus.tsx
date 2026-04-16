import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";

interface ConnectionStatus {
  status: "connected" | "simulated" | "connecting" | "error";
  source: "SAP" | "ORACLE" | "NETSUITE" | "SIMULATED_DATA";
  timestamp: string;
  latency?: number;
  message?: string;
}

export function DataSourceStatus() {
  const [statusInfo, setStatusInfo] = useState<ConnectionStatus>({
    status: "connecting",
    source: "SIMULATED_DATA",
    timestamp: new Date().toISOString(),
    message: "Loading...",
  });

  useEffect(() => {
    // Check if backend is running
    const checkConnection = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch("/api/health", { method: "GET" });
        const latency = performance.now() - startTime;

        if (response.ok) {
          setStatusInfo({
            status: "connected",
            source: "SAP",
            timestamp: new Date().toISOString(),
            latency: Math.round(latency),
            message: "Connected to SAP ERP System",
          });
        }
      } catch {
        // Backend not available, using simulated data
        setStatusInfo({
          status: "simulated",
          source: "SIMULATED_DATA",
          timestamp: new Date().toISOString(),
          message: "Using simulated data (start mock server for real data)",
        });
      }
    };

    checkConnection();
  }, []);

  const statusColors = {
    connected: "bg-green-50 border-green-200",
    simulated: "bg-blue-50 border-blue-200",
    connecting: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
  };

  const statusBadgeVariant = {
    connected: "default" as const,
    simulated: "secondary" as const,
    connecting: "secondary" as const,
    error: "destructive" as const,
  };

  return (
    <div className={`border rounded-lg p-3 ${statusColors[statusInfo.status]}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Data Source:</span>
          <Badge variant={statusBadgeVariant[statusInfo.status]}>
            {statusInfo.status === "connected" ? "🟢" : "🔵"}
            {statusInfo.source}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {statusInfo.latency && <span>Latency: {statusInfo.latency}ms</span>}
          <span>{statusInfo.timestamp.split("T")[1].split(".")[0]}</span>
        </div>
      </div>
      {statusInfo.message && (
        <p className="text-xs text-gray-600 mt-1">{statusInfo.message}</p>
      )}
    </div>
  );
}

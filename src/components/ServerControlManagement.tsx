import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Typography,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CardHeader,
  Slider,
} from "@mui/material";
import {
  CloudUpload,
  Download,
  Info,
  Memory,
  Refresh,
  Save,
  Settings,
  Storage,
  Terminal,
} from "@mui/icons-material";

interface ServerControlPanelProps {
  worldId: string;
  isActive: boolean;
  currentPort: number;
  currentRam: {
    min: number;
    max: number;
  };
  systemRam: number; // Total system RAM in GB
  onToggleServer: () => Promise<void>;
  onRestartServer: () => Promise<void>;
  onPortChange: (port: number) => Promise<void>;
  onRamChange: (ram: { min: number; max: number }) => Promise<void>;
  onDownloadWorld: () => Promise<void>;
  onBackupWorld: () => Promise<void>;
}

interface LogMessage {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  raw: string;
}

export const ServerControlPanel: React.FC<ServerControlPanelProps> = ({
  worldId,
  isActive,
  currentPort,
  currentRam,
  systemRam,
  onToggleServer,
  onRestartServer,
  onPortChange,
  onRamChange,
  onDownloadWorld,
  onBackupWorld,
}) => {
  const [openPortDialog, setOpenPortDialog] = useState(false);
  const [openRamDialog, setOpenRamDialog] = useState(false);
  const [newPort, setNewPort] = useState(currentPort);
  const [newRam, setNewRam] = useState(currentRam);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !wsRef.current) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isActive, worldId]);

  useEffect(() => {
    // Scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const connectWebSocket = () => {
    const wsUrl = `${import.meta.env.VITE_AGENT_URL.replace(
      "http",
      "ws"
    )}/ws/logs/${worldId}`;
    console.log("Connecting to WebSocket:", wsUrl);
    setWsStatus("connecting");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      setError(null);
    };

    ws.onmessage = (event) => {
      const rawLog = event.data;
      const parsedLog = parseLogMessage(rawLog);

      if (parsedLog) {
        setLogs((prev) => [...prev, parsedLog].slice(-500)); // Keep last 500 messages
      } else {
        // Handle unparseable logs by creating a basic INFO message
        const basicLog: LogMessage = {
          timestamp: new Date().toLocaleTimeString(),
          source: "Unknown",
          level: "INFO",
          message: rawLog,
          raw: rawLog,
        };
        setLogs((prev) => [...prev, basicLog].slice(-500));
      }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      wsRef.current = null;
      // Attempt to reconnect after 5 seconds if server is still active
      if (isActive) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    ws.onerror = (err) => {
      setError("WebSocket connection error. Retrying...");
      ws.close();
    };
  };

  const getLogColor = (level: LogMessage["level"]) => {
    switch (level) {
      case "ERROR":
        return "text-red-500";
      case "WARN":
        return "text-yellow-500";
      default:
        return "text-gray-200";
    }
  };

  const parseLogMessage = (rawLog: string): LogMessage | null => {
    // Minecraft log format: [HH:mm:ss] [Source/LEVEL]: Message
    const logRegex = /\[([\d:]+)\] \[([^\/]+)\/([^\]]+)\]: (.+)/;
    const match = rawLog.match(logRegex);

    if (!match) {
      return null;
    }

    const [, timestamp, source, level, message] = match;

    return {
      timestamp,
      source,
      level: level as LogMessage["level"],
      message,
      raw: rawLog,
    };
  };

  const handleAction = async (
    action: () => Promise<void>,
    loadingMessage: string
  ) => {
    setLoading(loadingMessage);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  const handleRamChange = async () => {
    await handleAction(async () => {
      await onRamChange(newRam);
      setOpenRamDialog(false);
    }, "Updating RAM allocation...");
  };

  const handlePortChange = async () => {
    await handleAction(async () => {
      await onPortChange(newPort);
      setOpenPortDialog(false);
    }, "Updating port...");
  };

  const formatRam = (value: number) => `${value}GB`;
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Server Status Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="minecraft-card">
            <CardHeader
              title="Server Status"
              action={
                <Switch
                  checked={isActive}
                  onChange={() =>
                    handleAction(onToggleServer, "Toggling server...")
                  }
                  className={isActive ? "online" : "offline"}
                  disabled={loading !== null}
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Storage />
                    <Typography>Port: {currentPort}</Typography>
                    <Button
                      size="small"
                      onClick={() => setOpenPortDialog(true)}
                      className="minecraft-btn"
                      sx={{ ml: 1 }}
                    >
                      Change
                    </Button>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Memory />
                    <Typography>
                      RAM: {currentRam.min}GB - {currentRam.max}GB
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setOpenRamDialog(true)}
                      className="minecraft-btn"
                      sx={{ ml: 1 }}
                    >
                      Change
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Server Actions Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="minecraft-card">
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() =>
                      handleAction(onRestartServer, "Restarting server...")
                    }
                    disabled={!isActive || loading !== null}
                    className="minecraft-btn"
                  >
                    Restart Server
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() =>
                      handleAction(onDownloadWorld, "Preparing download...")
                    }
                    className="minecraft-btn"
                  >
                    Download World
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() =>
                      handleAction(onBackupWorld, "Creating backup...")
                    }
                    className="minecraft-btn"
                  >
                    Backup World
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* Server Logs Card */}
        <Grid size={{ xs: 12 }}>
          <Card className="minecraft-card">
            <CardHeader
              title="Server Logs"
              action={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color={
                      wsStatus === "connected" ? "success.main" : "error.main"
                    }
                  >
                    {wsStatus === "connected"
                      ? "Connected"
                      : wsStatus === "connecting"
                      ? "Connecting..."
                      : "Disconnected"}
                  </Typography>
                  <Terminal />
                </Box>
              }
            />
            <CardContent>
              <Box
                className="bg-gray-900 p-4 rounded-md"
                sx={{
                  height: "400px",
                  overflowY: "auto",
                  fontFamily: "monospace",
                }}
              >
                {logs.map((log, index) => (
                  <div key={index} className={`${getLogColor(log.level)} mb-1`}>
                    <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                    <span className="text-blue-400">[{log.source}]</span>{" "}
                    <span className="font-bold">[{log.level}]</span>{" "}
                    {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>{loading}</Typography>
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* RAM Allocation Dialog */}
      <Dialog
        open={openRamDialog}
        onClose={() => setOpenRamDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Allocate Server RAM</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Minimum RAM (GB)</Typography>
            <Slider
              value={newRam.min}
              onChange={(_, value) =>
                setNewRam((prev) => ({ ...prev, min: value as number }))
              }
              step={0.5}
              min={1}
              max={Math.min(newRam.max, systemRam)}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={formatRam}
            />
            <Typography gutterBottom sx={{ mt: 3 }}>
              Maximum RAM (GB)
            </Typography>
            <Slider
              value={newRam.max}
              onChange={(_, value) =>
                setNewRam((prev) => ({ ...prev, max: value as number }))
              }
              step={0.5}
              min={newRam.min}
              max={systemRam}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={formatRam}
            />
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Info color="info" fontSize="small" />
              <Typography variant="body2" color="textSecondary">
                System RAM: {systemRam}GB
              </Typography>
            </Box>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Changing RAM allocation requires a server restart.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRamDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRamChange}
            disabled={
              newRam.min === currentRam.min && newRam.max === currentRam.max
            }
            className="minecraft-btn"
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Port Change Dialog */}
      <Dialog open={openPortDialog} onClose={() => setOpenPortDialog(false)}>
        <DialogTitle>Change Server Port</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="New Port"
              value={newPort}
              onChange={(e) => setNewPort(Number(e.target.value))}
              inputProps={{ min: 1024, max: 65535 }}
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              Changing the port will require a server restart.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPortDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePortChange}
            disabled={
              newPort === currentPort || newPort < 1024 || newPort > 65535
            }
            className="minecraft-btn"
          >
            Change Port
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

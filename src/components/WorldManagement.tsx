import { useState, useEffect, useRef } from "react";
import { Box, Tabs, Tab, Alert, Snackbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Datapack,
  MinecraftWorld,
  Player,
  PlayerBanKick,
  PlayerOp,
  LogMessage,
} from "../types";
import { DatapackManagement } from "./DatapackManagement";
import { ServerPropertiesManagement } from "./ServerPropertiesManagement";
import { ServerControlPanel } from "./ServerControlManagement";
import { PlayerManagement } from "./PlayerManagement";
import { TabPanel } from "./TabPanel";

const MB_TO_GB = 1024;
const convertMBtoGB = (mb: number) => Math.round((mb / MB_TO_GB) * 2) / 2; // Round to nearest 0.5
const convertGBtoMB = (gb: number) => Math.round(gb * MB_TO_GB);

export const WorldManagement = () => {
  const { worldId } = useParams<{ worldId: string }>();
  const [value, setValue] = useState(0);
  const [world, setWorld] = useState<MinecraftWorld | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [datapacks, setDatapacks] = useState<Datapack[]>([]);
  const [isToggling, setIsToggling] = useState(false);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: "info" | "success" | "error";
  }>({ show: false, message: "", severity: "info" });
  // Add logs state and websocket related state
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  // Parse log message function
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

  // WebSocket connection function
  const connectWebSocket = () => {
    if (!worldId) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `${import.meta.env.VITE_AGENT_URL.replace(
      "http",
      "ws"
    )}/ws/logs/${worldId}`;
    setWsStatus("connecting");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      console.log("WebSocket connected for logs");
    };

    ws.onmessage = (event) => {
      const rawLog = event.data;
      const parsedLog = parseLogMessage(rawLog);

      if (parsedLog) {
        setLogs((prev) => {
          const isDuplicate = prev.some(
            (existingLog) => existingLog.raw === rawLog
          );

          if (isDuplicate) {
            return prev;
          }

          return [...prev, parsedLog].slice(-500); // Keep last 500 messages
        });
      } else {
        // Handle unparseable logs by creating a basic INFO message
        const basicLog: LogMessage = {
          timestamp: new Date().toLocaleTimeString(),
          source: "Unknown",
          level: "INFO",
          message: rawLog,
          raw: rawLog,
        };
        setLogs((prev) => {
          const isDuplicate = prev.some(
            (existingLog) => existingLog.raw === rawLog
          );

          if (isDuplicate) {
            return prev;
          }

          return [...prev, basicLog].slice(-500);
        });
      }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      wsRef.current = null;
      console.log("WebSocket disconnected");

      if (world?.isActive || isToggling) {
        console.log("Attempting to reconnect in 2 seconds...");
        setTimeout(connectWebSocket, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsStatus("disconnected");
    };
  };

  useEffect(() => {
    if ((world?.isActive || isToggling) && !wsRef.current) {
      console.log("Connecting websocket due to active state change");
      connectWebSocket();
    } else if (!world?.isActive && !isToggling && wsRef.current) {
      console.log("Disconnecting websocket due to inactive state");
      wsRef.current.close();
      wsRef.current = null;
      setWsStatus("disconnected");
    }

    return () => {
      if (wsRef.current) {
        console.log("Cleaning up websocket on component unmount");
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [world?.isActive, isToggling, worldId]);

  const fetchWorlds = async () => {
    const [worldRes] = await Promise.all([
      axios.get(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}`
      ),
    ]);
    setWorld(worldRes.data);
  };
  const fetchDatapacks = async () => {
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/datapacks`
    );
    setDatapacks(response.data.datapacks);
  };
  const fetchPlayers = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };
  const fetchProperties = async () => {
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/properties`
    );
    setProperties(response.data);
  };

  useEffect(() => {
    fetchWorlds();
    fetchDatapacks();
    fetchPlayers();
    fetchProperties();
  }, [worldId]);

  const handleServerToggle = async () => {
    setIsToggling(true);
    const action = world?.isActive ? "stop" : "start";

    try {
      setAlert({
        show: true,
        message: `World is ${action}ing...`,
        severity: "info",
      });

      // Make the API call
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/${action}`,
        {},
        { timeout: 120000 }
      );

      // Update state AFTER successful API call
      setWorld((prev) =>
        prev ? { ...prev, isActive: action === "start" } : null
      );

      setAlert({
        show: true,
        message: `World ${action}ed successfully`,
        severity: "success",
      });

      // WebSocket management should be handled by the useEffect
      // based on the updated world.isActive state
    } catch (error: any) {
      console.error("Server toggle error:", error);

      setAlert({
        show: true,
        message: `Failed to ${action} server: ${
          error.message || "Unknown error"
        }`,
        severity: "error",
      });

      // If start failed, explicitly close websocket connection that we opened
      if (action === "start" && wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsStatus("disconnected");
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handlePortChange = async (newPort: number) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/port`,
      {
        port: newPort,
      }
    );
    await fetchWorlds();
  };

  const handleRamChange = async (ram: { min: number; max: number }) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/ram`,
      ram
    );
    await fetchWorlds();
  };

  const handleRestartServer = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/restart`
    );
    await fetchWorlds();
  };

  const handleDownloadWorld = async () => {
    const { data: uploadData } = await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/datapacks/upload-url`,
      {
        name: worldId,
        type: "download",
      }
    );
    console.log(uploadData);
    const response = await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/download`,
      { uploadUrl: uploadData.uploadUrl, key: uploadData.key }
    );
    console.log(response);
    // Create download link
    const url = response.data.url;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${world?.name || worldId}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleBackupWorld = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/backup`
    );
  };

  const handlePlayerWhitelist = async (player: Player) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/whitelistPlayer`,
      { player }
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };

  const handlePlayerBan = async (player: PlayerBanKick) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/banPlayer`,
      { player }
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };

  const handlePlayerPardon = async (player: Player) => {
    try {
      // Send a raw RCON command to pardon the player
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/raw-rcon-command`,
        { command: `pardon ${player.name}` }
      );
      // Refresh players list
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/players`
      );
      setPlayers(response.data.players);
    } catch (error) {
      console.error("Failed to pardon player:", error);
    }
  };

  const handlePlayerKick = async (player: PlayerBanKick) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/kickPlayer`,
      { player }
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };

  const handlePlayerOp = async (player: PlayerOp) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/opPlayer`,
      { player }
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };

  const handlePlayerRemoveOp = async (player: PlayerOp) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/removeOpPlayer`,
      { player }
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}/players`
    );
    setPlayers(response.data.players);
  };
  const handlePropertyChange = async (properties: Record<string, string>) => {
    console.log("Updating properties:", properties);
    await axios.put(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/properties`,
      { properties }
    );
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/properties`
    );
    setProperties(response.data);
  };

  const handleRconCommand = async (command: string) => {
    const response = await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/raw-rcon-command`,
      { command }
    );
    return response.data;
  };
  const handleToggleWhitelist = async (enabled: boolean) => {
    handlePropertyChange({ "white-list": enabled.toString() });
  };
  return (
    <Box sx={{ height: "100vh", padding: "20px" }}>
      <Box
        sx={{
          width: "75%",
          height: "98%",
          bgcolor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-evenly", // Equal width tabs
            },
          }}
        >
          <Tabs
            value={value}
            onChange={(_, newValue) => setValue(newValue)}
            variant="fullWidth" // Make tabs equal width
          >
            <Tab label="Server Control" sx={{ minWidth: 0, flex: 1 }} />
            <Tab label="Player Management" sx={{ minWidth: 0, flex: 1 }} />
            <Tab label="Server Properties" sx={{ minWidth: 0, flex: 1 }} />
            <Tab label="Datapacks" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <ServerControlPanel
            worldId={worldId!}
            isActive={world?.isActive || false}
            currentPort={world?.port || 25565}
            currentRam={{
              min: convertMBtoGB(world?.ram?.min || 2), // Convert MB to GB
              max: convertMBtoGB(world?.ram?.max || 4),
            }}
            systemRam={16} // You might want to fetch this from your agent
            onToggleServer={handleServerToggle}
            onRestartServer={handleRestartServer}
            onPortChange={handlePortChange}
            onRamChange={async (ramGB) => {
              // Convert GB back to MB when sending to server
              const ramMB = {
                min: convertGBtoMB(ramGB.min),
                max: convertGBtoMB(ramGB.max),
              };
              await handleRamChange(ramMB);
            }}
            onDownloadWorld={handleDownloadWorld}
            onBackupWorld={handleBackupWorld}
            onSendRconCommand={handleRconCommand}
            logs={logs}
            wsStatus={wsStatus}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PlayerManagement
            worldId={worldId!}
            worldActive={world?.isActive || false}
            players={players}
            isWhitelistEnabled={properties["white-list"] === "true"}
            onPlayerWhitelist={handlePlayerWhitelist}
            onPlayerBan={handlePlayerBan}
            onPlayerKick={handlePlayerKick}
            onPlayerOp={handlePlayerOp}
            onPlayerRemoveOp={handlePlayerRemoveOp}
            onToggleWhitelist={handleToggleWhitelist}
            onPlayerPardon={handlePlayerPardon}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ServerPropertiesManagement
            worldId={worldId!}
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <DatapackManagement
            worldId={worldId!}
            datapacks={datapacks}
            refreshDatapacks={fetchDatapacks}
          />
        </TabPanel>
        <Snackbar
          open={alert.show}
          autoHideDuration={6000}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        >
          <Alert
            severity={alert.severity}
            sx={{ width: "100%" }}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

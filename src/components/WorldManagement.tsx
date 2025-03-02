import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Alert, Snackbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Datapack, MinecraftWorld, Player } from "../types";
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
  const navigate = useNavigate();

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
    try {
      const action = world?.isActive ? "stop" : "start";
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/${action}`,
        {},
        { timeout: 120000 }
      );
      setAlert({
        show: true,
        message: `World is ${action}ing...`,
        severity: "info",
      });
      setTimeout(() => {
        setWorld((prev) =>
          prev ? { ...prev, isActive: !prev.isActive } : null
        );
        setAlert({
          show: true,
          message: `World ${action}ed successfully`,
          severity: "success",
        });
        setIsToggling(false);
      }, 3000);
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to toggle server state",
        severity: "error",
      });
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

  const handlePlayerListChange = async (
    username: string,
    listType: "whitelist" | "blacklist"
  ) => {
    await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/worlds/${worldId}/players/${username}/${listType}`
    );
    // Refresh players list
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/worlds/${worldId}/players`
    );
    setPlayers(response.data);
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
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PlayerManagement
            worldId={worldId!}
            players={players}
            onPlayerChange={handlePlayerListChange}
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

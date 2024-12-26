import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MinecraftWorld, Player } from "../types";
import { DatapackManagement } from "./DatapacKManagement";
import { ServerPropertiesManagement } from "./ServerPropertiesManagement";
import { ServerControlPanel } from "./ServerControlManagement";
import { PlayerManagement } from "./PlayerManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
      style={{
        height: "80vh",
        position: "relative",
        width: "100%",
      }}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
};

export const WorldManagement = () => {
  const { worldId } = useParams<{ worldId: string }>();
  const [value, setValue] = useState(0);
  const [world, setWorld] = useState<MinecraftWorld | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isToggling, setIsToggling] = useState(false);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: "info" | "success" | "error";
  }>({ show: false, message: "", severity: "info" });

  useEffect(() => {
    const fetchData = async () => {
      const [worldRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${worldId}`
        ),
      ]);
      setWorld(worldRes.data);
      setPlayers(worldRes.data.players);
      setProperties(worldRes.data.properties);
    };
    fetchData();
  }, [worldId]);

  const handleServerToggle = async () => {
    setIsToggling(true);
    try {
      const action = world?.isActive ? "stop" : "start";
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/${action}`
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
    <Box
      sx={{
        width: "75%",
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
          isToggling={isToggling}
          onToggleServer={handleServerToggle}
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
        <DatapackManagement worldId={worldId!} />
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
  );
};

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
  TextField,
  Alert,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MinecraftWorld, Player } from "../types";
import { DatapackManagement } from "./DatapacKManagement";
import { Server } from "http";
import { ServerPropertiesManagement } from "./ServerPropertiesManagement";

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
            overflowY: "auto",
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

  const handlePropertyChange = async (key: string, value: string) => {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/worlds/${worldId}/properties`,
      { [key]: value }
    );
    setProperties((prev) => ({ ...prev, [key]: value }));
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
        <Typography variant="h6" sx={{ mb: 4 }}>
          Server Status
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Switch
            checked={world?.isActive || false}
            onChange={handleServerToggle}
            disabled={isToggling}
            className={world?.isActive ? "online" : "offline"}
          />
          <Typography component="span" sx={{ ml: 1 }}>
            {world?.isActive ? "Online" : "Offline"}
          </Typography>
          {isToggling && <CircularProgress size={24} />}
        </Box>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <List>
          {players.map((player) => (
            <ListItem key={player.username}>
              <ListItemText
                primary={player.username}
                secondary={player.isOnline ? "Online" : "Offline"}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={player.isWhitelisted}
                  onChange={() =>
                    handlePlayerListChange(player.username, "whitelist")
                  }
                  color="primary"
                />
                <Switch
                  checked={player.isBlacklisted}
                  onChange={() =>
                    handlePlayerListChange(player.username, "blacklist")
                  }
                  color="error"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
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

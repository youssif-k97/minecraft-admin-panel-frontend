import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid2";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Container,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Add, Update } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MinecraftWorld } from "../types/index";
import { CreateWorldDialog } from "./CreateWorldDialog";
import { UpdateWorldDialog } from "./UpdateWorldDialog";

export const WorldList = () => {
  const [worlds, setWorlds] = useState<MinecraftWorld[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<MinecraftWorld | null>(
    null
  );
  const [latestVersions, setLatestVersions] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchWorlds = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds`
    );
    setWorlds(response.data.worlds);
  };

  const fetchLatestVersions = async () => {
    try {
      const response = await axios.get(
        "https://piston-meta.mojang.com/mc/game/version_manifest.json"
      );

      // Filter for release versions only and sort by release date
      const releaseVersions = response.data.versions
        .filter((version: any) => version.type === "release")
        .sort(
          (a: any, b: any) =>
            new Date(b.releaseTime).getTime() -
            new Date(a.releaseTime).getTime()
        );

      setLatestVersions(releaseVersions.map((v: any) => v.id));
    } catch (err) {
      console.error("Failed to fetch Minecraft versions:", err);
    }
  };

  const isUpdateAvailable = (currentVersion: string) => {
    if (!latestVersions.length || !currentVersion) return false;
    return latestVersions.indexOf(currentVersion) > 0;
  };

  const handleUpdateClick = (world: MinecraftWorld) => {
    setSelectedWorld(world);
    setUpdateDialogOpen(true);
  };

  useEffect(() => {
    fetchWorlds();
    fetchLatestVersions();
    const interval = setInterval(fetchWorlds, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ height: "100%" }}>
        <Grid container spacing={1}>
          {worlds.map((world) => (
            <Grid size={4} key={world.id}>
              <Card
                className={`minecraft-card ${
                  world.isActive ? "online" : "offline"
                }`}
                sx={{
                  height: "100%",
                  minHeight: "250px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {world.serverVersion && (
                  <Tooltip
                    title={
                      isUpdateAvailable(world.serverVersion)
                        ? "Newer version available"
                        : "Latest version"
                    }
                    placement="top-end"
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: isUpdateAvailable(world.serverVersion)
                          ? "var(--minecraft-warning)"
                          : "var(--minecraft-online)",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {world.serverVersion}
                      {isUpdateAvailable(world.serverVersion) && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateClick(world);
                          }}
                          sx={{ ml: 1, p: 0.5 }}
                        >
                          <Update fontSize="small" />
                        </IconButton>
                      )}
                    </Typography>
                  </Tooltip>
                )}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{
                      textAlign: "center",
                      mb: 4,
                      textShadow: "2px 2px #000",
                    }}
                  >
                    {world.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      color={
                        world.isActive
                          ? "var(--minecraft-online)"
                          : "var(--minecraft-offline)"
                      }
                      sx={{ textShadow: "1px 1px #000" }}
                    >
                      {world.isActive ? "🟢 Online" : "🔴 Offline"}
                    </Typography>

                    {world.isActive && (
                      <Typography variant="h6">
                        Players Online: {world.players?.length || 0}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, justifyContent: "center" }}>
                  <Button
                    className="minecraft-btn"
                    onClick={() => navigate(`/world/${world.id}`)}
                    fullWidth
                    size="large"
                  >
                    Manage World
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {/* Create New World Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              className="minecraft-card"
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "200px",
                }}
              >
                <Add sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" component="h2">
                  Create New World
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <CreateWorldDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onWorldCreated={fetchWorlds}
        />
        {selectedWorld && (
          <UpdateWorldDialog
            open={updateDialogOpen}
            world={selectedWorld}
            onClose={() => {
              setUpdateDialogOpen(false);
              setSelectedWorld(null);
            }}
            onWorldUpdated={fetchWorlds}
            latestVersions={latestVersions.slice(
              0,
              latestVersions.indexOf(selectedWorld.serverVersion)
            )}
          />
        )}
      </Container>
    </Box>
  );
};

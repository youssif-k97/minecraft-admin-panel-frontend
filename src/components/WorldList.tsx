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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MinecraftWorld } from "../types";
import { CreateWorldDialog } from "./CreateWorldDialog";

export const WorldList = () => {
  const [worlds, setWorlds] = useState<MinecraftWorld[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchWorlds = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/minecraft/worlds`
    );
    setWorlds(response.data.worlds);
  };

  useEffect(() => {
    fetchWorlds();
    const interval = setInterval(fetchWorlds, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: "100%",
        minHeight: "100vh",
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
                }}
              >
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
      </Container>
    </Box>
  );
};

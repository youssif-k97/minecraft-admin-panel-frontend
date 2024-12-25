import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MinecraftWorld } from "../types";

export const WorldList = () => {
  const [worlds, setWorlds] = useState<MinecraftWorld[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorlds = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds`
      );
      setWorlds(response.data.worlds);
    };
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
        </Grid>
      </Container>
    </Box>
  );
};

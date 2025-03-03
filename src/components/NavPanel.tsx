import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Typography,
} from "@mui/material";
import {
  ViewModule,
  Grass,
  ExpandLess,
  ExpandMore,
  ViewInAr,
  Memory,
} from "@mui/icons-material";
import axios from "axios";
import { MinecraftWorld } from "../types";
import { IconBrandMinecraft } from "@tabler/icons-react";

export const NavPanel = () => {
  const [open, setOpen] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);
  const [worlds, setWorlds] = useState<MinecraftWorld[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const collapsedWidth = 64;
  const expandedWidth = 240;

  // Fetch worlds for the dropdown
  useEffect(() => {
    const fetchWorlds = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds`
      );
      setWorlds(response.data.worlds);
    };
    fetchWorlds();
  }, []);

  // Keep worlds dropdown open if a world is selected
  useEffect(() => {
    if (location.pathname.includes("/world/")) {
      setWorldsOpen(true);
    }
  }, [location]);

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setWorldsOpen(location.pathname.includes("/world/"));
      }}
      sx={{
        width: collapsedWidth,
        flexShrink: 0,
        position: "fixed",
        "& .MuiDrawer-paper": {
          width: open ? expandedWidth : collapsedWidth,
          boxSizing: "border-box",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "none",
          borderRight: "3px solid #593B2C",
          transition: "width 0.3s ease-in-out",
          overflowX: "hidden",
          position: "fixed",
          height: "100vh",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "20px",
            background:
              "linear-gradient(to right, transparent, rgba(0, 0, 0, 0.8))",
            pointerEvents: "none",
            opacity: open ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          },
        },
      }}
    >
      <Box
        sx={{
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          px: 2.5,
          mt: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            "& .MuiSvgIcon-root": {
              minWidth: 24,
              width: 24,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            },
          }}
        >
          <ViewInAr
            sx={{
              fontSize: 24,
              color: "primary.main",
              filter: "drop-shadow(2px 2px #000)",
              transition: "all 0.3s ease-in-out",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              transition: "all 0.3s ease-in-out",
              opacity: open ? 1 : 0,
              transform: open ? "translateX(0)" : "translateX(-20px)",
              fontFamily: "Minecraft, sans-serif",
              textShadow: "2px 2px #000",
              whiteSpace: "nowrap",
              width: open ? "auto" : 0,
              overflow: "hidden",
              fontSize: "1rem",
              lineHeight: "24px",
            }}
          >
            Minecraft
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "#593B2C" }} />
      <List>
        <ListItem
          onClick={() => navigate("/")}
          sx={{
            minHeight: 48,
            height: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 24,
              width: 24,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <ViewModule sx={{ fontSize: 24 }} />
          </ListItemIcon>
          <ListItemText
            primary="World List"
            sx={{
              opacity: open ? 1 : 0,
              "& .MuiTypography-root": {
                fontFamily: "Minecraft, sans-serif",
                textShadow: "2px 2px #000",
              },
            }}
          />
        </ListItem>

        <ListItem
          onClick={() => navigate("/server")}
          sx={{
            minHeight: 48,
            height: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            backgroundColor:
              location.pathname === "/server"
                ? "rgba(89, 59, 44, 0.7)"
                : "transparent",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 24,
              width: 24,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <Memory sx={{ fontSize: 24 }} />
          </ListItemIcon>
          <ListItemText
            primary="Server Management"
            sx={{
              opacity: open ? 1 : 0,
              "& .MuiTypography-root": {
                fontFamily: "Minecraft, sans-serif",
                textShadow: "2px 2px #000",
              },
            }}
          />
        </ListItem>

        <ListItem
          onClick={() => setWorldsOpen(!worldsOpen)}
          sx={{
            minHeight: 48,
            height: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 24,
              width: 24,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <IconBrandMinecraft style={{ width: 24, height: 24 }} />
          </ListItemIcon>
          <ListItemText
            primary="Worlds"
            sx={{
              opacity: open ? 1 : 0,
              "& .MuiTypography-root": {
                fontFamily: "Minecraft, sans-serif",
                textShadow: "2px 2px #000",
              },
            }}
          />
          {open && (worldsOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        <Collapse in={open && worldsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {worlds.map((world) => (
              <ListItem
                key={world.id}
                onClick={() => navigate(`/world/${world.id}`)}
                sx={{
                  pl: 4,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  backgroundColor:
                    location.pathname === `/world/${world.id}`
                      ? "rgba(89, 59, 44, 0.7)"
                      : "transparent",
                  borderLeft:
                    location.pathname === `/world/${world.id}`
                      ? "4px solid #593B2C"
                      : "4px solid transparent",
                  transition: "all 0.2s ease-in-out",
                  boxShadow:
                    location.pathname === `/world/${world.id}`
                      ? "0 0 8px rgba(89, 59, 44, 0.6)"
                      : "none",
                }}
              >
                <ListItemText
                  primary={world.name}
                  sx={{
                    "& .MuiTypography-root": {
                      fontFamily: "Minecraft, sans-serif",
                      textShadow: "2px 2px #000",
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

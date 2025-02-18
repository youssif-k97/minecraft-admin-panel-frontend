import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { MinecraftVersion, WorldConfig } from "../types";

interface CreateWorldDialogProps {
  open: boolean;
  onClose: () => void;
  onWorldCreated: () => void;
}

export const CreateWorldDialog = ({
  open,
  onClose,
  onWorldCreated,
}: CreateWorldDialogProps) => {
  const [name, setName] = useState("");
  const [port, setPort] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<MinecraftVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      if (open) {
        try {
          setLoading(true);
          const response = await axios.get(
            "https://piston-meta.mojang.com/mc/game/version_manifest.json"
          );

          // Filter for release versions only and sort by release date
          const releaseVersions = response.data.versions
            .filter((version: MinecraftVersion) => version.type === "release")
            .sort(
              (a: MinecraftVersion, b: MinecraftVersion) =>
                new Date(b.releaseTime).getTime() -
                new Date(a.releaseTime).getTime()
            );

          setVersions(releaseVersions);
          // Set the most recent version as default
          if (releaseVersions.length > 0 && !selectedVersion) {
            setSelectedVersion(releaseVersions[0].id);
          }
        } catch (err) {
          console.error("Failed to fetch Minecraft versions:", err);
          setError("Failed to load Minecraft versions");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVersions();
  }, [open]);

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!name || !port || !selectedVersion) {
        setError("Please fill in all fields");
        return;
      }

      if (
        isNaN(Number(port)) ||
        Number(port) <= 25560 ||
        Number(port) >= 25570
      ) {
        setError("Port must be a number between 25560 and 25570");
        return;
      }

      let worldConfig = {
        worldName: name,
        serverVersion: selectedVersion,
        port: Number(port),
      };
      console.log("Request body:", JSON.stringify(worldConfig, null, 2));

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds`,
        worldConfig
      );

      setName("");
      setPort("");
      setSelectedVersion("");
      onWorldCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create world. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "minecraft-card",
        sx: { minWidth: "300px" },
      }}
    >
      <DialogTitle sx={{ fontFamily: "Minecraft" }}>
        Create New World
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="World Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "var(--minecraft-dirt)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--minecraft-wood)",
                },
              },
              mb: 2,
            }}
          />
          <FormControl
            fullWidth
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "var(--minecraft-dirt)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--minecraft-wood)",
                },
              },
            }}
          >
            <InputLabel>Server Version</InputLabel>
            <Select
              value={selectedVersion}
              label="Server Version"
              onChange={(e) => setSelectedVersion(e.target.value)}
              disabled={loading}
            >
              {versions.map((version) => (
                <MenuItem key={version.id} value={version.id}>
                  {version.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Port Number"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "var(--minecraft-dirt)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--minecraft-wood)",
                },
              },
            }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} className="minecraft-btn" sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="minecraft-btn"
          variant="contained"
        >
          Create World
        </Button>
      </DialogActions>
    </Dialog>
  );
};

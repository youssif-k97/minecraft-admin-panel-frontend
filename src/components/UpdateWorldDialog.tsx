import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import { BackupOutlined, GetAppOutlined } from "@mui/icons-material";
import axios from "axios";
import { MinecraftWorld } from "../types/index";

interface UpdateWorldDialogProps {
  open: boolean;
  world: MinecraftWorld;
  latestVersions: string[];
  onClose: () => void;
  onWorldUpdated: () => void;
}

export const UpdateWorldDialog: React.FC<UpdateWorldDialogProps> = ({
  open,
  world,
  latestVersions,
  onClose,
  onWorldUpdated,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldBackup, setShouldBackup] = useState<boolean>(true);
  const [shouldDownload, setShouldDownload] = useState<boolean>(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedVersion("");
    setError(null);
    setBackupStatus(null);
    setDownloadStatus(null);
    onClose();
  };

  const handleBackupWorld = async () => {
    try {
      setBackupStatus("Backing up world...");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${
          world.id
        }/backup`
      );
      setBackupStatus("Backup completed successfully");
      return true;
    } catch (err) {
      console.error("Failed to backup world:", err);
      setBackupStatus("Failed to backup world");
      return false;
    }
  };

  const handleDownloadWorld = async () => {
    try {
      setDownloadStatus("Preparing world download...");

      // Get upload URL
      const { data: uploadData } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${
          world.id
        }/datapacks/upload-url`,
        {
          name: world.id,
          type: "download",
        }
      );

      // Request the download
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${
          world.id
        }/download`,
        { uploadUrl: uploadData.uploadUrl, key: uploadData.key }
      );

      // Create download link
      const url = response.data.url;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${world.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadStatus("Download initiated");
      return true;
    } catch (err) {
      console.error("Failed to download world:", err);
      setDownloadStatus("Failed to download world");
      return false;
    }
  };

  const handleUpdate = async () => {
    if (!selectedVersion) {
      setError("Please select a version to update to");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Perform backup if selected
      if (shouldBackup) {
        const backupSuccess = await handleBackupWorld();
        if (!backupSuccess) {
          setError("Failed to backup world. Update canceled for safety.");
          setLoading(false);
          return;
        }
      }

      // Download if selected
      if (shouldDownload) {
        await handleDownloadWorld();
      }

      const worldConfig = {
        worldName: world.name,
        serverVersion: selectedVersion,
      };

      // Update the world with the new version
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/minecraft/worlds/${
          world.id
        }/update`,
        worldConfig
      );

      onWorldUpdated();
      handleClose();
    } catch (err: any) {
      console.error("Failed to update world:", err);
      setError(err.response?.data?.message || "Failed to update world");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="minecraft-dialog-title">
        Update {world.name}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Updating your world version might affect compatibility with existing
            worlds. Make sure to back up your world before updating.
          </Alert>

          <Typography variant="body1" gutterBottom>
            Current version: <strong>{world.serverVersion}</strong>
          </Typography>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="version-select-label">
              Select New Version
            </InputLabel>
            <Select
              labelId="version-select-label"
              id="version-select"
              value={selectedVersion}
              label="Select New Version"
              onChange={(e) => setSelectedVersion(e.target.value as string)}
              disabled={loading || latestVersions.length === 0}
              className="minecraft-select"
            >
              {latestVersions.length === 0 ? (
                <MenuItem value="">No newer versions available</MenuItem>
              ) : (
                latestVersions.map((version) => (
                  <MenuItem key={version} value={version}>
                    {version}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Backup Options
          </Typography>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldBackup}
                  onChange={(e) => setShouldBackup(e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <BackupOutlined sx={{ mr: 1 }} />
                  <Typography>
                    Create backup before updating (Recommended)
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldDownload}
                  onChange={(e) => setShouldDownload(e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <GetAppOutlined sx={{ mr: 1 }} />
                  <Typography>
                    Download world backup to your computer
                  </Typography>
                </Box>
              }
            />
          </Stack>

          {backupStatus && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: backupStatus.includes("Failed")
                  ? "error.main"
                  : "success.main",
              }}
            >
              {backupStatus}
            </Typography>
          )}

          {downloadStatus && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: downloadStatus.includes("Failed")
                  ? "error.main"
                  : "success.main",
              }}
            >
              {downloadStatus}
            </Typography>
          )}

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          className="minecraft-btn minecraft-btn-secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          className="minecraft-btn"
          disabled={!selectedVersion || loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          Update World
        </Button>
      </DialogActions>
    </Dialog>
  );
};

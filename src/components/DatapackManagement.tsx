import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Upload } from "@mui/icons-material";
import axios from "axios";

interface Datapack {
  name: string;
  uploadDate: string;
}

interface DatapackManagementProps {
  worldId: string;
}

export const DatapackManagement: React.FC<DatapackManagementProps> = ({
  worldId,
}) => {
  const [datapacks, setDatapacks] = useState<Datapack[]>([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDatapackId, setDeleteDatapackId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: "info" | "success" | "error";
  }>({ show: false, message: "", severity: "info" });

  useEffect(() => {
    fetchDatapacks();
  }, [worldId]);

  const fetchDatapacks = async () => {
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/api/minecraft/worlds/${worldId}/datapacks`
    );
    setDatapacks(response.data.datapacks);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      console.log("Uploading datapack...");
      console.log("Selected file name:", selectedFile.name);
      // Get upload URL
      const { data: uploadData } = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/datapacks/upload-url`,
        {
          name: selectedFile.name,
        }
      );
      console.log("Upload data:", uploadData);
      // Upload file to S3
      await axios.put(uploadData.uploadUrl, selectedFile, {
        headers: {
          "Content-Type": "application/zip",
        },
      });
      console.log("File uploaded to S3");
      // Notify agent after successful upload
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/datapacks/notify`,
        {
          key: uploadData.key,
          name: selectedFile.name,
        }
      );
      console.log("Agent notified");
      setOpenUpload(false);
      setAlert({
        show: true,
        message: "Datapack uploaded successfully: " + selectedFile.name,
        severity: "info",
      });
      fetchDatapacks();
    } catch (error) {
      console.error("Error uploading datapack:", error);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDeleteDialog = (datapackId: string) => {
    setDeleteDatapackId(datapackId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (datapackId: string) => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/minecraft/worlds/${worldId}/datapacks/${datapackId}`
      );
      fetchDatapacks();
      setAlert({
        show: true,
        message: "Deteted " + datapackId + " successfully",
        severity: "error",
      });
    } catch (error) {
      console.error("Error deleting datapack:", error);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteDatapackId("");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Datapacks</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setOpenUpload(true)}
          className="minecraft-btn"
        >
          Upload Datapack
        </Button>
      </Box>

      <List>
        {datapacks.map((datapack) => (
          <ListItem
            key={datapack.name}
            className="minecraft-card"
            sx={{ mb: 1 }}
          >
            <ListItemText
              primary={datapack.name}
              secondary={`Uploaded: ${new Date(
                datapack.uploadDate
              ).toLocaleDateString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleDeleteDialog(datapack.name)}
                className="minecraft-btn"
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload Datapack</DialogTitle>
        <DialogContent>
          <input
            accept=".zip"
            style={{ display: "none" }}
            id="datapack-file"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="datapack-file">
            <Button
              variant="contained"
              component="span"
              className="minecraft-btn"
            >
              Select File
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="minecraft-btn"
          >
            {uploading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Are you sure you want to delete the following datapack?
        </DialogTitle>
        <DialogContent>
          {deleteDatapackId && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {deleteDatapackId}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDelete(deleteDatapackId)}
            disabled={!deleteDatapackId}
            className="minecraft-btn-delete"
          >
            Delete
          </Button>
          <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
        </DialogActions>
      </Dialog>
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

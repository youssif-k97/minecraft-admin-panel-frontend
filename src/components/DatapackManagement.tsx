import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { Delete, Upload } from "@mui/icons-material";
import axios from "axios";
import { Datapack } from "../types";

interface DatapackManagementProps {
  worldId: string;
  datapacks: Datapack[];
  refreshDatapacks: () => void;
}

export const DatapackManagement: React.FC<DatapackManagementProps> = ({
  worldId,
  datapacks,
  refreshDatapacks,
}) => {
  const [openUpload, setOpenUpload] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDatapackId, setDeleteDatapackId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: "info" | "success" | "error";
  }>({ show: false, message: "", severity: "info" });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload each file sequentially
      for (const file of selectedFiles) {
        try {
          console.log(`Uploading datapack: ${file.name}`);

          // Get upload URL
          const { data: uploadData } = await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/api/minecraft/worlds/${worldId}/datapacks/upload-url`,
            {
              name: file.name,
              type: "datapacks",
            }
          );

          // Upload file to S3
          await axios.put(uploadData.uploadUrl, file, {
            headers: {
              "Content-Type": "application/zip",
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: percentCompleted,
                }));
              }
            },
          });

          // Notify agent after successful upload
          await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/api/minecraft/worlds/${worldId}/datapacks/notify`,
            {
              key: uploadData.key,
              name: file.name,
            }
          );

          successCount++;
        } catch (error) {
          console.error(`Error uploading datapack ${file.name}:`, error);
          errorCount++;
        }
      }

      setOpenUpload(false);
      setAlert({
        show: true,
        message: `Upload complete: ${successCount} successful, ${errorCount} failed`,
        severity: successCount > 0 ? "success" : "error",
      });

      if (successCount > 0) {
        refreshDatapacks();
      }
    } catch (error) {
      console.error("Error in upload process:", error);
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      setUploadProgress({});
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
      refreshDatapacks();
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
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleDeleteDialog(datapack.name)}
                className="minecraft-btn"
              >
                <Delete />
              </IconButton>
            }
          >
            <ListItemText
              primary={datapack.name}
              secondary={`Uploaded: ${new Date(
                parseInt(datapack.uploadDate)
              ).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog
        open={openUpload}
        onClose={() => !uploading && setOpenUpload(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Datapacks</DialogTitle>
        <DialogContent>
          <input
            accept=".zip"
            style={{ display: "none" }}
            id="datapack-file"
            type="file"
            onChange={handleFileSelect}
            multiple
          />
          <label htmlFor="datapack-file">
            <Button
              variant="contained"
              component="span"
              className="minecraft-btn"
              disabled={uploading}
              sx={{ mb: 2 }}
            >
              Select Files
            </Button>
          </label>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Files ({selectedFiles.length}):
              </Typography>
              <Stack spacing={1}>
                {selectedFiles.map((file) => (
                  <Box
                    key={file.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mr: 1,
                        flexGrow: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </Typography>
                    {uploading && uploadProgress[file.name] !== undefined ? (
                      <Chip
                        label={`${uploadProgress[file.name]}%`}
                        size="small"
                        color={
                          uploadProgress[file.name] === 100
                            ? "success"
                            : "primary"
                        }
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(file.name)}
                        disabled={uploading}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="minecraft-btn"
          >
            {uploading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              `Upload ${
                selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""
              }`
            )}
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

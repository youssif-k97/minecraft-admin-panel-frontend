import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";

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

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!name || !port) {
        setError("Please fill in all fields");
        return;
      }

      if (isNaN(Number(port)) || Number(port) < 25560 || Number(port) > 25570) {
        setError("Port must be a number between 25560 and 25570");
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/worlds`, {
        name,
        port: Number(port),
      });

      setName("");
      setPort("");
      onWorldCreated();
      onClose();
    } catch (err) {
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

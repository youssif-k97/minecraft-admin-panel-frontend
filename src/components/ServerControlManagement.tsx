import React from "react";
import { Box, Typography, Switch, CircularProgress } from "@mui/material";

interface ServerControlPanelProps {
  worldId: string;
  isActive: boolean;
  isToggling: boolean;
  onToggleServer: () => Promise<void>;
}

export const ServerControlPanel: React.FC<ServerControlPanelProps> = ({
  worldId,
  isActive,
  isToggling,
  onToggleServer,
}) => {
  return (
    <Box>
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
          checked={isActive || false}
          onChange={onToggleServer}
          disabled={isToggling}
          className={isActive ? "online" : "offline"}
        />
        <Typography component="span" sx={{ ml: 1 }}>
          {isActive ? "Online" : "Offline"}
        </Typography>
        {isToggling && <CircularProgress size={24} />}
      </Box>
    </Box>
  );
};

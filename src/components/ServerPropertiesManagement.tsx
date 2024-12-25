import React from "react";
import { Box, TextField } from "@mui/material";

interface ServerPropertiesManagementProps {
  worldId: string;
  properties: Record<string, string>;
  onPropertyChange: (key: string, value: string) => Promise<void>;
}

export const ServerPropertiesManagement: React.FC<
  ServerPropertiesManagementProps
> = ({ worldId, properties, onPropertyChange }) => {
  return (
    <Box>
      {Object.entries(properties).map(([key, value]) => (
        <Box key={key} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={key}
            value={value}
            onChange={(e) => onPropertyChange(key, e.target.value)}
            className="minecraft-input"
          />
        </Box>
      ))}
    </Box>
  );
};

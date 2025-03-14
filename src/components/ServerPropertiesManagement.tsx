import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { ServerProperty } from "../types";
import { SERVER_PROPERTY_DEFINITIONS } from "../config/serverPropertyDefinitions";

interface ServerPropertiesManagementProps {
  worldId: string;
  properties: Record<string, string>;
  onPropertyChange: (properties: Record<string, string>) => Promise<void>;
}

export const ServerPropertiesManagement: React.FC<
  ServerPropertiesManagementProps
> = ({ worldId, properties, onPropertyChange }) => {
  const [showAll, setShowAll] = useState(false);
  const [modifiedProperties, setModifiedProperties] = useState<
    Record<string, string>
  >({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { importantProperties, additionalProperties } = useMemo(() => {
    const allProperties = Object.entries(properties).map(([key, value]) => ({
      key,
      value,
      type: "text" as const,
      ...(SERVER_PROPERTY_DEFINITIONS[key] || {}),
    }));

    return {
      importantProperties: allProperties.filter((prop) => prop.important),
      additionalProperties: allProperties.filter((prop) => !prop.important),
    };
  }, [properties]);

  const handlePropertyChange = (key: string, value: string) => {
    setModifiedProperties((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasChanges = Object.keys(modifiedProperties).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onPropertyChange(modifiedProperties);
      setModifiedProperties({});
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error("Failed to save properties:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderPropertyInput = (property: ServerProperty) => {
    const currentValue = modifiedProperties[property.key] ?? property.value;

    const inputElement = (() => {
      switch (property.type) {
        case "boolean":
          return (
            <FormControlLabel
              control={
                <Switch
                  checked={currentValue === "true"}
                  onChange={(e) =>
                    handlePropertyChange(property.key, String(e.target.checked))
                  }
                />
              }
              label={property.label || property.key}
            />
          );

        case "select":
          return (
            <FormControl fullWidth variant="outlined">
              <InputLabel>{property.label || property.key}</InputLabel>
              <Select
                value={currentValue}
                onChange={(e) =>
                  handlePropertyChange(property.key, e.target.value)
                }
                label={property.label || property.key}
              >
                {property.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );

        case "number":
          return (
            <TextField
              fullWidth
              type="number"
              label={property.label || property.key}
              value={currentValue}
              onChange={(e) =>
                handlePropertyChange(property.key, e.target.value)
              }
              variant="outlined"
            />
          );

        default:
          return (
            <TextField
              fullWidth
              label={property.label || property.key}
              value={currentValue}
              onChange={(e) =>
                handlePropertyChange(property.key, e.target.value)
              }
              variant="outlined"
            />
          );
      }
    })();

    return (
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box sx={{ flexGrow: 1 }}>{inputElement}</Box>
        {property.description && (
          <Tooltip title={property.description} arrow placement="right">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes
        </Alert>
      )}

      <Box sx={{ flex: 1, overflowY: "auto", pr: 2 }}>
        <Typography variant="h6" gutterBottom>
          Main Properties
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {importantProperties.map((property) => (
            <Box key={property.key}>{renderPropertyInput(property)}</Box>
          ))}
        </Box>

        {showAll && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" gutterBottom>
              Additional Properties
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {additionalProperties.map((property) => (
                <Box key={property.key}>{renderPropertyInput(property)}</Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setShowAll(!showAll)}
          className="minecraft-btn"
        >
          {showAll ? "Show Less" : "Show More"}
        </Button>

        <Button
          variant="contained"
          onClick={() => setOpenConfirmDialog(true)}
          disabled={!hasChanges || saving}
          className="minecraft-btn"
        >
          Save Changes
        </Button>
      </Box>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to apply these changes?</Typography>
          <Box sx={{ mt: 2 }}>
            {Object.entries(modifiedProperties).map(([key, value]) => (
              <Typography key={key} variant="body2">
                {SERVER_PROPERTY_DEFINITIONS[key]?.label || key}: {value}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="minecraft-btn"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

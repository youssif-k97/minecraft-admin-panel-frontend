import React, { useEffect, useState } from "react";
import { Player } from "../types";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Grid from "@mui/material/Grid2";

interface PlayerManagementProps {
  worldId: string;
  players: Player[];
  onPlayerChange: (
    username: string,
    listType: "whitelist" | "blacklist"
  ) => Promise<void>;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  worldId,
  players,
  onPlayerChange,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [opLevel, setOpLevel] = useState<number>(0);
  const [bypassLimit, setBypassLimit] = useState(false);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false); // This would come from server properties

  const playersArray = Array.isArray(players) ? players : [];
  console.log(playersArray);
  const onlinePlayers = playersArray.filter((player) => player.isOnline);
  const bannedPlayers = playersArray.filter((player) => player.isBanned);
  const whitelistedPlayers = playersArray.filter(
    (player) => player.isWhitelisted
  );

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpLevel(player.opLevel);
    setBypassLimit(player.bypassesPlayerLimit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlayer(null);
    setBanReason("");
  };

  const handleBanPlayer = async () => {
    if (selectedPlayer) {
      // Call API to ban player
      await onPlayerChange(selectedPlayer.name, "blacklist");
      handleCloseDialog();
    }
  };

  const handleKickPlayer = async () => {
    if (selectedPlayer) {
      // Call API to kick player
      // This would need a new API endpoint
      handleCloseDialog();
    }
  };

  const handleOpChange = async () => {
    if (selectedPlayer) {
      // Call API to change op status
      // This would need a new API endpoint
      handleCloseDialog();
    }
  };

  const handleWhitelistToggle = async (player: Player) => {
    await onPlayerChange(player.name, "whitelist");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ height: "100%", flexGrow: 1 }}>
        {/* All Players Card - Full width and 50% height */}
        <Grid size={{ xs: 12 }} sx={{ height: "50%" }}>
          <Card
            className="minecraft-card"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardHeader
              title="All Players"
              avatar={<PersonIcon />}
              subheader={`${playersArray.length} total, ${onlinePlayers.length} online`}
            />
            <CardContent
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <List sx={{ flexGrow: 1, overflow: "auto", padding: 0 }}>
                {playersArray.map((player) => (
                  <ListItem
                    key={player.uuid}
                    onClick={() => handlePlayerClick(player)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "4px",
                      padding: "8px 16px",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                    secondaryAction={
                      <FiberManualRecordIcon
                        fontSize="small"
                        color={player.isOnline ? "success" : "disabled"}
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {player.name}
                        </Typography>
                      }
                      secondary={`Last login: ${
                        player.lastLogin
                          ? new Date(player.lastLogin).toLocaleString()
                          : "Never"
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Second row - split between Banned Players and Whitelist - 50% height */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ height: "50%" }}>
          <Card
            className="minecraft-card"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardHeader
              title="Banned Players"
              avatar={<BlockIcon />}
              subheader={`${bannedPlayers.length} players banned`}
            />
            <CardContent
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <List sx={{ flexGrow: 1, overflow: "auto", padding: 0 }}>
                {bannedPlayers.length > 0 ? (
                  bannedPlayers.map((player) => (
                    <ListItem
                      key={player.uuid}
                      onClick={() => handlePlayerClick(player)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: "4px",
                        padding: "8px 16px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {player.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 1 }}
                  >
                    No banned players
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ height: "50%" }}>
          <Card
            className="minecraft-card"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardHeader
              title="Whitelist"
              avatar={<PlaylistAddCheckIcon />}
              action={
                <Switch
                  checked={whitelistEnabled}
                  onChange={(e) => setWhitelistEnabled(e.target.checked)}
                />
              }
            />
            <CardContent
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {whitelistEnabled ? (
                <List sx={{ flexGrow: 1, overflow: "auto", padding: 0 }}>
                  {whitelistedPlayers.length > 0 ? (
                    whitelistedPlayers.map((player) => (
                      <ListItem
                        key={player.uuid}
                        sx={{ padding: "8px 16px" }}
                        secondaryAction={
                          <Switch
                            edge="end"
                            checked={player.isWhitelisted}
                            onChange={() => handleWhitelistToggle(player)}
                          />
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="bold">
                              {player.name}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ p: 1 }}
                    >
                      No players on whitelist
                    </Typography>
                  )}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 1 }}
                >
                  Enable whitelist to manage whitelisted players
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Player Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {selectedPlayer?.name}
          </Typography>
          {selectedPlayer?.isOnline && (
            <Chip
              size="small"
              label="Online"
              color="success"
              sx={{
                ml: 1,
                boxShadow: "none",
                "& .MuiChip-label": {
                  fontWeight: "medium",
                  textShadow: "none",
                },
              }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              UUID: {selectedPlayer?.uuid}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Last login:{" "}
              {selectedPlayer?.lastLogin
                ? new Date(selectedPlayer.lastLogin).toLocaleString()
                : "Never"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Player Actions
            </Typography>

            {selectedPlayer?.isOnline && (
              <Button
                variant="outlined"
                color="warning"
                sx={{ mr: 1, mb: 2 }}
                onClick={handleKickPlayer}
                className="minecraft-btn"
              >
                Kick Player
              </Button>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Ban Reason"
                fullWidth
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={handleBanPlayer}
                disabled={selectedPlayer?.isBanned}
                className="minecraft-btn"
              >
                {selectedPlayer?.isBanned ? "Player is Banned" : "Ban Player"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Operator Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={opLevel > 0}
                  onChange={(e) => setOpLevel(e.target.checked ? 1 : 0)}
                />
              }
              label="Operator"
            />

            {opLevel > 0 && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Operator Level</InputLabel>
                  <Select
                    value={opLevel}
                    label="Operator Level"
                    onChange={(e) => setOpLevel(Number(e.target.value))}
                  >
                    <MenuItem value={1}>Level 1</MenuItem>
                    <MenuItem value={2}>Level 2</MenuItem>
                    <MenuItem value={3}>Level 3</MenuItem>
                    <MenuItem value={4}>Level 4</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={bypassLimit}
                      onChange={(e) => setBypassLimit(e.target.checked)}
                    />
                  }
                  label="Bypass Player Limit"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleOpChange}
            variant="contained"
            color="primary"
            className="minecraft-btn"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

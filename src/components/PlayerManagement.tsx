import React, { useEffect, useState } from "react";
import { Player, PlayerBanKick, PlayerOp } from "../types";
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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Grid from "@mui/material/Grid2";

interface PlayerManagementProps {
  worldId: string;
  worldActive: boolean;
  players: Player[];
  isWhitelistEnabled: boolean;
  onPlayerWhitelist: (player: Player) => Promise<void>;
  onPlayerBan: (player: PlayerBanKick) => Promise<void>;
  onPlayerKick: (player: PlayerBanKick) => Promise<void>;
  onPlayerOp: (player: PlayerOp) => Promise<void>;
  onPlayerRemoveOp: (player: PlayerOp) => Promise<void>;
  onToggleWhitelist: (enabled: boolean) => Promise<void>;
  onPlayerPardon: (player: Player) => Promise<void>;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  worldId,
  worldActive,
  players,
  isWhitelistEnabled,
  onPlayerWhitelist,
  onPlayerBan,
  onPlayerKick,
  onPlayerOp,
  onPlayerRemoveOp,
  onToggleWhitelist,
  onPlayerPardon,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [opLevel, setOpLevel] = useState<number>(0);
  const [isOp, setIsOp] = useState<boolean>(false);
  const [bypassLimit, setBypassLimit] = useState(false);
  const [whitelistEnabled, setWhitelistEnabled] = useState(isWhitelistEnabled);
  const [isWhitelistLoading, setIsWhitelistLoading] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setWhitelistEnabled(isWhitelistEnabled);
  }, [isWhitelistEnabled]);

  const playersArray = Array.isArray(players) ? players : [];
  console.log(playersArray);
  const onlinePlayers = playersArray.filter((player) => player.isOnline);
  const bannedPlayers = playersArray.filter((player) => player.isBanned);
  const whitelistedPlayers = playersArray.filter(
    (player) => player.isWhitelisted
  );
  const opPlayers = playersArray.filter((player) => player.isOp);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpLevel(player.opLevel);
    setIsOp(player.isOp);
    setBypassLimit(player.bypassesPlayerLimit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlayer(null);
    setReason("");
    setOpLevel(0);
    setIsOp(false);
    setBypassLimit(false);
  };

  const handleBanPlayer = async () => {
    if (selectedPlayer) {
      const playerBanKick: PlayerBanKick = {
        uuid: selectedPlayer.uuid,
        name: selectedPlayer.name,
        reason: reason,
      };
      await onPlayerBan(playerBanKick);
      handleCloseDialog();
    }
  };

  const handleKickPlayer = async () => {
    if (selectedPlayer) {
      const playerBanKick: PlayerBanKick = {
        uuid: selectedPlayer.uuid,
        name: selectedPlayer.name,
        reason: reason,
      };
      await onPlayerKick(playerBanKick);
      handleCloseDialog();
    }
  };

  const handleOpChange = async () => {
    if (selectedPlayer) {
      if (isOp) {
        const player: PlayerOp = {
          uuid: selectedPlayer.uuid,
          name: selectedPlayer.name,
          op: true,
          level: opLevel,
          bypassesPlayerLimit: bypassLimit,
        };
        await onPlayerOp(player);
      } else {
        const player: PlayerOp = {
          uuid: selectedPlayer.uuid,
          name: selectedPlayer.name,
          op: false,
          level: 0,
          bypassesPlayerLimit: false,
        };
        await onPlayerRemoveOp(player);
      }
      handleCloseDialog();
    }
  };

  const handleWhitelistToggle = async (player: Player) => {
    const selectedPlayer: Player = {
      ...player,
      isWhitelisted: !player.isWhitelisted,
    };
    setIsWhitelistLoading(true);
    try {
      await onPlayerWhitelist(selectedPlayer);
    } catch (error) {
      console.error("Failed to update player whitelist status:", error);
    } finally {
      setIsWhitelistLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ height: "100%", flexGrow: 1 }}>
        {/* First row - split between All Players and OP Players - 50% height */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ height: "50%" }}>
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

        <Grid size={{ xs: 12, md: 6 }} sx={{ height: "50%" }}>
          <Card
            className="minecraft-card"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardHeader
              title="Operator Players"
              avatar={<AdminPanelSettingsIcon />}
              subheader={`${opPlayers.length} operators`}
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
                {opPlayers.length > 0 ? (
                  opPlayers.map((player) => (
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
                        secondary={`OP Level: ${player.opLevel}`}
                      />
                      {player.isOnline && (
                        <FiberManualRecordIcon
                          fontSize="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 1 }}
                  >
                    No operator players
                  </Typography>
                )}
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
                      secondaryAction={
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          className="minecraft-btn"
                          disabled={!worldActive}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the player dialog
                            onPlayerPardon(player);
                          }}
                        >
                          Pardon
                        </Button>
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
                  disabled={isWhitelistLoading}
                  onChange={async (e) => {
                    const newState = e.target.checked;
                    setWhitelistEnabled(newState);
                    setIsWhitelistLoading(true);
                    try {
                      await onToggleWhitelist(newState);
                    } catch (error) {
                      console.error("Failed to toggle whitelist:", error);
                      // Revert the local state if the server update fails
                      setWhitelistEnabled(!newState);
                    } finally {
                      setIsWhitelistLoading(false);
                    }
                  }}
                />
              }
              subheader={
                isWhitelistLoading
                  ? "Updating whitelist..."
                  : whitelistEnabled
                  ? `${whitelistedPlayers.length} of ${playersArray.length} players whitelisted`
                  : "Whitelist is disabled"
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
                  {playersArray.length > 0 ? (
                    playersArray.map((player) => (
                      <ListItem
                        key={player.uuid}
                        sx={{ padding: "8px 16px" }}
                        secondaryAction={
                          <Switch
                            edge="end"
                            checked={player.isWhitelisted}
                            disabled={isWhitelistLoading}
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
                      No players available
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

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Ban Reason"
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mb: 1 }}
                disabled={selectedPlayer?.isBanned}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={handleBanPlayer}
                disabled={selectedPlayer?.isBanned || !worldActive}
                className="minecraft-btn"
                sx={{ mr: 1, mb: 2 }}
              >
                {selectedPlayer?.isBanned ? "Player is Banned" : "Ban Player"}
              </Button>
              {selectedPlayer?.isBanned && (
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!worldActive}
                  onClick={() => {
                    if (selectedPlayer) {
                      onPlayerPardon(selectedPlayer);
                      handleCloseDialog();
                    }
                  }}
                  className="minecraft-btn"
                  sx={{ mr: 1, mb: 2 }}
                >
                  Pardon Player
                </Button>
              )}
              <Button
                variant="outlined"
                color="warning"
                disabled={!selectedPlayer?.isOnline || !worldActive}
                onClick={handleKickPlayer}
                className="minecraft-btn"
                sx={{ mr: 1, mb: 2 }}
              >
                Kick Player
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Operator Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isOp}
                  onChange={(e) => {
                    setIsOp(e.target.checked);
                    if (e.target.checked && opLevel === 0) {
                      setOpLevel(1);
                    }
                  }}
                  disabled={selectedPlayer?.isBanned || !worldActive}
                />
              }
              label="Operator"
            />

            {isOp && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Operator Level</InputLabel>
                  <Select
                    value={opLevel}
                    label="Operator Level"
                    onChange={(e) => setOpLevel(Number(e.target.value))}
                  >
                    <MenuItem value={0}>Level 0</MenuItem>
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
            disabled={!worldActive}
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

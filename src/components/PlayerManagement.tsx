import React from "react";
import { Player } from "../types";
import { Box, List, ListItem, ListItemText, Switch } from "@mui/material";

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
  return (
    <Box>
      <List>
        {players.map((player) => (
          <ListItem
            key={player.username}
            secondaryAction={
              <Box>
                <Switch
                  checked={player.isWhitelisted}
                  onChange={() => onPlayerChange(player.username, "whitelist")}
                  color="primary"
                />
                <Switch
                  checked={player.isBlacklisted}
                  onChange={() => onPlayerChange(player.username, "blacklist")}
                  color="error"
                />
              </Box>
            }
          >
            <ListItemText
              primary={player.username}
              secondary={player.isOnline ? "Online" : "Offline"}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

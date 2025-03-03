import { ServerProperty } from "../types";

export const SERVER_PROPERTY_DEFINITIONS: Record<
  string,
  Partial<ServerProperty>
> = {
  // Network Properties
  "server-port": {
    type: "number",
    important: true,
    label: "Server Port",
    description: "The port your server will listen on. Default: 25565",
  },
  "server-ip": {
    type: "text",
    important: false,
    label: "Server IP",
    description:
      "The IP address your server will bind to. Leave blank to bind to all interfaces.",
  },
  "online-mode": {
    type: "boolean",
    important: true,
    label: "Online Mode (Premium)",
    description:
      "If true, the server will verify that players are authenticated to Minecraft. Set to false for offline mode.",
  },
  "network-compression-threshold": {
    type: "number",
    important: false,
    label: "Network Compression Threshold",
    description:
      "By default it allows packets that are n-1 bytes big to go normally, but a packet of n bytes or more gets compressed. -1 disables compression entirely.",
  },
  "prevent-proxy-connections": {
    type: "boolean",
    important: false,
    label: "Prevent Proxy Connections",
    description:
      "If true, the server will prevent players from connecting through proxies or VPNs.",
  },

  // Game Rules
  difficulty: {
    type: "select",
    options: ["peaceful", "easy", "normal", "hard"],
    important: true,
    label: "Difficulty",
    description:
      "Sets the game difficulty. Affects monster spawning, hunger, and damage.",
  },
  gamemode: {
    type: "select",
    options: ["survival", "creative", "adventure", "spectator"],
    important: true,
    label: "Game Mode",
    description:
      "Sets the default game mode for new players joining the server.",
  },
  hardcore: {
    type: "boolean",
    important: false,
    label: "Hardcore Mode",
    description:
      "If true, players will be set to spectator mode when they die. Effectively sets difficulty to hard.",
  },
  pvp: {
    type: "boolean",
    important: true,
    label: "PvP Enabled",
    description:
      "If true, players can damage each other. If false, players cannot deal damage to other players.",
  },
  "force-gamemode": {
    type: "boolean",
    important: false,
    label: "Force Gamemode",
    description:
      "If true, players will always join in the default gamemode instead of the one they had when they left.",
  },

  // World Generation
  "level-name": {
    type: "text",
    important: true,
    label: "Level Name",
    description: "The name of the world folder and also the name of the world.",
  },
  "level-type": {
    type: "select",
    options: [
      "minecraft:normal",
      "minecraft:flat",
      "minecraft:large_biomes",
      "minecraft:amplified",
    ],
    important: false,
    label: "World Type",
    description:
      "Determines the world generation type. Normal is standard, flat is superflat, large_biomes increases biome size, and amplified creates extreme mountains.",
  },
  "level-seed": {
    type: "text",
    important: false,
    label: "World Seed",
    description:
      "The seed used for generating new chunks. Leave blank for a random seed.",
  },
  "generate-structures": {
    type: "boolean",
    important: false,
    label: "Generate Structures",
    description:
      "If true, villages, strongholds, and other structures will generate. If false, no structures will generate.",
  },
  "generator-settings": {
    type: "text",
    important: false,
    label: "Generator Settings",
    description:
      "JSON settings for world generation, particularly useful for customizing superflat worlds.",
  },
  "max-world-size": {
    type: "number",
    important: false,
    label: "Maximum World Size",
    description:
      "Sets the maximum possible size in blocks for the world border, measured from the center. Default: 29999984.",
  },

  // Performance Settings
  "view-distance": {
    type: "number",
    important: false,
    label: "View Distance",
    description:
      "The maximum distance (in chunks) that players can see. Lower values improve server performance.",
  },
  "simulation-distance": {
    type: "number",
    important: false,
    label: "Simulation Distance",
    description:
      "The maximum distance (in chunks) from players that game mechanics will be processed. Lower values improve server performance.",
  },
  "max-tick-time": {
    type: "number",
    important: false,
    label: "Max Tick Time",
    description:
      "The maximum time (in milliseconds) that a single tick may take before the server watchdog stops the server. Set to -1 to disable watchdog entirely.",
  },
  "entity-broadcast-range-percentage": {
    type: "number",
    important: false,
    label: "Entity Broadcast Range %",
    description:
      "Controls how close entities need to be before being sent to clients. Lower values can help with performance.",
  },
  "max-chained-neighbor-updates": {
    type: "number",
    important: false,
    label: "Max Chained Neighbor Updates",
    description:
      "Limits the number of consecutive neighbor updates before skipping additional ones. Prevents update loops from causing lag.",
  },

  // Player Settings
  "max-players": {
    type: "number",
    important: true,
    label: "Max Players",
    description:
      "The maximum number of players that can play on the server at the same time.",
  },
  "player-idle-timeout": {
    type: "number",
    important: false,
    label: "Player Idle Timeout (minutes)",
    description:
      "If non-zero, players are kicked after being idle for the specified number of minutes.",
  },
  "white-list": {
    type: "boolean",
    important: false,
    label: "Enable Whitelist",
    description: "If true, only players on the whitelist can join the server.",
  },
  "enforce-whitelist": {
    type: "boolean",
    important: false,
    label: "Enforce Whitelist",
    description:
      "If true, non-whitelisted players will be disconnected when the whitelist is reloaded.",
  },

  // Game Features
  "allow-nether": {
    type: "boolean",
    important: true,
    label: "Allow Nether",
    description:
      "If true, players can travel to the Nether. If false, Nether portals won't work.",
  },
  "allow-flight": {
    type: "boolean",
    important: false,
    label: "Allow Flight",
    description:
      "If false, the server will attempt to stop players from flying if they're not in creative mode.",
  },
  "spawn-monsters": {
    type: "boolean",
    important: true,
    label: "Spawn Monsters",
    description:
      "If true, monsters will spawn naturally according to the game rules.",
  },
  "spawn-animals": {
    type: "boolean",
    important: true,
    label: "Spawn Animals",
    description:
      "If true, animals will spawn naturally according to the game rules.",
  },
  "spawn-protection": {
    type: "number",
    important: true,
    label: "Spawn Protection Radius",
    description:
      "The radius around the spawn point where only operators can build. Set to 0 to disable.",
  },
  "enable-command-block": {
    type: "boolean",
    important: false,
    label: "Enable Command Blocks",
    description: "If true, command blocks can be used on the server.",
  },

  // Server Information
  motd: {
    type: "text",
    important: true,
    label: "Message of the Day",
    description:
      "The message shown in the server list. Supports formatting codes with the § symbol.",
  },
  "hide-online-players": {
    type: "boolean",
    important: false,
    label: "Hide Online Players",
    description:
      "If true, the server will not send the list of players in the server status response.",
  },

  // Resource Pack
  "resource-pack": {
    type: "text",
    important: false,
    label: "Resource Pack URL",
    description:
      "URL to a resource pack that will be suggested to players when they join.",
  },
  "require-resource-pack": {
    type: "boolean",
    important: false,
    label: "Require Resource Pack",
    description:
      "If true, players must accept the resource pack to join the server.",
  },
  "resource-pack-prompt": {
    type: "text",
    important: false,
    label: "Resource Pack Prompt",
    description:
      "Text shown to players when they're prompted to download the resource pack.",
  },

  // RCON and Query
  "enable-rcon": {
    type: "boolean",
    important: false,
    label: "Enable RCON",
    description:
      "If true, enables remote access to the server console using RCON protocol.",
  },
  "rcon.port": {
    type: "number",
    important: false,
    label: "RCON Port",
    description:
      "Port for RCON remote access. Only active if enable-rcon is true.",
  },
  "enable-query": {
    type: "boolean",
    important: false,
    label: "Enable Query",
    description:
      "If true, enables GameSpy4 query protocol for gathering server information.",
  },
  "query.port": {
    type: "number",
    important: false,
    label: "Query Port",
    description:
      "Port for GameSpy4 query protocol. Only active if enable-query is true.",
  },

  // Misc
  "sync-chunk-writes": {
    type: "boolean",
    important: false,
    label: "Sync Chunk Writes",
    description:
      "If true, chunks will be written to disk synchronously to prevent data corruption in case of a crash.",
  },
  "enable-jmx-monitoring": {
    type: "boolean",
    important: false,
    label: "Enable JMX Monitoring",
    description:
      "If true, exposes JMX metrics for monitoring the server's performance.",
  },
  "function-permission-level": {
    type: "number",
    important: false,
    label: "Function Permission Level",
    description:
      "Permission level required to run function commands (0-4). Higher levels grant more permissions.",
  },
  "op-permission-level": {
    type: "number",
    important: false,
    label: "Operator Permission Level",
    description:
      "Permission level granted to operators (1-4). Higher levels grant more permissions.",
  },
  "text-filtering-config": {
    type: "text",
    important: false,
    label: "Text Filtering Config",
    description:
      "Path to a file containing chat filter rules. Used for filtering inappropriate chat messages.",
  },
};

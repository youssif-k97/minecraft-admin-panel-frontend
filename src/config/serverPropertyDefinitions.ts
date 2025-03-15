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
    disabled: true,
  },
  "server-ip": {
    type: "text",
    important: false,
    label: "Server IP",
    description:
      "The IP address your server will bind to. Leave blank to bind to all interfaces.",
    disabled: true,
  },
  "online-mode": {
    type: "boolean",
    important: true,
    label: "Online Mode",
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
  "use-native-transport": {
    type: "boolean",
    important: false,
    label: "Use Native Transport",
    description:
      "If true, the server will use native transport mechanisms which can improve performance.",
  },
  "rate-limit": {
    type: "number",
    important: false,
    label: "Rate Limit",
    description:
      "Sets the maximum number of packets a user can send before getting kicked. 0 disables this feature.",
  },
  "enable-status": {
    type: "boolean",
    important: false,
    label: "Enable Status",
    description:
      "If true, the server will respond to status requests in the server list.",
  },
  "log-ips": {
    type: "boolean",
    important: false,
    label: "Log IPs",
    description:
      "If true, the server will log player IP addresses in the server logs.",
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
  "region-file-compression": {
    type: "select",
    options: ["deflate", "none"],
    important: false,
    label: "Region File Compression",
    description:
      "The compression method used for region files. 'deflate' is the default and provides good compression.",
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
  "pause-when-empty-seconds": {
    type: "number",
    important: false,
    label: "Pause When Empty (seconds)",
    description:
      "Number of seconds to wait before pausing the server when no players are online. 0 disables this feature.",
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
  "enforce-secure-profile": {
    type: "boolean",
    important: false,
    label: "Enforce Secure Profile",
    description:
      "If true, players without a secure profile will be disconnected.",
  },
  "accepts-transfers": {
    type: "boolean",
    important: false,
    label: "Accept Transfers",
    description:
      "If true, the server will accept player transfers from other servers.",
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
  "broadcast-console-to-ops": {
    type: "boolean",
    important: false,
    label: "Broadcast Console to Ops",
    description: "If true, console commands will be broadcast to operators.",
  },
  "broadcast-rcon-to-ops": {
    type: "boolean",
    important: false,
    label: "Broadcast RCON to Ops",
    description: "If true, RCON commands will be broadcast to operators.",
  },
  "bug-report-link": {
    type: "text",
    important: false,
    label: "Bug Report Link",
    description: "URL where players can report bugs related to the server.",
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
  "resource-pack-id": {
    type: "text",
    important: false,
    label: "Resource Pack ID",
    description: "A unique identifier for the resource pack.",
  },
  "resource-pack-sha1": {
    type: "text",
    important: false,
    label: "Resource Pack SHA1",
    description: "SHA1 hash of the resource pack file for verification.",
  },
  "initial-enabled-packs": {
    type: "text",
    important: false,
    label: "Initial Enabled Packs",
    description: "Comma-separated list of data packs to enable by default.",
  },
  "initial-disabled-packs": {
    type: "text",
    important: false,
    label: "Initial Disabled Packs",
    description: "Comma-separated list of data packs to disable by default.",
  },

  // RCON and Query
  "enable-rcon": {
    type: "boolean",
    important: false,
    label: "Enable RCON",
    description:
      "If true, enables remote access to the server console using RCON protocol.",
    disabled: true,
  },
  "rcon.port": {
    type: "number",
    important: false,
    label: "RCON Port",
    description:
      "Port for RCON remote access. Only active if enable-rcon is true.",
    disabled: true,
  },
  "rcon.password": {
    type: "text",
    important: false,
    label: "RCON Password",
    description:
      "Password for RCON remote access. Only active if enable-rcon is true.",
    disabled: true,
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
  "text-filtering-config": {
    type: "text",
    important: false,
    label: "Text Filtering Config",
    description:
      "Path to a file containing chat filter rules. Used for filtering inappropriate chat messages.",
  },
  "text-filtering-version": {
    type: "number",
    important: false,
    label: "Text Filtering Version",
    description: "Version of the text filtering system to use.",
  },
};

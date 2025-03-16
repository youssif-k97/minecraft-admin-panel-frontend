export interface MinecraftWorld {
  id: string;
  name: string;
  isActive: boolean;
  players?: string[];
  properties?: Record<string, string>;
  port: number;
  ram: {
    min: number;
    max: number;
  };
}

export interface WorldConfig {
  worldName: string;
  serverVersion: string;
  port: number;
  minMemory: number;
  maxMemory: number;
  createdAt: string;
  lastStarted: string;
  lastBackup: string;
}

export interface MinecraftVersion {
  id: string;
  type: string;
  url: string;
  time: string;
  releaseTime: string;
}
export interface Player {
  uuid: string;
  name: string;
  lastLogin: string;
  isOnline: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
  isOp: boolean;
  opLevel: number;
  bypassesPlayerLimit: boolean;
}
export interface PlayerBanKick {
  uuid: string;
  name: string;
  reason: string;
}

export interface PlayerOp {
  uuid: string;
  name: string;
  op: boolean;
  level: number;
  bypassesPlayerLimit: boolean;
}

export interface ServerProperty {
  key: string;
  value: string;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
  important?: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export interface Datapack {
  name: string;
  uploadDate: string;
}

export interface LogMessage {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  raw: string;
}

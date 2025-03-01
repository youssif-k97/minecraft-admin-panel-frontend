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
  username: string;
  lastLogin: string;
  isOnline: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
  isOp: boolean;
}

export interface ServerProperty {
  key: string;
  value: string;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
  important?: boolean;
  label?: string;
  description?: string;
}

export interface Datapack {
  name: string;
  uploadDate: string;
}

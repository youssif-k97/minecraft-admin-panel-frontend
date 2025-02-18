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
  username: string;
  isOnline: boolean;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
}

export interface ServerProperty {
  key: string;
  value: string;
  type: "boolean" | "text" | "number" | "select";
  options?: string[];
  important?: boolean;
  label?: string;
}

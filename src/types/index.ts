export interface MinecraftWorld {
  id: string;
  name: string;
  isActive: boolean;
  players?: string[];
  properties?: Record<string, string>;
  customProperties?: Record<string, string>;
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

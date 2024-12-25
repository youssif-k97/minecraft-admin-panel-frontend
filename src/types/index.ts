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

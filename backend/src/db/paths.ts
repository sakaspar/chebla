import path from "path";

const dataDir = path.join(process.cwd(), "data");

export const DATA_PATHS = {
  clients: path.join(dataDir, "clients.json"),
  orders: path.join(dataDir, "orders.json"),
  services: path.join(dataDir, "services.json"),
  notifications: path.join(dataDir, "notifications.json"),
  admin: path.join(dataDir, "admin.json"),
  refreshTokens: path.join(dataDir, "refreshTokens.json")
};

import { DATA_PATHS } from "./paths";
import { readJsonFile, writeJsonFile } from "./jsonStore";
import { Admin, Client, Notification, Order, RefreshTokenRecord, Service } from "../types/models";

export const repo = {
  clients: {
    all: () => readJsonFile<Client[]>(DATA_PATHS.clients, []),
    save: (items: Client[]) => writeJsonFile(DATA_PATHS.clients, items)
  },
  orders: {
    all: () => readJsonFile<Order[]>(DATA_PATHS.orders, []),
    save: (items: Order[]) => writeJsonFile(DATA_PATHS.orders, items)
  },
  services: {
    all: () => readJsonFile<Service[]>(DATA_PATHS.services, []),
    save: (items: Service[]) => writeJsonFile(DATA_PATHS.services, items)
  },
  notifications: {
    all: () => readJsonFile<Notification[]>(DATA_PATHS.notifications, []),
    save: (items: Notification[]) => writeJsonFile(DATA_PATHS.notifications, items)
  },
  admin: {
    all: () => readJsonFile<Admin[]>(DATA_PATHS.admin, []),
    save: (items: Admin[]) => writeJsonFile(DATA_PATHS.admin, items)
  },
  refreshTokens: {
    all: () => readJsonFile<RefreshTokenRecord[]>(DATA_PATHS.refreshTokens, []),
    save: (items: RefreshTokenRecord[]) => writeJsonFile(DATA_PATHS.refreshTokens, items)
  }
};

import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { Role } from "../types/models";

export const createNotification = async (userId: string, role: Role, message: string): Promise<void> => {
  const notifications = await repo.notifications.all();
  notifications.push({
    id: uuid(),
    userId,
    role,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  });
  await repo.notifications.save(notifications);
};

import { Request, Response } from "express";
import { repo } from "../db/repositories";
import { fail, ok } from "../services/http";

export const getProfile = async (req: Request, res: Response) => {
  const clients = await repo.clients.all();
  const client = clients.find((c) => c.id === req.auth?.userId);
  if (!client) return fail(res, "Client not found", 404);
  const { passwordHash, ...safe } = client;
  return ok(res, safe);
};

export const patchProfile = async (req: Request, res: Response) => {
  const clients = await repo.clients.all();
  const idx = clients.findIndex((c) => c.id === req.auth?.userId);
  if (idx < 0) return fail(res, "Client not found", 404);
  clients[idx] = { ...clients[idx], ...req.body };
  await repo.clients.save(clients);
  const { passwordHash, ...safe } = clients[idx];
  return ok(res, safe);
};

export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await repo.orders.all();
  return ok(res, orders.filter((o) => o.clientId === req.auth?.userId));
};

export const getMyOrder = async (req: Request, res: Response) => {
  const orders = await repo.orders.all();
  const order = orders.find((o) => o.id === req.params.id && o.clientId === req.auth?.userId);
  if (!order) return fail(res, "Order not found", 404);
  return ok(res, order);
};

export const getMyNotifications = async (req: Request, res: Response) => {
  const notifications = await repo.notifications.all();
  return ok(
    res,
    notifications.filter((n) => n.userId === req.auth?.userId && n.role === "client" && !n.isRead)
  );
};

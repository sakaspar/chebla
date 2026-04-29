import { Request, Response } from "express";
import { repo } from "../db/repositories";
import { fail, ok } from "../services/http";
import { createNotification } from "../services/notificationService";

export const listOrders = async (req: Request, res: Response) => {
  const { status } = req.query;
  const orders = await repo.orders.all();
  const clients = await repo.clients.all();
  const filtered = status ? orders.filter((o) => o.status === status) : orders;

  const ordersWithClientName = filtered.map((order) => {
    const client = clients.find((c) => c.id === order.clientId);
    return {
      ...order,
      clientName: client?.name ?? "Unknown"
    };
  });

  return ok(res, ordersWithClientName);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const orders = await repo.orders.all();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx < 0) return fail(res, "Order not found", 404);
  orders[idx].status = req.body.status;
  orders[idx].updatedAt = new Date().toISOString();
  await repo.orders.save(orders);
  await createNotification(orders[idx].clientId, "client", `Order ${orders[idx].id} is now ${orders[idx].status}.`);
  return ok(res, orders[idx]);
};

export const updateOrderNotes = async (req: Request, res: Response) => {
  const orders = await repo.orders.all();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx < 0) return fail(res, "Order not found", 404);
  orders[idx].adminNotes = req.body.adminNotes;
  orders[idx].updatedAt = new Date().toISOString();
  await repo.orders.save(orders);
  return ok(res, orders[idx]);
};

export const listClients = async (_req: Request, res: Response) => {
  const clients = await repo.clients.all();
  return ok(res, clients.map(({ passwordHash, ...safe }) => safe));
};

export const getClientById = async (req: Request, res: Response) => {
  const clients = await repo.clients.all();
  const client = clients.find((c) => c.id === req.params.id);
  if (!client) return fail(res, "Client not found", 404);
  const orders = await repo.orders.all();
  const { passwordHash, ...safe } = client;
  return ok(res, { client: safe, orders: orders.filter((o) => o.clientId === client.id) });
};

export const getAdminNotifications = async (_req: Request, res: Response) => {
  const notifications = await repo.notifications.all();
  return ok(res, notifications.filter((n) => n.role === "admin" && !n.isRead));
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  const orders = await repo.orders.all();
  const clients = await repo.clients.all();
  return ok(res, {
    totalOrders: orders.length,
    totalClients: clients.length,
    revenue: orders.reduce((sum, order) => sum + order.totalPrice, 0)
  });
};

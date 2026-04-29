import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { createNotification } from "../services/notificationService";
import { fail, ok } from "../services/http";

export const createOrder = async (req: Request, res: Response) => {
  const { serviceId, brief } = req.body as { serviceId?: string; brief?: string };
  if (!serviceId || !brief) return fail(res, "Missing required fields");
  const service = (await repo.services.all()).find((s) => s.id === serviceId && s.isActive);
  if (!service) return fail(res, "Service not found", 404);

  const orderId = req.body.orderId as string;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const order = {
    id: orderId,
    clientId: req.auth!.userId,
    serviceId,
    status: "pending" as const,
    brief,
    attachments: files.map((f) => f.path.replace(/\\/g, "/")),
    totalPrice: service.price,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  const orders = await repo.orders.all();
  orders.push(order);
  await repo.orders.save(orders);
  await createNotification(req.auth!.userId, "client", `Order ${order.id} placed successfully.`);
  await createNotification("admin", "admin", `New order ${order.id} requires review.`);
  return ok(res, order, 201);
};

export const getOrderById = async (req: Request, res: Response) => {
  const orders = await repo.orders.all();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return fail(res, "Order not found", 404);
  if (req.auth?.role === "client" && order.clientId !== req.auth.userId) return fail(res, "Forbidden", 403);

  const client = (await repo.clients.all()).find((c) => c.id === order.clientId);
  const service = (await repo.services.all()).find((s) => s.id === order.serviceId);

  return ok(res, {
    ...order,
    client: client ? { name: client.name, email: client.email, phone: client.phone } : null,
    serviceTitle: service?.title ?? "Unknown Service"
  });
};

export const addOrderMessage = async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };
  if (!message?.trim()) return fail(res, "Message is required");
  const orders = await repo.orders.all();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx < 0) return fail(res, "Order not found", 404);
  const order = orders[idx];
  if (req.auth?.role === "client" && order.clientId !== req.auth.userId) return fail(res, "Forbidden", 403);

  const newMessage = {
    id: uuid(),
    senderId: req.auth!.userId,
    senderRole: req.auth!.role,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  order.messages = [...(order.messages ?? []), newMessage];
  order.updatedAt = new Date().toISOString();
  orders[idx] = order;
  await repo.orders.save(orders);

  if (req.auth?.role === "admin") {
    await createNotification(order.clientId, "client", `New message from admin on order ${order.id}.`);
  } else {
    await createNotification("admin", "admin", `New client message on order ${order.id}.`);
  }

  return ok(res, newMessage, 201);
};

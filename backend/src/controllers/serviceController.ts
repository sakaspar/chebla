import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { fail, ok } from "../services/http";

export const listServices = async (_req: Request, res: Response) => {
  const services = await repo.services.all();
  return ok(res, services.filter((s) => s.isActive));
};

export const getService = async (req: Request, res: Response) => {
  const service = (await repo.services.all()).find((s) => s.id === req.params.id && s.isActive);
  if (!service) return fail(res, "Service not found", 404);
  return ok(res, service);
};

export const createService = async (req: Request, res: Response) => {
  const services = await repo.services.all();
  const created = { id: uuid(), ...req.body, isActive: true };
  services.push(created);
  await repo.services.save(services);
  return ok(res, created, 201);
};

export const patchService = async (req: Request, res: Response) => {
  const services = await repo.services.all();
  const idx = services.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return fail(res, "Service not found", 404);
  services[idx] = { ...services[idx], ...req.body };
  await repo.services.save(services);
  return ok(res, services[idx]);
};

export const deactivateService = async (req: Request, res: Response) => {
  const services = await repo.services.all();
  const idx = services.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return fail(res, "Service not found", 404);
  services[idx].isActive = false;
  await repo.services.save(services);
  return ok(res, { id: req.params.id, deactivated: true });
};

import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { hashPassword } from "./authService";

export const seedDataIfNeeded = async (): Promise<void> => {
  const admins = await repo.admin.all();
  if (admins.length === 0) {
    admins.push({
      id: uuid(),
      email: process.env.ADMIN_EMAIL ?? "admin@agency.local",
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD ?? "admin123456")
    });
    await repo.admin.save(admins);
  }

  const services = await repo.services.all();
  if (services.length === 0) {
    const now = [
      { title: "Video Creation Basic", category: "video", price: 300, deliveryDays: 5 },
      { title: "Video Creation Premium", category: "video", price: 900, deliveryDays: 10 },
      { title: "Facebook Ads Starter", category: "facebook_ads", price: 250, deliveryDays: 7 },
      { title: "Facebook Ads Growth", category: "facebook_ads", price: 700, deliveryDays: 14 },
      { title: "Google SEO Local", category: "seo_google", price: 400, deliveryDays: 20 },
      { title: "Google SEO National", category: "seo_google", price: 1200, deliveryDays: 30 }
    ];
    await repo.services.save(
      now.map((service) => ({
        id: uuid(),
        title: service.title,
        category: service.category as "video" | "facebook_ads" | "seo_google",
        description: `${service.title} package`,
        price: service.price,
        deliveryDays: service.deliveryDays,
        isActive: true
      }))
    );
  }
};

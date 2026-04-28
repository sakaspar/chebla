import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes";
import clientRoutes from "./routes/clientRoutes";
import orderRoutes from "./routes/orderRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import adminRoutes from "./routes/adminRoutes";
import { fail } from "./services/http";
import { seedDataIfNeeded } from "./services/seedService";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => fail(res, "Not found", 404));

const port = Number(process.env.PORT ?? 4000);
seedDataIfNeeded().then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on ${port}`);
  });
});

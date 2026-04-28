import { FormEvent, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";

export function ClientDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    void api.get("/client/orders").then((res) => setOrders(res.data.data ?? []));
    void api.get("/client/notifications").then((res) => setNotifications(res.data.data ?? []));
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Active Orders</h3>
        <p className="mt-2 text-3xl">{orders.filter((o) => o.status !== "delivered").length}</p>
      </article>
      <article className="rounded bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Unread Notifications</h3>
        <p className="mt-2 text-3xl">{notifications.length}</p>
      </article>
      <article className="rounded bg-white p-4 shadow-sm md:col-span-2">
        <h3 className="mb-2 font-semibold">Your Recent Orders</h3>
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between rounded border p-2">
              <span className="text-sm">{order.id}</span>
              <StatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      </article>
    </div>
  );
}

export function NewOrderPage() {
  const { show } = useToast();
  const [params] = useSearchParams();
  const [service, setService] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [serviceSpecificValue, setServiceSpecificValue] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const serviceId = params.get("service") ?? "";

  useEffect(() => {
    if (!serviceId) return;
    void api.get(`/services/${serviceId}`).then((res) => setService(res.data.data));
  }, [serviceId]);

  const serviceFieldLabel =
    service?.category === "facebook_ads"
      ? "Facebook Page Link"
      : service?.category === "seo_google"
        ? "Website Link"
        : service?.category === "video"
          ? "Product Description"
          : "Service Details";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId || !name || !phone || !whatsapp || !serviceSpecificValue) {
      show("Please fill all required fields");
      return;
    }
    const formData = new FormData();
    const brief = [
      `Client Name: ${name}`,
      `Phone Number: ${phone}`,
      `WhatsApp Contact: ${whatsapp}`,
      `${serviceFieldLabel}: ${serviceSpecificValue}`,
      "",
      `Brief: ${projectBrief}`
    ].join("\n");
    formData.append("serviceId", serviceId);
    formData.append("brief", brief);
    Array.from(files ?? []).forEach((file) => formData.append("attachments", file));
    await api.post("/orders", formData, { headers: { "Content-Type": "multipart/form-data" } });
    show("Order placed successfully");
  };
  return (
    <form onSubmit={submit} className="rounded bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Place New Order</h2>
      <input
        className="mb-3 w-full rounded border p-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="mb-3 w-full rounded border p-2"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        className="mb-3 w-full rounded border p-2"
        placeholder="WhatsApp Contact"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        required
      />
      <input
        className="mb-3 w-full rounded border p-2"
        placeholder={serviceFieldLabel}
        value={serviceSpecificValue}
        onChange={(e) => setServiceSpecificValue(e.target.value)}
        required
      />
      <textarea
        className="mb-3 w-full rounded border p-2"
        rows={5}
        placeholder="Additional brief (optional)"
        value={projectBrief}
        onChange={(e) => setProjectBrief(e.target.value)}
      />
      <input className="mb-3" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <button className="rounded bg-indigo-600 px-4 py-2 text-white">Submit Order</button>
    </form>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    void api.get("/client/orders").then((res) => setOrders(res.data.data ?? []));
  }, []);
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link to={`/orders/${order.id}`} key={order.id} className="flex items-center justify-between rounded bg-white p-4 shadow-sm">
          <span>{order.id}</span>
          <StatusBadge status={order.status} />
        </Link>
      ))}
    </div>
  );
}

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const { show } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState("");
  const refresh = () => void api.get(`/orders/${id}`).then((res) => setOrder(res.data.data));
  useEffect(() => {
    refresh();
  }, [id]);
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await api.post(`/orders/${id}/messages`, { message });
    setMessage("");
    show("Message sent");
    refresh();
  };
  if (!order) return <p>Loading...</p>;
  return (
    <article className="space-y-4 rounded bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Order {order.id}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-3 text-gray-600">{order.brief}</p>
      {order.adminNotes && (
        <div className="rounded border-l-4 border-indigo-500 bg-indigo-50 p-3 text-sm">
          <p className="font-semibold">Admin Notes</p>
          <p>{order.adminNotes}</p>
        </div>
      )}
      <p className="mt-2">Created: {new Date(order.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
      <section className="rounded border p-4">
        <h3 className="mb-3 font-semibold">Order Chat</h3>
        <div className="mb-3 max-h-64 space-y-2 overflow-auto">
          {(order.messages ?? []).map((msg: any) => (
            <div key={msg.id} className={`rounded p-2 text-sm ${msg.senderRole === "client" ? "bg-blue-50" : "bg-gray-100"}`}>
              <p className="font-semibold">{msg.senderRole === "client" ? "You" : "Admin"}</p>
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input className="flex-1 rounded border p-2" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message..." />
          <button className="rounded bg-indigo-600 px-3 py-2 text-white">Send</button>
        </form>
      </section>
    </article>
  );
}

export function ProfilePage() {
  const { show } = useToast();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    void api.get("/client/profile").then((res) => setProfile(res.data.data));
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await api.patch("/client/profile", profile);
    show("Profile updated");
  };
  if (!profile) return <p>Loading...</p>;
  return (
    <form onSubmit={submit} className="rounded bg-white p-6 shadow-sm">
      <input className="mb-2 w-full rounded border p-2" value={profile.name ?? ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
      <input className="mb-2 w-full rounded border p-2" value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
      <input className="mb-2 w-full rounded border p-2" value={profile.company ?? ""} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
      <button className="rounded bg-indigo-600 px-4 py-2 text-white">Save</button>
    </form>
  );
}

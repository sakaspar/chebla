import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    void api.get("/admin/dashboard/stats").then((res) => setStats(res.data.data));
  }, []);
  if (!stats) return <p>Loading...</p>;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <article className="rounded bg-white p-4 shadow-sm"><p>Total Orders</p><p className="text-3xl font-bold">{stats.totalOrders}</p></article>
      <article className="rounded bg-white p-4 shadow-sm"><p>Total Clients</p><p className="text-3xl font-bold">{stats.totalClients}</p></article>
      <article className="rounded bg-white p-4 shadow-sm"><p>Revenue</p><p className="text-3xl font-bold">TND {stats.revenue}</p></article>
    </div>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const query = status ? `?status=${status}` : "";
    void api.get(`/admin/orders${query}`).then((res) => setOrders(res.data.data ?? []));
  }, [status]);
  return (
    <section>
      <select className="mb-3 rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option><option value="pending">pending</option><option value="in_progress">in_progress</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option>
      </select>
      <div className="space-y-2">
        {orders.map((order) => (
          <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded bg-white p-3 shadow-sm">
            <span>{order.id}</span><StatusBadge status={order.status} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AdminOrderDetailPage() {
  const { show } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState("");
  const { id = "" } = useParams();
  const refresh = () => void api.get(`/orders/${id}`).then((res) => setOrder(res.data.data));
  useEffect(() => { refresh(); }, [id]);
  const updateStatus = async (status: string) => { await api.patch(`/admin/orders/${id}/status`, { status }); show("Order status updated"); refresh(); };
  const updateNotes = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.patch(`/admin/orders/${id}/notes`, { adminNotes: form.get("notes") });
    show("Admin notes saved");
    refresh();
  };
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
      <h2 className="text-xl font-bold mb-2">Order {order.id}</h2>
      <StatusBadge status={order.status} />
      <div className="mt-4 flex gap-2">{["pending","in_progress","delivered","cancelled"].map((s) => <button key={s} className="rounded border px-3 py-1" onClick={() => void updateStatus(s)}>{s}</button>)}</div>
      <form onSubmit={updateNotes} className="mt-4">
        <textarea name="notes" className="w-full rounded border p-2" defaultValue={order.adminNotes ?? ""} />
        <button className="mt-2 rounded bg-indigo-600 px-4 py-2 text-white">Save Notes</button>
      </form>
      <section className="rounded border p-4">
        <h3 className="mb-3 font-semibold">Order Chat</h3>
        <div className="mb-3 max-h-64 space-y-2 overflow-auto">
          {(order.messages ?? []).map((msg: any) => (
            <div key={msg.id} className={`rounded p-2 text-sm ${msg.senderRole === "admin" ? "bg-blue-50" : "bg-gray-100"}`}>
              <p className="font-semibold">{msg.senderRole === "admin" ? "You (Admin)" : "Client"}</p>
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input className="flex-1 rounded border p-2" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Reply to client..." />
          <button className="rounded bg-indigo-600 px-3 py-2 text-white">Send</button>
        </form>
      </section>
    </article>
  );
}

export function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { void api.get("/admin/clients").then((res) => setClients(res.data.data ?? [])); }, []);
  return <div className="space-y-2">{clients.map((c) => <Link key={c.id} to={`/admin/clients/${c.id}`} className="block rounded bg-white p-3 shadow-sm">{c.name} - {c.email}</Link>)}</div>;
}

export function AdminClientDetailPage() {
  const [payload, setPayload] = useState<any>(null);
  const { id = "" } = useParams();
  useEffect(() => { void api.get(`/admin/clients/${id}`).then((res) => setPayload(res.data.data)); }, [id]);
  if (!payload) return <p>Loading...</p>;
  return (
    <section className="space-y-3">
      <article className="rounded bg-white p-4 shadow-sm"><h3 className="font-semibold">{payload.client.name}</h3><p>{payload.client.email}</p></article>
      {payload.orders.map((o: any) => <div key={o.id} className="rounded bg-white p-3 shadow-sm">{o.id} - <StatusBadge status={o.status} /></div>)}
    </section>
  );
}

export function AdminServicesPage() {
  const { show } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const load = () => void api.get("/services").then((res) => setServices(res.data.data ?? []));
  useEffect(() => { load(); }, []);
  const create = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/admin/services", { title, category: "video", description: title, price: 100, deliveryDays: 7 });
    setTitle("");
    show("Service created");
    load();
  };
  return (
    <section>
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border p-2" placeholder="Service title" />
        <button className="rounded bg-indigo-600 px-3 py-2 text-white">Add</button>
      </form>
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="rounded bg-white p-3 shadow-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="rounded border p-2"
                value={(drafts[s.id]?.title ?? s.title) as string}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? s), title: e.target.value } }))}
              />
              <input
                className="rounded border p-2"
                value={(drafts[s.id]?.category ?? s.category) as string}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? s), category: e.target.value } }))}
              />
              <input
                className="rounded border p-2"
                type="number"
                value={Number(drafts[s.id]?.price ?? s.price)}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? s), price: Number(e.target.value) } }))}
              />
              <input
                className="rounded border p-2"
                type="number"
                value={Number(drafts[s.id]?.deliveryDays ?? s.deliveryDays)}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? s), deliveryDays: Number(e.target.value) } }))}
              />
            </div>
            <textarea
              className="mt-2 w-full rounded border p-2"
              value={(drafts[s.id]?.description ?? s.description) as string}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? s), description: e.target.value } }))}
            />
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => void api.patch(`/admin/services/${s.id}`, drafts[s.id] ?? s).then(() => { show("Service updated"); load(); })}
                className="rounded bg-indigo-600 px-3 py-1 text-white"
              >
                Save
              </button>
              <button onClick={() => void api.delete(`/admin/services/${s.id}`).then(() => { show("Service deactivated"); load(); })} className="text-red-600">Deactivate</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

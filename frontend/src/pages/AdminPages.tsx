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
            <div className="flex flex-col">
              <span className="font-semibold">{order.clientName} — {order.serviceName}</span>
              <span className="text-xs text-gray-500">{order.id}</span>
            </div>
            <StatusBadge status={order.status} />
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
  const [showPhone, setShowPhone] = useState(false);
  const { id = "" } = useParams();
  const refresh = () => void api.get(`/orders/${id}`).then((res) => setOrder(res.data.data));
  useEffect(() => {
    refresh();
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    show("Order status updated");
    refresh();
  };

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

  const maskPhone = (text: string) => {
    if (showPhone) return text;
    // Mask whatever value follows "Phone Number:" or "WhatsApp Contact:" until the end of the line
    return text.replace(/(Phone Number|WhatsApp Contact):\s*(.*)/gi, "$1: *********");
  };

  return (
    <article className="space-y-4 rounded bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">Order {order.id}</h2>
          <p className="text-sm text-gray-600">{order.serviceTitle}</p>
        </div>
        <button
          onClick={() => setShowPhone(!showPhone)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          title={showPhone ? "Hide phone numbers" : "Show phone numbers"}
        >
          {showPhone ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              Hide Private Info
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Show Private Info
            </>
          )}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="font-bold">TND {order.totalPrice}</span>
        </div>
        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <h3 className="mb-2 font-semibold">Client Info</h3>
          <p className="text-sm">Name: {order.client?.name ?? "N/A"}</p>
          <p className="text-sm">Email: {order.client?.email ?? "N/A"}</p>
          <p className="text-sm">Phone: {showPhone ? (order.client?.phone ?? "N/A") : "********"}</p>
        </div>
        {order.attachments && order.attachments.length > 0 && (
          <div className="rounded border p-4">
            <h3 className="mb-2 font-semibold">Attachments</h3>
            <div className="flex flex-wrap gap-2">
              {order.attachments.map((path: string, i: number) => (
                <a
                  key={i}
                  href={`/${path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-100"
                >
                  File {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded border bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Order Details</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700">{maskPhone(order.brief)}</pre>
      </div>
      <div className="mt-4 flex gap-2">
        {["pending", "in_progress", "delivered", "cancelled"].map((s) => (
          <button key={s} className="rounded border px-3 py-1 hover:bg-gray-50" onClick={() => void updateStatus(s)}>
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={updateNotes} className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Private)</label>
        <textarea name="notes" className="w-full rounded border p-2" defaultValue={order.adminNotes ?? ""} placeholder="Add notes for internal use..." />
        <button className="mt-2 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Save Notes</button>
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

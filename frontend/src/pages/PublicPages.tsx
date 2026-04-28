import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import cheblaVideo from "../../video/chebla.mp4";

export function LandingPage() {
  return (
    <section className="grid items-center gap-8 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">UI UX Designer</p>
        <h1 className="text-4xl font-bold">Chebla Digital Services by Malek Chebla.</h1>
        <p className="mt-4 text-gray-600">
          Malek Chebla is a UI UX designer focused on user-centered interfaces, clear interaction flows, and modern visual systems.
          He helps brands turn ideas into intuitive web experiences that convert visitors into customers.
        </p>
        <Link to="/services" className="mt-6 inline-block rounded bg-indigo-600 px-5 py-2 text-white">
          Explore Services
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border bg-black">
        <video src={cheblaVideo} autoPlay muted playsInline controls className="h-full w-full object-cover" />
      </div>
    </section>
  );
}

export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  useEffect(() => {
    void api.get("/services").then((res) => setServices(res.data.data ?? []));
  }, []);
  const filtered = category === "all" ? services : services.filter((s) => s.category === category);
  return (
    <section>
      <div className="mb-4 flex gap-2">
        {["all", "video", "facebook_ads", "seo_google"].map((c) => (
          <button key={c} className="rounded border px-3 py-1" onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((service) => (
          <Link to={`/services/${service.id}`} key={service.id} className="rounded bg-white p-4 shadow-sm">
            <h3 className="font-semibold">{service.title}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
            <p className="mt-2 font-bold">TND {service.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ServiceDetailPage() {
  const { id = "" } = useParams();
  const [service, setService] = useState<any>(null);
  useEffect(() => {
    void api.get(`/services/${id}`).then((res) => setService(res.data.data));
  }, [id]);
  if (!service) return <p>Loading...</p>;
  return (
    <section className="rounded bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">{service.title}</h2>
      <p className="mt-3 text-gray-600">{service.description}</p>
      <p className="mt-4">Delivery: {service.deliveryDays} days</p>
      <p className="text-xl font-bold">TND {service.price}</p>
      <Link to={`/orders/new?service=${service.id}`} className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-white">
        Order Now
      </Link>
    </section>
  );
}

export function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdmin, loginClient } = useAuth();
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      await loginAdmin(email, password);
      navigate("/admin");
      return;
    }
    await loginClient(email, password);
    navigate("/dashboard");
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Login</h2>
      <label className="mb-2 block text-sm">Email</label>
      <input className="mb-3 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="mb-2 block text-sm">Password</label>
      <input type="password" className="mb-3 w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
        Login as admin
      </label>
      <button className="w-full rounded bg-indigo-600 py-2 text-white">Sign in</button>
    </form>
  );
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/auth/register", { name, email, password });
    navigate("/login");
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Register</h2>
      <input placeholder="Name" className="mb-3 w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" className="mb-3 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="mb-3 w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded bg-indigo-600 py-2 text-white">Create account</button>
    </form>
  );
}

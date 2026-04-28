import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicLayout() {
  const { isAuthenticated, role, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/" className="font-bold text-indigo-600">
            Chebla Digital Services
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/services">Services</Link>
            {!isAuthenticated && <Link to="/login">Login</Link>}
            {!isAuthenticated && <Link to="/register">Register</Link>}
            {isAuthenticated && role === "client" && <Link to="/dashboard">Dashboard</Link>}
            {isAuthenticated && role === "admin" && <Link to="/admin">Admin</Link>}
            {isAuthenticated && (
              <button onClick={() => void logout()} className="text-red-600">
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr] bg-gray-50">
      <aside className="border-r bg-white p-4">
        <p className="mb-4 font-bold">Admin Panel</p>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/clients">Clients</Link>
          <Link to="/admin/services">Services</Link>
        </div>
      </aside>
      <main className="p-5">
        <Outlet />
      </main>
    </div>
  );
}

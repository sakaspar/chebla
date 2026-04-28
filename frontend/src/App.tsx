import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminLayout, PublicLayout } from "./components/Layout";
import { AdminGuard, ClientGuard } from "./components/RouteGuards";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthContext";
import { AdminClientDetailPage, AdminClientsPage, AdminDashboardPage, AdminOrderDetailPage, AdminOrdersPage, AdminServicesPage } from "./pages/AdminPages";
import { ClientDashboardPage, NewOrderPage, OrderDetailPage, OrdersPage, ProfilePage } from "./pages/ClientPages";
import { LandingPage, LoginPage, RegisterPage, ServiceDetailPage, ServicesPage } from "./pages/PublicPages";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ClientGuard />}>
              <Route path="/dashboard" element={<ClientDashboardPage />} />
              <Route path="/orders/new" element={<NewOrderPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="/admin/clients" element={<AdminClientsPage />} />
              <Route path="/admin/clients/:id" element={<AdminClientDetailPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
            </Route>
          </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

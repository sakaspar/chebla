import { OrderStatus } from "../types/models";

const colors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${colors[status]}`}>{status}</span>;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "CANCELED";

export const canTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PAID", "CANCELED"],
    PAID: ["SHIPPED", "PARTIALLY_REFUNDED", "REFUNDED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: ["DELIVERED"],
    PARTIALLY_REFUNDED: ["REFUNDED"],
    REFUNDED: [],
    CANCELED: [],
  };

  return transitions[currentStatus]?.includes(newStatus) ?? false;
};

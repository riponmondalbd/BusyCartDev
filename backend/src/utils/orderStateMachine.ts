import { OrderStatus } from "../generated/prisma/enums";

export const canTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    CREATED: ["PAID", "CANCELED"],
    PAID: ["SHIPPED", "PARTIALLY_REFUNDED", "REFUNDED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    PARTIALLY_REFUNDED: ["REFUNDED"],
    REFUNDED: [],
    CANCELED: [],
  };

  return transitions[currentStatus]?.includes(newStatus) ?? false;
};

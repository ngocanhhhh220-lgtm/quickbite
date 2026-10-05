export const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export const calculateDeliveryFee = (subtotal: number) => (subtotal > 180000 || subtotal === 0 ? 0 : 18000);

export const calculateOrderTotal = (subtotal: number) => subtotal + calculateDeliveryFee(subtotal);

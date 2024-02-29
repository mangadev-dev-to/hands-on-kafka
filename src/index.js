import "./services/inventory-service.js";
import "./services/logging-service.js";
import "./services/notification-service.js";
import createNewOrder from "./services/order-service.js";

const orderOne = {
  orderId: "ORDER-123",
  customerId: "CUSTOMER-123",
  products: [
    {
      productId: "PRODUCT-123",
      quantity: 3,
      totalPrice: 80,
    },
    {
      productId: "PRODUCT-321",
      quantity: 1,
      totalPrice: 233,
    },
  ],
};

(async () => {
  await createNewOrder(orderOne);

  // call createNewOrder recursively every 5 seconds
  setInterval(() => createNewOrder(orderOne), 5000);
})();

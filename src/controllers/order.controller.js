import * as orderService from '../services/order.service.js';
import * as paymentService from '../services/payment.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const createOrder = catchAsync(async (req, res) => {
  const {
    items,
    shippingAddress,
    addressId,
    paymentMethod,
    discountAmount,
    contactName,
    contactEmail,
    contactPhone
  } = req.body;

  const order = await orderService.createOrder(req.user.id, items, shippingAddress, {
    paymentMethod,
    discountAmount,
    contactName,
    contactEmail,
    contactPhone,
    addressId
  });
  const payment = await paymentService.initializePayment(order.id, req.user);
  apiResponse(res, 201, 'Order created successfully', { order, payment });
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  if (req.user?.role !== 'ADMIN') {
    orders.forEach((order) => {
      delete order.profitAmount;
    });
  }
  apiResponse(res, 200, 'User orders retrieved', { orders });
});

export const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  if (req.user?.role !== 'ADMIN') {
    delete order.profitAmount;
  }
  apiResponse(res, 200, 'Order retrieved successfully', { order });
});

export const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  if (req.user?.role !== 'ADMIN') {
    result.orders.forEach((order) => {
      delete order.profitAmount;
    });
  }
  apiResponse(res, 200, 'All orders retrieved', result);
});

export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, {
    status,
    paymentStatus
  });
  apiResponse(res, 200, 'Order updated', { order });
});

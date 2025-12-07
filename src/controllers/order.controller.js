import * as orderService from '../services/order.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const createOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.createOrder(req.user.id);
  apiResponse(res, 201, 'Order created successfully', { order });
});

export const getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getUserOrders(req.user.id);
  apiResponse(res, 200, 'User orders retrieved', { orders });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);
  apiResponse(res, 200, 'Order retrieved successfully', { order });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getAllOrders();
  apiResponse(res, 200, 'All orders retrieved', { orders });
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  apiResponse(res, 200, 'Order status updated', { order });
});

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Order from "../models/Order.js";
import { assignNextAvailablePartner } from "../utils/assignPartner.js";

const MONGO_URI = process.env.MONGO_URI;

const expireStaleOrders = async () => {
  await mongoose.connect(MONGO_URI);

  const now = new Date();
  const expiredOrders = await Order.find({
    requestStatus: "Pending",
    assignedPartner: { $ne: null },
    requestExpiresAt: { $lt: now }
  });

  for (const order of expiredOrders) {
    console.log(`[ExpireOrders] Expiring order: ${order._id}, Partner: ${order.assignedPartner}`);
    order.rejectedPartners = order.rejectedPartners || [];
    order.rejectedPartners.push(order.assignedPartner.toString());
    order.assignedPartner = null;
    order.requestStatus = "Pending";
    order.requestExpiresAt = null;
    await assignNextAvailablePartner(order);
    await order.save();
  }

  mongoose.disconnect();
};

expireStaleOrders().then(() => {
  console.log("[ExpireOrders] Done!");
  process.exit(0);
});
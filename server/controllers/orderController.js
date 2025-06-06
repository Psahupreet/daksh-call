import Order from "../models/Order.js";
import User from "../models/User.js";
import { log } from 'console';
import Partner from "../models/Partner.js";
import { assignNextAvailablePartner } from "../utils/assignPartner.js";
import { assignPartnerAutomatically } from "../controllers/partnerAssignmentController.js";

//create order
export const createOrder = async (req, res) => {
  try {
    const { services, totalPrice } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      services,
      totalPrice,
      status: "Confirmed",
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};


//get order
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from token by authMiddleware

    const orders = await Order.find({ user: userId }).populate("user", "name email");

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

//cancle order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    order.status = "Cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled" });
  } catch (err) {
    console.error("❌ Cancel Order Error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

//placed order
export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;
    const userId = req.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items to place order" });
    }

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      address: {
        houseNumber: address.houseNumber,
        street: address.street,
        landmark: address.landmark,
        addressType: address.addressType,
        fullAddress: address.fullAddress,
        timeSlot: address.timeSlot
      },
      status: "Confirmed",
      createdAt: new Date(),
    });

    const savedOrder = await newOrder.save();
    // console.log("✅ Order placed with ID:", savedOrder._id);

    // Call assignment function manually
    req.params.orderId = savedOrder._id;
    await assignPartnerAutomatically(req, {
      status: () => ({ json: () => {} }), // prevent double res.send
    });

    res.status(201).json({
      message: "Order placed and partner assignment triggered",
      order: savedOrder
    });
  } catch (error) {
    console.error("❌ Order Placement Error:", error);
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};


//getAllOrders admin 
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export const getPartnerOrders = async (req, res) => {
  try {
    const partnerId = req.partnerId;

    const orders = await Order.find({ assignedPartner: partnerId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch partner orders:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

export const changeOrderTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSlot } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.address) {
      return res.status(400).json({ message: "Order address missing" });
    }

    // Update time slot and reset assignment
    order.address.timeSlot = timeSlot;
    order.status = "Confirmed";
    order.requestStatus = "Pending";
    order.assignedPartner = null;
    order.requestExpiresAt = null;
    order.rejectedPartners = [];

    await order.save();

    // Call this function to re-assign a partner and send new request/notification
    await assignNextAvailablePartner(order);

    res.status(200).json({ message: "Time slot updated and reassignment started." });
  } catch (err) {
    console.error("Error in changeOrderTimeSlot:", err);
    res.status(500).json({ message: "Failed to update time slot" });
  }
};
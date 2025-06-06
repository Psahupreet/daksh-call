// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getUserOrders,
  placeOrder,
  getAllOrders,
  cancelOrder,
 changeOrderTimeSlot
} from "../controllers/orderController.js";

import {
  assignPartnerAutomatically,
  assignPartnerToOrder,
  partnerRespondToRequest,
  getPartnerOrders,
  startOrder,
  completeOrder,
  submitFeedback,
  getPendingRequests

} from "../controllers/partnerAssignmentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { protectPartner } from "../middleware/authPartner.js";

const router = express.Router();

// ========== USER ROUTES ==========
router.post("/", protect, createOrder);
router.post("/place", protect, placeOrder);
router.get("/my-orders", protect, getUserOrders);
router.delete("/:id", protect, cancelOrder);
router.put('/:id/change-timeslot', protect, changeOrderTimeSlot)

// ========== ADMIN ROUTES ==========
router.get("/AllOrders", adminProtect, getAllOrders);
router.post("/assign-partner/:orderId", adminProtect, assignPartnerAutomatically);
router.post("/assign-partner-manual/:orderId", adminProtect, assignPartnerToOrder); // optional manual route
router.get("/partner-pending-requests", protectPartner, getPendingRequests);

// ========== PARTNER ROUTES ==========
router.post("/respond/:orderId", protectPartner, partnerRespondToRequest);
router.get("/partner-orders", protectPartner, getPartnerOrders);


router.post("/start/:orderId", protectPartner, startOrder);
router.post("/complete/:orderId", protectPartner, completeOrder);
router.post("/feedback/:orderId", protectPartner, submitFeedback);
export default router;

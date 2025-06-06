import mongoose from "mongoose";

// Sub-service schema for additional services under each item
const subServiceSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      title: String,
      price: Number,
      imageUrl: String,
      quantity: {
        type: Number,
        default: 1,
      },
      subServices: [subServiceSchema], // <-- Step 1 added here!
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  address: {
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String },
    addressType: { type: String, enum: ["Home", "Office", "Other"], required: true },
    fullAddress: { type: String, required: true },
    timeSlot: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ["Confirmed", "Completed", "Cancelled", "Declined"],
    default: "Pending",
  },
  assignedPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
  },
  requestStatus: {
    type: String,
    enum: ["Pending", "Accepted", "Declined", "NoPartner"],
    default: "Pending",
  },
  requestExpiresAt: { type: Date },
  rejectedPartners: {
    type: [String], // or [mongoose.Schema.Types.ObjectId] if preferred
    default: []
  },
  startedAt: { type: Date, default: null }, // when partner starts the job
  completedAt: { type: Date, default: null }, // when job is marked complete
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
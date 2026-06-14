import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  quantity: Number,
  avgPrice: Number,
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Portfolio ||
  mongoose.model("Portfolio", PortfolioSchema);

import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  exchange: String,
  addedAt: { type: Date, default: Date.now },
  memory: {
    character: String,
    keyLevels: {
      support: Number,
      resistance: Number,
    },
    behavior: String,
    lastAnalysis: {
      signal: String,
      confidence: Number,
      rsi: Number,
      trend: String,
      reason: String,
      stopLoss: Number,
      target: Number,
      riskLevel: String,
      date: Date,
    },
    signalHistory: [
      {
        signal: String,
        confidence: Number,
        price: Number,
        date: Date,
        outcome: String, // WIN/LOSS/PENDING - track later
      },
    ],
  },
});

export default mongoose.models.Stock || mongoose.model("Stock", StockSchema);

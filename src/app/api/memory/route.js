import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Stock from "@/models/Stock";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const stock = await Stock.findOne({ symbol });
  return NextResponse.json(stock?.memory || null);
}

export async function POST(request) {
  await connectDB();
  const { symbol, memory } = await request.json();
  await Stock.findOneAndUpdate({ symbol }, { $set: { memory } }, { new: true });
  return NextResponse.json({ success: true });
}

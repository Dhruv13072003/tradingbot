import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

export async function GET() {
  await connectDB();
  const portfolio = await Portfolio.find();
  return NextResponse.json(portfolio);
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const { symbol, name, quantity, price } = body;

  const existing = await Portfolio.findOne({ symbol });

  if (existing) {
    const newQty = existing.quantity + quantity;
    const newAvg =
      (existing.avgPrice * existing.quantity + price * quantity) / newQty;
    const updated = await Portfolio.findOneAndUpdate(
      { symbol },
      { quantity: newQty, avgPrice: newAvg, updatedAt: new Date() },
      { new: true },
    );
    return NextResponse.json(updated);
  }

  const holding = await Portfolio.create({
    symbol,
    name,
    quantity,
    avgPrice: price,
  });
  return NextResponse.json(holding);
}

export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const quantity = parseInt(searchParams.get("quantity"));

  const existing = await Portfolio.findOne({ symbol });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.quantity <= quantity) {
    await Portfolio.deleteOne({ symbol });
  } else {
    await Portfolio.findOneAndUpdate(
      { symbol },
      { quantity: existing.quantity - quantity, updatedAt: new Date() },
    );
  }
  return NextResponse.json({ success: true });
}

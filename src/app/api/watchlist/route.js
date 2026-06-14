import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Stock from "@/models/Stock";

export async function GET() {
  await connectDB();
  const stocks = await Stock.find({}, { symbol: 1, name: 1, exchange: 1 });
  return NextResponse.json(stocks);
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();
  try {
    const stock = await Stock.findOneAndUpdate(
      { symbol: body.symbol },
      {
        $setOnInsert: {
          symbol: body.symbol,
          name: body.name,
          exchange: body.exchange,
        },
      },
      { upsert: true, new: true },
    );
    return NextResponse.json(stock);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  await Stock.deleteOne({ symbol });
  return NextResponse.json({ success: true });
}

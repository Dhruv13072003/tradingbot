import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get("symbol").toUpperCase().trim();

  // Auto append .NS for Indian stocks if no exchange suffix
  if (!symbol.includes(".")) {
    symbol = `${symbol}.NS`;
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
    );

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || symbol,
      price: meta.regularMarketPrice,
      change:
        ((meta.regularMarketPrice - meta.chartPreviousClose) /
          meta.chartPreviousClose) *
        100,
      changeAmount: meta.regularMarketPrice - meta.chartPreviousClose,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      open: meta.regularMarketOpen || meta.chartPreviousClose,
      prevClose: meta.chartPreviousClose,
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap || null,
      exchange: meta.fullExchangeName,
      currency: meta.currency,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    });
  } catch (err) {
    console.error("Yahoo Finance error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

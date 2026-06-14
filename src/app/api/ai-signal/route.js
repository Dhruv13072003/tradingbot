import { NextResponse } from "next/server";

export async function POST(request) {
  const { stockData, news, chartData } = await request.json();

  const newsText =
    news.length > 0
      ? news.map((n) => `- ${n.title} (${n.source})`).join("\n")
      : "No news available";

  const indicators = chartData?.indicators;
  const technicalText = indicators
    ? `
TECHNICAL ANALYSIS:
Trend: ${indicators.trend} (${indicators.trendStrength} over 20 days)
RSI (14): ${indicators.rsi} ${indicators.rsi > 70 ? "⚠️ Overbought" : indicators.rsi < 30 ? "⚠️ Oversold" : "✅ Neutral"}
MACD: ${indicators.macd.value} | Signal: ${indicators.macd.signal} | Histogram: ${indicators.macd.histogram}
MACD Crossover: ${indicators.macd.crossover}
Support: ₹${indicators.support}
Resistance: ₹${indicators.resistance}
`
    : "No technical data available";

  const prompt = `
You are an expert Indian stock market trading assistant. Analyze this stock using both technical indicators and news.

STOCK INFO:
Symbol: ${stockData.symbol} (${stockData.name})
Exchange: ${stockData.exchange}
Current Price: ₹${stockData.price}
Change Today: ${stockData.change?.toFixed(2)}% (₹${stockData.changeAmount?.toFixed(2)})
Open: ₹${stockData.open} | Prev Close: ₹${stockData.prevClose}
High: ₹${stockData.high} | Low: ₹${stockData.low}
52W High: ₹${stockData.fiftyTwoWeekHigh} | 52W Low: ₹${stockData.fiftyTwoWeekLow}
Volume: ${stockData.volume?.toLocaleString()}

${technicalText}

RECENT NEWS:
${newsText}

Based on ALL the above data give a trading signal.
RSI > 70 = overbought (avoid buying), RSI < 30 = oversold (good to buy).
MACD bullish crossover = buy signal, bearish = sell signal.
Price near support = good buy, near resistance = risky buy.

Respond in this exact JSON format only, no extra text, no markdown:
{
  "signal": "BUY" or "SELL" or "HOLD",
  "confidence": a number from 1 to 10,
  "reason": "3-4 line explanation mentioning RSI, MACD, trend and news",
  "stopLoss": suggested stop loss price as number,
  "target": suggested target price as number,
  "riskLevel": "LOW" or "MEDIUM" or "HIGH"
}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  if (!data.content || !data.content[0]) {
    return NextResponse.json(
      { error: data.error?.message || "AI analysis failed" },
      { status: 500 },
    );
  }

  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();

  return NextResponse.json(JSON.parse(clean));
}

const { telegramAlert } = require("./telegram/telegram-alert");
const Binance = require("binance-api-node").default;

// Replace these with your API key and secret
const apiKey = "YOUR_API_KEY";
const apiSecret = "YOUR_API_SECRET";

const client = Binance({
  apiKey: apiKey,
  apiSecret: apiSecret,
});

// Define an array of symbols to analyze
const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "XRPUSDT",
  "SOLUSDT",
  "ADAUSDT",
  "MEMEUSDT",
  "MATICUSDT",
]; // Add more symbols as needed
const interval = "4h";

// Object to store buy and sell information for each symbol
const symbolData = {};

symbols.forEach((symbol) => {
  symbolData[symbol] = {
    buy: 0,
    sell: 0,
    sell_check: true,
  };
});

const analyzeMarket = async () => {
  try {
    console.log("Analysis Start");
    for (const symbol of symbols) {
      const candles = await client.candles({
        symbol: symbol,
        interval: interval,
      });

      const closePrices = candles.map((candle) => parseFloat(candle.close));
      const sma50 = calculateSMA(closePrices, closePrices.length);
      const signals = identifySignals(closePrices, sma50, symbol);

      signals.forEach(async (signal) => {
        if (signal === "BUY") {
          const currentDate = new Date();

          // Format the date to "YYYY-MM-DD HH:mm:ss" format
          const formattedDate = currentDate.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Use 24-hour format
          });

          await telegramAlert({
            signal: "BUY",
            symbol: symbol,
            price: closePrices[closePrices.length - 1],
            time: formattedDate,
          });
          console.log(
            `Buy Signal for ${symbol} at ${closePrices[closePrices.length - 1]}`
          );
        } else if (signal === "SELL") {
          const currentDate = new Date();

          // Format the date to "YYYY-MM-DD HH:mm:ss" format
          const formattedDate = currentDate.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Use 24-hour format
          });

          await telegramAlert({
            signal: "SELL",
            symbol: symbol,
            price: closePrices[closePrices.length - 1],
            time: formattedDate,
          });
          console.log(
            `Sell Signal for ${symbol} at ${
              closePrices[closePrices.length - 1]
            }`
          );
        }
      });
    }
  } catch (error) {
    console.error("Error analyzing market:", error);
  }
};

const calculateSMA = (prices, period) => {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
};

const identifySignals = (closePrices, sma, symbol) => {
  const signals = [];
  const lastClose = closePrices[closePrices.length - 1];
  const lastSMA = sma[sma.length - 1];

  // console.log(
  //   `--------------- Symbol: ${symbol} --- sell_check: ${symbolData[symbol].sell_check} ---- lastClose: ${lastClose} --- lastSMA: ${lastSMA} ---buy: ${symbolData[symbol].buy} --- sell: ${symbolData[symbol].sell} ------- `
  // );

  if (lastClose > lastSMA && symbolData[symbol].sell_check) {
    if (symbolData[symbol].buy == 0 || lastSMA > symbolData[symbol].buy) {
      signals.push("BUY");
      symbolData[symbol].buy = lastSMA;
      symbolData[symbol].sell = 0;
      symbolData[symbol].sell_check = false;
    }
  } else if (lastClose < lastSMA) {
    const duration = symbolData[symbol].sell - lastSMA;
    if (
      symbolData[symbol].sell == 0 ||
      (lastSMA < symbolData[symbol].sell && duration > 100)
    ) {
      signals.push("SELL");
      symbolData[symbol].sell = lastSMA;
      symbolData[symbol].buy = 0;
      symbolData[symbol].sell_check = true;
    }
  }

  return signals;
};

// Interval for running the analysis (adjust as needed)
const analysisInterval = 60000; // 60 seconds

// Run the analysis initially
analyzeMarket();

// Set interval to run the analysis periodically
setInterval(analyzeMarket, analysisInterval);

const Binance = require("node-binance-api");
const { Stochastic } = require("technicalindicators");

const binance = new Binance().options({
  APIKEY: "iANW73R4NINFaUHxQLQadLDaPKEGLPYBuW6my2h87uPd6maZWZ1TRyWNYJCzsE5s",
  APISECRET: "5tRxF5BQYaqiLCPTy6AMoSirFm5fwirz3urrHfZazPzqc4cmh8VCDOAXwGAEUMwS",
  useServerTime: true, // If you get timestamp errors, synchronize with Binance server time
  recvWindow: 1000, // Increase if timestamp errors persist
  verbose: true,
});

const symbol = "btcusdt"; // Change this to the trading pair you are interested in

// Function to analyze candlestick data
const analyzeCandlestickData = (candles) => {
  // Extract high, low, and closing prices from candlestick data
  const high = candles.h;
  const low = candles.l;
  const close = candles.c;

  // Set the period and signalPeriod
  const period = 10; // Adjust the period as needed
  const signalPeriod = 3; // Adjust the signal period as needed

  // Create input object
  const input = {
    high: [high],
    low: [low],
    close: [close],
    period: period,
    signalPeriod: signalPeriod,
  };

  // Calculate STC indicator
  const stcResult = Stochastic.calculate(input);

  // Fetch longer-term moving average (50-period SMA)
  const ma50 = input.close.map((price, index) => {
    if (index >= 50) {
      return (
        close.slice(index - 49, index + 1).reduce((sum, p) => sum + p, 0) / 50
      );
    } else {
      return null;
    }
  });

  // Identify buying and selling points based on STC crossovers and trend confirmation
  for (let i = 1; i < stcResult.length; i++) {
    const stochSignal =
      stcResult[i].k > stcResult[i].d &&
      stcResult[i - 1].k <= stcResult[i - 1].d;
    const trendConfirmation = close[i] > ma50[i];

    if (stochSignal && trendConfirmation) {
      console.log(`Buy Signal at ${close[i]}`);
      // Implement your buy logic here
    } else if (!stochSignal && trendConfirmation) {
      console.log(`Sell Signal at ${close[i]}`);
      // Implement your sell logic here
    } else {
      console.log("------");
    }
  }
};

// Subscribe to the Kline (candlestick) WebSocket stream
binance.websockets.candlesticks(symbol, "1m", (candlesticks) => {
  const { e: eventType, k: candles } = candlesticks; // Extract relevant data

  if (eventType === "kline") {
    analyzeCandlestickData(candles);
  }
});

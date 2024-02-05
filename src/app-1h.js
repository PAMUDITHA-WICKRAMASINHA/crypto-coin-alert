const Binance = require("binance-api-node").default;
const { Stochastic } = require("technicalindicators");

const client = Binance();

const symbol = "BTCUSDT"; // Change this to the trading pair you are interested in

// Fetch historical candlestick data
client
  .candles({
    symbol: symbol,
    interval: "1h",
  })
  .then((candles) => {
    // Extract high, low, and closing prices from candlestick data
    const high = candles.map((candle) => parseFloat(candle.high));
    const low = candles.map((candle) => parseFloat(candle.low));
    const close = candles.map((candle) => parseFloat(candle.close));

    // Set the period and signalPeriod
    const period = 10; // Adjust the period as needed
    const signalPeriod = 3; // Adjust the signal period as needed

    // Create input object
    const input = {
      high: high,
      low: low,
      close: close,
      period: period,
      signalPeriod: signalPeriod,
    };

    // Calculate STC indicator
    const stcResult = Stochastic.calculate(input);

    // Fetch longer-term moving average (50-period SMA)
    const ma50 = close.map((price, index) => {
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
        console.log(`Buy Signal at ${candles[i].close}`);
        // Implement your buy logic here
      } else if (!stochSignal && trendConfirmation) {
        console.log(`Sell Signal at ${candles[i].close}`);
        // Implement your sell logic here
      }
    }
  })
  .catch((error) => {
    console.error(error);
  });

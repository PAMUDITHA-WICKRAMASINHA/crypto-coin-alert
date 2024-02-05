const Binance = require("binance-api-node").default;
const { Stochastic, RSI, MACD } = require("technicalindicators");

const client = Binance();
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]; // Add more symbols as needed

const interval = "4h"; // Set the interval for analysis

const analyzeSymbol = async (symbol) => {
  try {
    const candles = await client.candles({
      symbol: symbol,
      interval: interval,
    });

    // Extract high, low, and closing prices from candlestick data
    const high = candles.map((candle) => parseFloat(candle.high));
    const low = candles.map((candle) => parseFloat(candle.low));
    const close = candles.map((candle) => parseFloat(candle.close));

    // Set the periods for Stochastic, RSI, and MACD
    const stochPeriod = 10;
    const stochSignalPeriod = 3;
    const rsiPeriod = 14;
    const macdShortPeriod = 12;
    const macdLongPeriod = 26;
    const macdSignalPeriod = 9;

    // Calculate Stochastic indicator
    const stcInput = {
      high: high,
      low: low,
      close: close,
      period: stochPeriod,
      signalPeriod: stochSignalPeriod,
    };
    const stcResult = Stochastic.calculate(stcInput);

    // Calculate RSI indicator
    const rsiInput = {
      values: close,
      period: rsiPeriod,
    };
    const rsiResult = RSI.calculate(rsiInput);

    // Calculate MACD indicator
    const macdInput = {
      values: close,
      fastPeriod: macdShortPeriod,
      slowPeriod: macdLongPeriod,
      signalPeriod: macdSignalPeriod,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };
    const macdResult = MACD.calculate(macdInput);

    // Fetch longer-term moving average (50-period SMA)
    const ma50 = close.map((price, index) => {
      if (index >= 500) {
        return (
          close.slice(index - 499, index + 1).reduce((sum, p) => sum + p, 0) /
          500
        );
      } else {
        return null;
      }
    });

    // Identify buying and selling points based on Stochastic, RSI, MACD, and trend confirmation
    const stcResult_i = stcResult.length - 1;
    const rsiResult_i = rsiResult.length - 1;
    const macdResult_i = macdResult.length - 1;

    const minIndex = Math.min(stcResult_i, rsiResult_i, macdResult_i);

    const stochSignal =
      stcResult[minIndex].k > stcResult[minIndex].d &&
      stcResult[minIndex - 1].k <= stcResult[minIndex - 1].d;
    const rsiSignal = rsiResult[minIndex] < 30;
    const macdSignal = macdResult[minIndex].hist > 0;
    const trendConfirmation = close[minIndex] > ma50[minIndex];

    console.log(`Symbol: ${symbol}`);
    console.log(
      `Buy Signal: ${
        stochSignal && rsiSignal && macdSignal && trendConfirmation
      }`
    );
    console.log(
      `Sell Signal: ${
        !stochSignal && rsiSignal && !macdSignal && trendConfirmation
      }`
    );
    console.log("------");
  } catch (error) {
    console.error(`Error analyzing symbol ${symbol}:`, error);
  }
};

// Interval for fetching and analyzing data in milliseconds (adjust as needed)
const analysisInterval = 10000; // 10 seconds

// Execute the analyzeSymbol function for each symbol at regular intervals
setInterval(() => {
  symbols.forEach((symbol) => analyzeSymbol(symbol));
}, analysisInterval);

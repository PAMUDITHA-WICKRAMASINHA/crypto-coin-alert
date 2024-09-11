export function calculateEMA(prices: number[], period: number): number[] {
    const smoothing: number = 2 / (period + 1);
    const ema: number[] = [];

    ema.push(prices[0]);

    for (let i = 1; i < prices.length; i++) {
        const previousEma: number = ema[ema.length - 1];
        const currentPrice: number = prices[i];
        const currentEma: number = (currentPrice * smoothing) + (previousEma * (1 - smoothing));
        ema.push(currentEma);
    }

    return ema;
}

export function calculateSMA(closingPrices: number[], period: number): number[] {
    if (closingPrices.length < period) {
        throw new Error('Not enough data to calculate SMA');
    }

    let smaArray: number[] = [];
    for (let i = period - 1; i < closingPrices.length; i++) {
        const slice: number[] = closingPrices.slice(i - period + 1, i + 1);
        const sum: number = slice.reduce((acc, price) => acc + price, 0);
        const sma: number = sum / period;
        smaArray.push(sma);
    }
    return smaArray;
}

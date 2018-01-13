const { delay } = require('./utils');

class Coin {
  constructor(name) {
    this.name = name;
    this.pair = name + 'BTC';
    this.createObjects();
  }

  createObjects() {
    this.properties = {
      fibonacci: {
        1: { fibo: 1, executed: false },
        2: { fibo: 2, executed: false },
        3: { fibo: 3, executed: false },
        4: { fibo: 5, executed: false },
        5: { fibo: 8, executed: false },
        5: { fibo: 13, executed: false },
        7: { fibo: 21, executed: false },
        8: { fibo: 34, executed: false },
        9: { fibo: 55, executed: false },
      },
      awaitedState: {
        state: 0, //-1: Sell, 1: Buy, 0: Awaiting
        buy: 10,
        sell: -5
      }
    }

    this.inProcess = false;
    this.initialFibonacci = Object.assign({}, this.properties.fibonacci);
    this.reference = 0;
  }

  receiveBinance(binance) {
    this.binance = binance;
  }

  updateQuantity(quantity){
    this.quantity = parseFloat(quantity);
    console.log(this.name + ": Quantity: " + this.quantity);
  }

  trade(price) {
    if (!this.inProcess) {
      const valuation = ((price * 100) / this.average) - 100;
      if (valuation > this.properties.awaitedState.sell) { //SELL
        this.inProcess = true;
        console.log("Sell: " + this.name + " -> " + valuation);
      }
      else if (valuation < this.properties.awaitedState.buy) { //BUY
        this.inProcess = true;
        console.log("Buy: " + this.name + " -> " + valuation);
      }
    }
  }

  analyze(price, valuation){
    
  }

  async updateAverage() {
    await this.sma('4h', 50);
    await delay(120000);
    this.updateAverage();
  }

  async sma(interval, periods) {
    try {
      let data = await this.binance.candles(this.pair, interval, { limit: periods });

      let sum = 0;

      data.forEach(period => {
        sum += parseFloat(period[4]);
      });

      const average = sum / periods;

      console.log(this.name + " -> average: " + average);
      this.average = average;
      return average;
    }
    catch (error) {
      console.error(`Error in sma: ${this.name}`, error)
      await delay(60000);
      return this.sma(interval, periods)
    }
  }
}

module.exports = Coin;
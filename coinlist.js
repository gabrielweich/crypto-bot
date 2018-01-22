const Coin = require('./coin');
const Binance = require('./binance');
const { delay, errorMessage } = require('./utils');

class CoinList {
  constructor() {
    this.coins = [];
    this.binance = new Binance(process.env.KEY, process.env.SECRET);
  }

  add(coin) {
    coin.receiveBinance(this.binance);
    this.coins.push(coin);
  }

  async startCoins() {

    await Promise.all([this.updateQuantities(), this.firstPrices()])
    console.log('All started');
    this.monitors();
    await delay(120000);
    for (let coin of this.coins) {
      coin.updateAverage();
    }
  }


  async monitors() {
    try {
      let data = await this.binance.prices();

      let prices = [];
      data.map(obj => {
        let symbol = obj.symbol;
        prices[obj.symbol] = parseFloat(obj.price);
      });

      for (let coin of this.coins) {
        coin.trade(prices[coin.pair])
      }

      await delay(55000);
    }
    catch (error) {
      console.error("Error in _getPrices()", errorMessage(error));
    }
    finally {
      await delay(5000)
      this.monitors();
    }
  }

  async updateQuantities() {
    try {
      const data = await this.binance.accountInfo();
      const balances = data.balances;
      const quantities = [];
      balances.map(obj => {
        quantities[obj.asset] = obj.free;
      });

      for (const coin of this.coins) {
        coin.updateQuantity(quantities[coin.name]);
      }
    }
    catch (error) {
      console.error("Error in updateQuantities()", errorMessage(error));
      await delay(2000);
      return this.updateQuantities();
    }
  }

  async firstPrices() {
    let promises = [];

    this.coins.forEach(coin => {
      promises.push(coin.sma('4h', 50));
    });

    return Promise.all(promises);
  }
}

module.exports = CoinList;
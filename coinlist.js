const Coin = require('./coin');
const Binance = require('./binance');
const Funds = require('./funds');
const { delay, errorMessage, alma } = require('./utils');

class CoinList {
  constructor(config) {
    this.config = config;
    this.coinsObj = {};
    this.binance = new Binance(process.env.KEY, process.env.SECRET);
    this.funds = new Funds(this.binance);
  }

  add(coin) {
    coin.receiveProps(this.binance, this.config, this.funds);
    this.coinsObj[coin.pair] = {};
    this.coinsObj[coin.pair].coin = coin;

  }

  async startCoins() {
    await Promise.all([this.updateQuantities(), this.firstPrices()])
    console.log('All started');
    this.monitors();
  }

  async monitors() {
    this.binance.candlesticks(Object.keys(this.coinsObj), this.config.interval, data => {
      const price = data.k.c;
      const coinPair = data.s;
      this.coinsObj[coinPair].coin.trade(price);
      if(data.k.x){
        const closingPrices = [...this.coinsObj[coinPair].prices];
        closingPrices.push(price);
        closingPrices.shift();
        this.coinsObj[coinPair].prices = closingPrices;
        this.updateAverage(coinPair);
      }
    });
  }

  async updateQuantities() {
    try {
      const data = await this.binance.accountInfo();
      const balances = data.balances;
      const quantities = [];
      balances.map(obj => {
        quantities[obj.asset] = obj.free;
      });

      for (const key in this.coinsObj) {
        const coin = this.coinsObj[key].coin;
        coin.updateQuantity(quantities[coin.name]);
      }

      this.funds.setBtc(quantities['BTC']);
    }
    catch (error) {
      console.error("Error in updateQuantities()", errorMessage(error));
      await delay(2000);
      return this.updateQuantities();
    }
  }

  async firstPrices() {
    let promises = [];

    for(const key in this.coinsObj){
      promises.push(this.getPrices(key));
    }

    return Promise.all(promises);
  }

  async getPrices(coinPair) {
    try {
      const data = await this.binance.candles(coinPair, this.config.interval, { limit: this.config.window });

      let closingPrices = [];

      data.forEach(period => {
        closingPrices.push(parseFloat(period[4]));
      });

      this.coinsObj[coinPair].prices = closingPrices;
      this.updateAverage(coinPair);
    }
    catch (error) {
      console.error('Error in getFirstPrices()', errorMessage(error));
      return this.getPrices(coinPair);
    }
  }

  updateAverage(coinPair) {
    const data = [...this.coinsObj[coinPair].prices];
    data.reverse();
    this.coinsObj[coinPair].coin.setAverage(alma(data, this.config.window, this.config.offset, this.config.sigma));
  }
}

module.exports = CoinList;
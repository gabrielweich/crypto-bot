const Coin = require('./coin');
const Binance = require('./binance');
const { delay } = require('./utils');

class CoinList {
  constructor() {
    this.coins = [];
    this.binance = new Binance(process.env.KEY, process.env.SECRET);
  }

  add(coin) {
    coin.receiveBinance(this.binance);
    this.coins.push(coin);
  }

  startCoins() {
    this.updatePrices();
  }

  _updatePrices() {
    this.binance.prices()
      .then(data => {

        const timestamp = Date.now();
        let prices = [];

        data.map(obj => {
          let symbol = obj.symbol;
          prices[obj.symbol] = parseFloat(obj.price);
        });

        this.coins.forEach(coin => {
          coin.updatePrice(prices[coin.pair])
        });
      })
      .catch(error => console.log(error));
  }
}

module.exports = CoinList;
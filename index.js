require('dotenv').config();
const CoinList = require('./coinlist');
const Coin = require('./coin');
const config = {
  interval: process.env.INTERVAL ? process.env.INTERVAL.toString() : '1h',
  window: process.env.WINDOW ? parseInt(process.env.WINDOW) : 10,
  offset: process.env.OFFSET ? parseFloat(process.env.OFFSET) : 0.85,
  sigma: process.env.SIGMA ? parseInt(process.env.SIGMA) : 6
}

const start = () => {
  this.coinList = new CoinList(config);
  addCoins();
  this.coinList.startCoins();
}

const addCoins = () => {
  this.coinList.add(new Coin('ETH', 8, 1));
  this.coinList.add(new Coin('LTC', 7, 4));
  this.coinList.add(new Coin('XLM', 5, 2));
  this.coinList.add(new Coin('IOTA', 5, 4));
  //this.coinList.add(new Coin('DASH', 3));
  this.coinList.add(new Coin('NEO', 6, 4));
  //this.coinList.add(new Coin('QTUM', 3));
  this.coinList.add(new Coin('XVG', 5, 5));
  //this.coinList.add(new Coin('BNB', 3));
  this.coinList.add(new Coin('ZEC', 6, 5));
  this.coinList.add(new Coin('EOS', 5, 3));
  this.coinList.add(new Coin('NANO', 7, 1));
}

start();



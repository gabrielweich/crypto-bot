require('dotenv').config();
const CoinList = require('./coinlist');
const Coin = require('./coin');

const start = () => {
  this.coinList = new CoinList();
  addCoins();
  this.coinList.startCoins();
}

const addCoins = () => {
  this.coinList.add(new Coin('ETH', 1.8));
  this.coinList.add(new Coin('LTC', 1.9));
  this.coinList.add(new Coin('XLM', 1.7));
  this.coinList.add(new Coin('BCC', 1.7));
  this.coinList.add(new Coin('IOTA', 1.6));
  this.coinList.add(new Coin('DASH', 1.4));
  this.coinList.add(new Coin('NEO', 1.4));
  this.coinList.add(new Coin('QTUM', 1.7));
  this.coinList.add(new Coin('XVG', 1.8));
  this.coinList.add(new Coin('BNB', 1.5));
  this.coinList.add(new Coin('ZEC', 1.4));
  this.coinList.add(new Coin('EOS', 1.8));
}




start();



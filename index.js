require('dotenv').config();
const CoinList = require('./coinlist');
const Coin = require('./coin');

const start = () => {
  this.coinList = new CoinList();
  addCoins();
  this.coinList.startCoins();
}

const addCoins = () => {
  this.coinList.add(new Coin('ETH'));
  this.coinList.add(new Coin('LTC'));
  this.coinList.add(new Coin('XLM'));
  this.coinList.add(new Coin('BCC'));
  this.coinList.add(new Coin('IOTA'));
  this.coinList.add(new Coin('DASH'));
  this.coinList.add(new Coin('NEO'));
  this.coinList.add(new Coin('QTUM'));
  this.coinList.add(new Coin('XVG'));
  this.coinList.add(new Coin('BNB'));
  this.coinList.add(new Coin('ZEC'));
}




start();



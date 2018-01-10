require('dotenv').config();
const Binance = require('./binance');

const start = () => {
  const binance = new Binance();
  binance.ping()
  .then(data => console.log(data))
  .catch(error => console.log("Erro: " + error))

  binance.candles('ETHBTC', '4h', {limit: 50})
  .then(data => console.log('data'))
  .catch(error => console.log("Erro: " + error))

  binance.day('ETHBTC')
  .then(data => console.log(data))
  .catch(error => console.log("Erro: " + error))

  binance.prices()
  .then(data => console.log(data))
  .catch(error => console.log("Erro: " + error))

}

start();



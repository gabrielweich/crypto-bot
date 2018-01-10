const axios = require('axios');
const queryString = require('query-string');

const URL = 'https://api.binance.com/';

class Binance {
  constructor(key, secret) {
    this.key = key;
    this.secret = secret;
  }

  ping() {
    return this._public('api/v1/ping');
  }

  candles(symbol, interval, options){
    let params = {
      symbol,
      interval,
      ...options
    }

    return this._public('api/v1/klines', params);
  }

  day(symbol){
    let params = {
      symbol
    }
    return this._public('api/v1/ticker/24hr', params);
  }

  prices(symbol){
    return this._public('api/v1/ticker/allPrices');
  }
  
  

  _public(command, params) {
    let url = `${URL}${command}?${queryString.stringify(params)}`;
    console.log(url);
    return new Promise((resolve, reject) => {
      axios.get(
        url
      )
      .then(data => resolve(data['data']))
      .catch(error => reject(error));
    })


  }

  _signed() {
    
  }
}

module.exports = Binance;
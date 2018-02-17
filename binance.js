const axios = require('axios');
const queryString = require('query-string');
const crypto = require("crypto");
const WebSocket = require('ws');

const stream = 'wss://stream.binance.com:9443/ws/';

const URL = 'https://api.binance.com/';
const contentType = 'application/x-www-form-urlencoded';

class Binance {
  constructor(key, secret) {
    this.key = key;
    this.secret = secret;
  }

  ping() {
    return this._public('api/v1/ping');
  }

  candles(symbol, interval, options) {
    let params = {
      symbol,
      interval,
      ...options
    }

    return this._public('api/v1/klines', params);
  }

  day(symbol) {
    let params = {
      symbol
    }
    return this._public('api/v1/ticker/24hr', params);
  }

  prices(symbol) {
    return this._public('api/v1/ticker/allPrices');
  }

  accountInfo() {
    return this._signed('api/v3/account', 'GET')
  }

  order(side, symbol, quantity, options = {}) {
    let url = 'api/v3/order';
    if(options.test) {
      url += '/test';
      delete options.test;
    }

    if (typeof options.price == 'undefined') {
      options.type = 'MARKET';
    }
    else {
      options.type = 'LIMIT'
      options.timeInForce = typeof options.timeInForce != 'undefined' ? options.timeInForce : 'GTC';
    }

    let params = {
      symbol,
      side,
      quantity,
      ...options
    }

    return this._signed(url, 'POST', params)
  }

  candlesticks(symbols, interval, callback) {
    let endpoint = '';

    if (Array.isArray(symbols)) {
      symbols.map(symbol => {
        endpoint += symbol.toLowerCase() + '@kline_' + interval + '/';
      });
    }
    else {
      endpoint = symbols.toLowerCase() + '@kline_' + interval;
    }

    const ws = new WebSocket(stream + endpoint);
    ws.reconnect = true;
    ws.on('message', data => {
      try {
        callback(JSON.parse(data));
      } catch (error) {
        console.log('Parse error: ' + error.message);
      }
    });
    ws.on('error', error => {
      console.log(error);
    });
    ws.on('close', () => {
      console.log('socket closed');
    })
  }

  _public(command, params) {
    const url = `${URL}${command}?${queryString.stringify(params)}`;

    return new Promise((resolve, reject) => {
      axios.get(
        url
      )
        .then(data => resolve(data['data']))
        .catch(error => reject(error));
    });
  }

  _signed(command, method, params = {}) {
    let data = { ...params };
    data.timestamp = Date.now();
    data.recvWindow = typeof params.recvWindow != 'undefined' ? params.recvWindow : 10000;

    const query = queryString.stringify(data);
    const signature = crypto.createHmac('sha256', this.secret).update(query).digest('hex');
    const url = `${URL}${command}?${query}&signature=${signature}`;

    return new Promise((resolve, reject) => {
      axios(
        {
          method,
          url,
          headers: {
            'X-MBX-APIKEY': this.key,
          }
        }
      )
        .then(data => resolve(data['data']))
        .catch(error => reject(error));
    })
  }
}

module.exports = Binance;
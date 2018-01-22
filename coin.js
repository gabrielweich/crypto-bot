const { delay, toBuyPlace, toSellPlace, errorMessage } = require('./utils');

class Coin {
  constructor(name, sensibility = 1) {
    this.name = name;
    this.pair = name + 'BTC';
    this.sensibility = sensibility >= 0 && sensibility <= 2 ? sensibility : 1;
    this.createObjects();
  }

  createObjects() {
    this.fibonacci = {
      sell: {
        10: { fibo: 1, executed: false },//10 - 20% | >=10 && < 20
        20: { fibo: 2, executed: false },//20 - 30% | >=20 && < 30
        30: { fibo: 3, executed: false },//30 - 40%
        40: { fibo: 5, executed: false },//40 - 50%
        50: { fibo: 8, executed: false },//50 - 60%
        60: { fibo: 13, executed: false },//60 - 70%
        70: { fibo: 21, executed: false },//70 - 80%
        80: { fibo: 34, executed: false },//80 - 90%
        90: { fibo: 55, executed: false },//>= 90
      },
      buy: {
        5: { fibo: 1, executed: false },//5 - 10%
        10: { fibo: 2, executed: false },//10 - 15%
        15: { fibo: 3, executed: false },//15 - 20%
        20: { fibo: 5, executed: false },//20 - 25%
        25: { fibo: 8, executed: false },//25 - 30%
        30: { fibo: 13, executed: false },//30 - 35%
        35: { fibo: 21, executed: false },//35 - 40%
        40: { fibo: 34, executed: false },//40 - 45%
        45: { fibo: 55, executed: false },//>45
      }
    }

    this.awaitedState = {
      sell: 10,
      buy: -5
    }

    this.state = 0; // -1: sell | 1: buy | 0: initial
    this.inProcess = false;
    this.initialFibonacci = Object.assign({}, this.fibonacci);
    this.reference = 0;
  }

  receiveBinance(binance) {
    this.binance = binance;
  }

  updateQuantity(quantity) {
    this.quantity = parseFloat(quantity);
  }

  async trade(price) {
    if (!this.inProcess) {
      const valuation = (((price * 100) / this.average) - 100) * this.sensibility;

      if (valuation > this.awaitedState.sell) { //SELL
        this.inProcess = true;
        this.reference = this.state !== -1 ? this.quantity : this.reference; //First Sell
        const place = toSellPlace(valuation);
        this.analyze(price, place, 'sell');
      }
      else if (valuation < this.awaitedState.buy) { //BUY
        const devaluation = Math.abs(valuation);
        this.inProcess = true;
        this.reference = this.state !== 1 ? await this.getBtc() : this.reference;
        const place = toBuyPlace(devaluation);
        this.analyze(price, place, 'buy');
      }
    }
  }

  async analyze(price, place, operation) {
    operation = operation.toLowerCase();
    let quantity = 0;
    let value = 0;
    let fiboSum = 0;
    let jump = 0;

    if (operation === 'sell') {
      jump = 10;
      fiboSum = this._getFiboSum(jump, operation, place);
      quantity = (fiboSum * this.reference) / 142;
      value = quantity * price;
    }

    else if (operation === 'buy') {
      jump = 5;
      fiboSum = this._getFiboSum(jump, operation, place);
      value = (fiboSum * this.reference) / 142;
      quantity = value / price;
    }

    console.log(`${this.name} -> Prc: ${price} | Plc: ${place} | Op: ${operation} | FibSum: ${fiboSum} | Qtt: ${quantity} | Val: ${value} | Ref: ${this.reference}`)
    if (value > 0.002) {
      const data = await this.placeOrder(operation, this.pair, quantity, price);
      console.log(data);
      this.finishOrder(place, operation, jump);
    }

    this.inProcess = false;
  }

  finishOrder(place, operation, jump) {
    let i = place;
    while (i >= jump && !this.fibonacci[operation][i]['executed']) {
      this.fibonacci[operation][i]['executed'] = true;
      i = i - jump;
    }

    this.fibonacci[operation] = this.initialFibonacci[operation];

    if (operation === 'sell') {
      this.state = -1;
      this.awaitedState.sell += jump;
    }
    else if (operation === 'buy') {
      this.state = 1;
      this.awaitedState.sell -= jump;
    }
  }

  async placeOrder(operation, pair, quantity, price) {
    try {
      const data = await this.binance.order(operation, pair, quantity, price);
      return data;
    }
    catch (error) {
      console.error('Error in placeOrder()', errorMessage(error));
      await delay(2000);
      return this.placeOrder(operation, pair, quantity, price);
    }
  }

  _getFiboSum(jump, operation, place) {
    let i = place;
    let totalFibo = 0;
    while (i >= jump && !this.fibonacci[operation][i]['executed']) {
      totalFibo += this.fibonacci[operation][i]['fibo'];
      i = i - jump;
    }
    return totalFibo;
  }

  async getBtc() {
    try {
      let data = await this.binance.accountInfo();
      let obj = data.balances.find(element => element.asset == 'BTC');
      return obj.free;
    }
    catch (error) {
      console.error('Error in getBtc()', errorMessage(error));
      await delay(2000);
      return this.getBtc();
    }
  }

  async updateAverage() {
    await this.sma('4h', 50);
    await delay(300000);
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
      this.average = average;
      return average;
    }
    catch (error) {
      console.error(`Error in sma: ${this.name}`, errorMessage(error))
      await delay(60000);
      return this.sma(interval, periods)
    }
  }
}

module.exports = Coin;
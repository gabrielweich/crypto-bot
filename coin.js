const { delay, errorMessage, toPlace, alma, format } = require('./utils');

class Coin {
  constructor(name, sensibility = 5, priority = 7, fractionLimit = 0) {
    this.name = name;
    this.pair = name + 'BTC';
    this.sensibility = sensibility;//sensibility >= 0 && sensibility <= 4 ? sensibility : 2;
    this.fractionLimit = fractionLimit;
    this.createObjects();
    this.calculateDisponibility(priority);
  }

  createObjects() {
    this.fibonacci = {
      5: { fibo: 1, buy: false, sell: false },//5 - 10%
      10: { fibo: 2, buy: false, sell: false },//10 - 15%
      15: { fibo: 3, buy: false, sell: false },//15 - 20%
      20: { fibo: 5, buy: false, sell: false },//20 - 25%
      25: { fibo: 8, buy: false, sell: false },//25 - 30%
      30: { fibo: 13, buy: false, sell: false },//30 - 35%
      35: { fibo: 21, buy: false, sell: false },//35 - 40%
      40: { fibo: 34, buy: false, sell: false },//40 - 45%
      45: { fibo: 55, buy: false, sell: false },//>45
    }

    this.awaitedState = {
      buy: 5,
      sell: 5
    }

    this.state = 0; // -1: sell | 1: buy | 0: initial

    this.inProcess = false;

    this.reference = 0;
  }

  calculateDisponibility(priority) {
    this.disponibility = priority >= 1 && priority <= 10 ? (10 - priority) * 10 : 30;
  }

  receiveProps(binance, config, funds) {
    this.binance = binance;
    this.config = config;
    this.sensibility = this.sensibility * this.config.generalSensibility;
    this.funds = funds;
  }

  setAverage(average) {
    this.average = parseFloat(average);
  }

  updateQuantity(quantity) {
    this.quantity = parseFloat(quantity);
  }

  async trade(price) {
    if (!this.inProcess) {
      const valuation = (((price * 100) / this.average) - 100) * this.sensibility;
      //console.log(`${this.name}: Val:${valuation} | Prc:${price} | Avg:${this.average} | As:${this.awaitedState.sell} | Ab:${this.awaitedState.buy}`);
      if (valuation > this.awaitedState.sell) { //SELL
        this.inProcess = true;
        this.reference = this.state !== -1 ? this.quantity : this.reference; //First Sell
        const place = toPlace(valuation);
        this.analyze(price, place, 'sell');
      }
      else if (valuation < -this.awaitedState.buy) { //BUY
        this.inProcess = true;
        this.reference = this.state !== 1 ? this.disponibility * this.funds.getBtc() / 100 : this.reference;
        const place = toPlace(valuation);
        this.analyze(price, place, 'buy');
      }
    }
  }

  async analyze(price, place, operation) {
      operation = operation.toLowerCase();
      let quantity = 0;

      let value = 0;

      const fiboSum = this._getFiboSum(operation, place);

      if (operation === 'sell') {
        quantity = (fiboSum * this.reference) / 142;
        value = quantity * price;
      }

      else if (operation === 'buy') {
        value = (fiboSum * this.reference) / 142;
        quantity = value / price;
      }

      //console.log(`${this.name} -> Prc: ${price} | Plc: ${place} | Op: ${operation} | FibSum: ${fiboSum} | Qtt: ${quantity} | Val: ${value} | Ref: ${this.reference} | Av ${this.average}`);

      if (value > 0.001) {
        quantity = format(quantity, this.fractionLimit);
        await this.placeOrder(operation, this.pair, quantity);
        console.log(`${operation} -> ${this.name}: Prc: ${price} | Qtd: ${quantity} | Val: ${value} | Plc: ${place}`);
        await this.finishOrder(place, operation);
      }

      this.shiftState(operation, place);
      this.inProcess = false;
  }

  shiftState(operation, place) {
    if (operation === 'sell') {
      if (this.state != -1) {
        this.awaitedState['buy'] = 5;
        this.cleanFibonacci('buy');
      }
      this.state = -1;
    }
    else if (operation === 'buy') {
      if (this.state != 1) {
        this.awaitedState['sell'] = 5;
        this.cleanFibonacci('sell');
      }
      this.state = 1;
    }

    this.awaitedState[operation] = parseInt(place) + 5;
  }

  async finishOrder(place, operation) {
    let i = place;
    while (i >= 5 && !this.fibonacci[i][operation]) {
      this.fibonacci[i][operation] = true;
      i -= 5;
    }

    await this.refreshQuantity();
    await this.funds.updateFunds();
  }

  cleanFibonacci(operation) {
    let i = 5;
    while (i <= 45 && this.fibonacci[i][operation]) {
      this.fibonacci[i][operation] = false;
      i += 5;
    }
  }

  async placeOrder(operation, pair, quantity, options = {}) {
    try {
      const data = await this.binance.order(operation, pair, quantity, options);
      return data;
    }
    catch (error) {
      console.error('Error in placeOrder()', errorMessage(error));
      await delay(1000);
      return this.placeOrder(operation, pair, quantity, options);
    }
  }

  async refreshQuantity() {
    try {
      const data = await this.binance.accountInfo();
      const balances = data.balances;

      this.quantity = balances.find(obj => obj.asset == this.name).free;
    }
    catch (error) {
      console.error("Error in refreshQuantity()", errorMessage(error));
      await delay(2000);
      return this.refreshQuantity();
    }
  }

  _getFiboSum(operation, place) {
    let i = place;
    let totalFibo = 0;
    while (i >= 5 && !this.fibonacci[i][operation]) {
      totalFibo += this.fibonacci[i]['fibo'];
      i = i - 5;
    }
    return totalFibo;
  }
}

module.exports = Coin;
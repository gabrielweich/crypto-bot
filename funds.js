const { delay, errorMessage } = require('./utils');

class Funds {
  constructor(binance) {
    this.btc = 0;
    this.binance = binance;
  }

  async updateFunds() {
    try {
      let data = await this.binance.accountInfo();
      let obj = data.balances.find(element => element.asset == 'BTC');
      this.btc = obj.free;
    }
    catch (error) {
      console.error('Error in updateFunds()', errorMessage(error));
      await delay(1000);
      return this.updateFunds();
    }
  }

  getBtc() {
    return parseFloat(this.btc);
  }

  setBtc(btc) {
    this.btc = btc;
  }
}

module.exports = Funds;
class Coin{
  constructor(name){
    this.name = name;
    this.pair = name + 'BTC';
  }

  updatePrice(price){
    this.price = price;
    console.log(this.name + ": " + this.price);
  }

  receiveBinance(binance){
    this.binance = binance;
    //this.sma('4h', 50);
  }

  sma(interval, periods){
    this.binance.candles(this.pair, interval, {limit: periods})
    .then(data => {
      let sum = 0;
      
      data.forEach(period => {
        sum += parseFloat(period[4]);
      });

      const average = sum/periods;

      console.log(this.name + " -> average: " + average);
    })
  }
}

module.exports = Coin;
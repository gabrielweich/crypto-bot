const delay = (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

const toPlace = (valuation) => {
  valuation = Math.abs(valuation);
  let place = 0;
  if (valuation >= 50)
    place = 45;
  else if (valuation < 10) {
    place = 5;
  }
  else {
    let initialPlace = valuation.toString().split("", 2);
    let finalPlace = initialPlace[0];
    parseInt(initialPlace[1]) >= 5 ? finalPlace += "5" : finalPlace += "0";
    place = finalPlace;
  }
  return place;
}

const errorMessage = error => {
  let errorStr = error.stack;

  if (typeof error.response !== 'undefined') {
    errorStr += `
    ${JSON.stringify(error.response.data)}`
  }

  return errorStr;
}


const alma = (data, window, offset, sigma) => {
  const m = Math.floor(offset * (window - 1));
  const s = window / sigma;

  let alma = 0;
  let wSum = 0;

  for (let i = 0; i < window; i++) {
    let w = Math.exp(-(i - m) * (i - m) / (2 * s * s));
    alma += data[window - 1 - i] * w;
    wSum += w;
  }
  return alma / wSum;
}

const format = (num, fixed) => {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  const result = num.toString().match(re)[0];
  return parseFloat(result);
}


module.exports = { delay, errorMessage, alma, toPlace, format };
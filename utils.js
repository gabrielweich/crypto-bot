const delay = (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

const toSellPlace = (valuation) => {
  let place = 0;
  if (valuation >= 100)
    place = 90;
  else if (valuation < 10)
    place = 10;
  else
    place = parseInt(valuation.toString().split("", 1)[0]) * 10;

  return place;
}

const toBuyPlace = (devaluation) => {
  let place = 0;
  if (devaluation >= 50)
    place = 45;
  else if (devaluation < 10) {
    place = 5;
  }
  else {
    let initialPlace = devaluation.toString().split("", 2);
    let finalPlace = initialPlace[0];
    parseInt(initialPlace[1]) >= 5 ? finalPlace += "5" : finalPlace += "0";
    place = finalPlace;
  }
  return place;
}

const errorMessage = error => {
  let errorStr = error.stack;

  if(typeof error.response !== 'undefined'){
    errorStr += `
    ${JSON.stringify(error.response.data)}`
  }

  return errorStr;
}

module.exports = { delay, toBuyPlace, toSellPlace, errorMessage };
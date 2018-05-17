function handleNewItem (source) {
  var newObj = {}
  var len = source.length;
  if (len > 0) {
    for (var i = 0; i< len; i++) {
      var amount_input = source[i].querySelector('input[type="number"]');
      var date_inputs = source[i].querySelectorAll('input[type=date]');
      var frequency_input = source[i].querySelector('select');
      newObj[amount_input.name] = {}
      newObj[amount_input.name].amount = amount_input.value;
      if (date_inputs.length > 0) {
        if (!date_inputs[0].value || !date_inputs[1].value) return null
        newObj[amount_input.name].fromDate = date_inputs[0].value;
        newObj[amount_input.name].toDate = date_inputs[1].value;
      } else if (frequency_input) {
        if (!frequency_input.value) return null
        newObj[amount_input.name].frequency = frequency_input.value;
      }
    }
  }
  return newObj
}
function getFormData () {
  var income = +document.getElementById('income').value;
  var rent_frequency = document.getElementById('frequency').value;
  var morgage = +document.getElementById('morgage').value;
  var morgage_frequency = document.getElementById('morgage_frequency').value;

  var bills = document.querySelectorAll('.bill');
  var others = document.querySelectorAll('.other');
  var bills_obj = handleNewItem(bills);
  var others_obj = handleNewItem(others);
  bills_obj = Object.assign(others_obj, bills_obj)
  var billResultDOM = document.querySelector('.bill-result');

  var finalObj = {}
  finalObj['bill'] = handleBillResultHTML(bills_obj, billResultDOM)
  finalObj['morgage'] = {weekly: 0, monthly: 0, yearly: 0}
  finalObj['income'] = {weekly: 0, monthly: 0, yearly: 0}

  // if (!income || !morgage || !bills_obj || !others_obj) {
  //   return null;
  // }
  getYearly(income, rent_frequency, finalObj['income']);
  getYearly(morgage, morgage_frequency, finalObj['morgage']);
  return {bills_obj, finalObj}
}

function handleAddBtnClick (value, className) {
  var elementContainer = document.querySelector(className);
  var valueLower = value.toLowerCase();
  if (valueLower.split(' ').length > 1) {
    valueLower = valueLower.split(' ').join('')
  }
  value = value.toUpperCase();
  var html = className === '.bill-section' ? `
  <div class="bill ${valueLower}-bill">
    <div class="input-group">
      <label for="${valueLower}">${value} Bill:</label>
      <input id="${valueLower}" name="${valueLower}" type="number" required>
    </div>
    <div class="input-group date-input">
      <input type="date" id="${valueLower}fromDate" required>
      <input type="date" id="${valueLower}toDate" required>
    </div>
  </div>
  ` : `
  <div class="other ${valueLower}-bill">
    <div class="input-group">
      <label for="${valueLower}">${value}:</label>
      <input id="${valueLower}" name="${valueLower}" type="number">
      <select name="frequency" id="${valueLower}frequency">
        <option value="weekly" selected="selected">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  </div>
  `
  elementContainer.innerHTML += html;
}

function getDays (fromDate, toDate) {
  var fromDate = new Date(fromDate);
  var toDate = new Date(toDate);
  var days = (toDate - fromDate) / 1000 / 3600 / 24;
  return days;
}

function getYearly (amount, frequency, obj) {
  switch (frequency) {
    case 'weekly':
      obj.weekly = amount
      obj.monthly = amount * 52 / 12
      obj.yearly = amount * 52
      break;
    case 'monthly':
      obj.weekly = amount * 12 / 52
      obj.monthly = amount
      obj.yearly = amount * 12
      break;
  }
}

function handleFinalResultHTML (param, targetElem) {
  targetElem.innerHTML = ''
  var html = ''
  for (key in param) {
    if ((param[key].weekly && param[key].monthly && param[key].yearly)) {
      console.log('key: ', key, 'param[key]: ', param[key])
      for (innerKey in param[key]) {
        console.log('innerKey: ', innerKey, 'param[innerKey]: ', param[key][innerKey])
        html += `
        <div class="final-total">
          <span class="expense">${capitalizeFirstLetter(innerKey)} ${capitalizeFirstLetter(key)}:</span>
          <span class="expense-amount">${handleFloatDigits(param[key][innerKey])}</span>
        </div>
        `
      }
    }
  }
  var marginResult = param.income.yearly - param.bill.yearly - param.morgage.yearly
  var marginClass = marginResult > 0 ? 'gain' : 'loss'
  html += `
  <div class="final-total">
    <span class="expense ${marginClass}">Difference:</span>
    <span class="expense-amount ${marginClass}">${handleFloatDigits(marginResult)}</span>
  </div>
  `
  targetElem.innerHTML += html
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function handleFloatDigits (num) {
  return Math.round(num * 100) / 100
}
function handleBillResultHTML (param, targetElem) {
  if (!param) {
    return
  }
  var days = 0;
  var daily = 0;
  var daily_total = 0;
  var yearly = 0;
  var yearly_total = 0;
  var html = '';
  for (var key in param) {
    if (param[key].fromDate && param[key].toDate){
      days = getDays(param[key].fromDate, param[key].toDate);
      // var days = getDays(param[key].fromDate, param[key].toDate);
      param[key].perDay = param[key].amount / days;
      daily_total += param[key].perDay
      param[key].yearly = param[key].perDay * 365;
      yearly_total += param[key].yearly
      daily = handleFloatDigits(param[key].perDay)
      yearly = handleFloatDigits(param[key].yearly)
    } else if (param[key].frequency) {
      days = param[key].frequency.toLowerCase() === 'weekly' ? 7 : 30
      param[key].perDay = param[key].amount / days;
      param[key].yearly = param[key].perDay * 365;
      daily = handleFloatDigits(param[key].perDay)
      daily_total += param[key].perDay
      yearly = handleFloatDigits(param[key].yearly)
      yearly_total += param[key].yearly
    }
    html += `
    <div class="bill-result-detail">
      <h3 class="bill-result-title ${key}">${key.toUpperCase()}:</h3>
      <div class="bill-result-detail-content">
        <div class="content-item">
          <span class="item-key">${days} days total:</span>
          <span class="item-value">${param[key].amount}</span>
        </div>
        <div class="content-item">
          <span class="item-key">Daily:</span>
          <span class="item-value">${daily}</span>
        </div>
        <div class="content-item">
          <span class="item-key">Yearly:</span>
          <span class="item-value">${yearly}</span>
        </div>
      </div>
    </div>
    `
  }
  if (targetElem) {
    targetElem.innerHTML = ''
    targetElem.innerHTML += html;
  }
  return {daily: daily_total, weekly: daily_total * 7, monthly: yearly_total / 12, yearly: yearly_total}
}
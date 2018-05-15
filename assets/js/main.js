(function () {
  var billName = '';
  var otherName = '';
  var result = document.querySelector('.result');
  var submit = document.querySelector('.submit .btn-submit');
  var addBillBtn = document.querySelector('.add-bill button');
  var billNameInput = document.querySelector('.bill-name');
  var addOtherBtn = document.querySelector('.add-other button');
  var otherNameInput = document.querySelector('.other-name');
  addBillBtn.addEventListener('click', function (e) {
    e.stopPropagation()
    e.preventDefault();
    if (billNameInput.value.trim().length <= 0) {
      return;
    } else {
      billName = billNameInput.value;
      handleAddItem(billName, '.bill-section');
      billNameInput.value = '';
    }
  })
  addOtherBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (otherNameInput.value.trim().length <= 0) {
      return;
    } else {
      otherName = otherNameInput.value;
      handleAddItem(otherName, '.other-expense');
      otherNameInput.value = '';
    }
  })
  var yearlyRent = document.querySelector('.yearly-rent')
  var yearlyBill = document.querySelector('.yearly-bill')
  var yearlyMorgage = document.querySelector('.yearly-morgage')
  submit.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var result = {}
    if (getFormData()) {
      result = getFormData();
      yearlyRent.innerHTML = result.yearlyRentIncome;
      yearlyBill.innerHTML = result.billTotal + result.otherTotal;
      yearlyMorgage.innerHTML = result.yearlyMorgage;
    }
    console.log(yearlyRent, yearlyBill, yearlyMorgage)
  })
}())

function getFormData () {
  var income = document.getElementById('income').value;
  var rent_frequency = document.getElementById('frequency').value;
  var morgage = document.getElementById('morgage').value;
  var morgage_frequency = document.getElementById('morgage_frequency').value;

  var bills = document.querySelectorAll('.bill');
  var others = document.querySelectorAll('.other');
  var bills_obj = {};
  var others_obj = {};
  var billTotal = 0;
  var otherTotal = 0;
  if (bills.length > 0) {
    for (var i = 0; i < bills.length; i++){
      var amount_input = bills[i].querySelector('input[type="number"]');
      var date_inputs = bills[i].querySelectorAll('input[type=date]');
      bills_obj[amount_input.name] = {
        amount: amount_input.value,
        fromDate: date_inputs[0].value,
        toDate: date_inputs[1].value
      };
    }
    billTotal = handleExpenseCalc(bills_obj, '.bill-section');
    console.log(billTotal)
  }
  if (others.length > 0) {
    for (var i = 0; i < others.length; i++) {
      var amount_input = others[i].querySelector('input[type="number"]');
      var other_frequency = others[i].querySelector('select');
      others_obj[amount_input.name] = {
        amount: amount_input.value,
        frequency: other_frequency.value
      }
    }
    otherTotal = handleExpenseCalc(others_obj, '.other-expense');
    console.log(otherTotal)
  }
  if (!income || !morgage) {
    return null;
  }
  var yearlyRentIncome = getYearly(income, rent_frequency);
  var yearlyMorgage = getYearly(morgage, morgage_frequency);
  return {
    yearlyRentIncome, yearlyMorgage, billTotal, bills_obj, otherTotal, others_obj
  }
}

function handleAddItem (value, className) {
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
  <div class="input-group other">
    <label for="${valueLower}">${value}:</label>
    <input id="${valueLower}" name="${valueLower}" type="number">
    <select name="frequency" id="${valueLower}frequency">
      <option value="weekly" selected="selected">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
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

function getYearly (amount, frequency) {
  switch (frequency) {
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
  }
}

function handleExpenseCalc (param, targetElem) {
  if (!param) {
    return
  }
  var total = 0;
  var html = '';
  for (var key in param) {
    if (param[key].fromDate && param[key].toDate){
      var days = getDays(param[key].fromDate, param[key].toDate);
      param[key].perDay = param[key].amount / days;
      param[key].yearly = param[key].perDay * 365;
      total += param[key].yearly;
      html += `
      <div class="bill-sub">
        <div class="title text-center">${key}</div>
        <div class="body">
          <div class="date">
            <span>From Date: </span><span>${param[key].fromDate}</span>
            <span>To Date: </span><span>${param[key].toDate}</span>
          </div>
          <div class="date-total">
            <span>Total Days: ${days}</span>
            <span>Total Expense: ${param[key].amount}</span>
          </div>
        </div>
        <div class="footer">
          <span>Expenses Per Day: </span>${param[key].perDay}
          <span>Expenses Per Year: </span>${param[key].yearly}
        </div>
      </div>
      `
    } else if (param[key].frequency) {
      total += getYearly(param[key].amount, param[key].frequency)
      
      html += `
      <div class="other-expense-sub">
        <div class="title text-center">${key}</div>
        <div class="body">
          <span>Amount: </span><span>${param[key].amount}</span> 
          <span>Frequency: </span><span>${param[key].frequency}</span>
          <span>Yearly Expense: ${total}</span>
        </div>
      </div>
      `
    }
  }
  if (targetElem) {
    document.querySelector(targetElem).innerHTML += html;
  }
  return total;
}
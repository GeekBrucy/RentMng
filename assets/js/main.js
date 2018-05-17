(function () {
  var billName = '';
  var otherName = '';
  var submitBtn = document.querySelector('.submit .btn-submit');
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
      handleAddBtnClick(billName, '.bill-section');
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
      handleAddBtnClick(otherName, '.other-expense');
      otherNameInput.value = '';
    }
  })
  var billResultDOM = document.querySelector('.bill-result')
  var finalResultDOM = document.querySelector('.final-result')
  submitBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var result = getFormData()
    if (result) {
      handleBillResultHTML(result.bills_obj, billResultDOM)
      handleFinalResultHTML(result.finalObj, finalResultDOM)
    } else {
      return
    }
  })
}())



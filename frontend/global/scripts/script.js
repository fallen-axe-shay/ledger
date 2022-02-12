const myStorage = window.sessionStorage;
let userData = {};
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let balance = 0;

(function() {
    //Set Datepicker Max Date
    document.getElementById('date').max = new Date().toLocaleDateString('en-ca')
    let authToken = myStorage.getItem('authToken');
    if(authToken) {
        userData['authToken'] = authToken;
        hideLoginPage();
    }
}());

function login() {
    $('#loginContent .loginForm .error').addClass('hide');
    var $username = $('#username');
    var $password = $('#password');
    var userVal = $username.val().trim();
    var passVal = $password.val().trim();
    $username.val(userVal);
    $password.val(passVal);
    passVal = window.btoa(passVal);
    if(userVal=='' || passVal=='') {
        document.querySelector('#password').setCustomValidity('Enter a valid password');
        document.querySelector('#username').setCustomValidity('Enter a valid username');
        (passVal == '') && document.querySelector('#password').reportValidity();
        (userVal == '') && document.querySelector('#username').reportValidity();
    } else {
        authenticateUser(userVal, passVal);
    }
}

function authenticateUser(username, password) {
    var $loginButton = $('.loginForm form button');
    $loginButton.attr('disabled', true);
    $loginButton.html('Logging In');
    $.ajax({
        type : "POST",
        url  : ENV_DATA['loginEndpoint'],
        data : { username : username, password : password },
        success: (response) => {  
                    response = JSON.parse(response.substring(0, response.length-1));
                    $loginButton.attr('disabled', false);
                    $loginButton.html('Login');
                    if(response['jsonCode'] != 200) {
                        message = '';
                        switch(response['jsonCode']) {
                            case 401:
                                message = 'Password is wrong. Try entering the password again.';
                                break;
                            case 404:
                                message = 'Account not found. Make sure you are using a valid email address.';
                                break;
                            case 407:
                                message = 'AuthToken expired. Make sure you\'re getting a new authToken from the response of each request or log in again.';
                                break;
                            default:
                                message = 'Invalid username or password.';
                                break;
                        }
                        showLoginError(message);
                    } else {
                        userData = response;
                        sessionStorage.setItem('authToken', response['authToken']);
                        hideLoginPage();
                    }
                },
        error: (XMLHttpRequest, textStatus, errorThrown) => { 
                    $loginButton.attr('disabled', false);
                    $loginButton.html('Login');
                    var message = 'An error occured on the server';
                    showLoginError(message);
                }  
    });
}

function showLoginError(message) {
    $error = $('#loginContent .loginForm .error');
    $error.removeClass('hide');
    $error.find('span').html(message);
}

function clearLoginPage() {
    $('#username').val('');
    $('#password').val('');
}

function hideLoginPage() {
    var $loginContent = $('#loginContent');
    $loginContent.find('*').removeClass('fadeIn');
    $loginContent.find('*').addClass('fadeOut');
    $loginContent.css({'transition': '1s', 'height': '0px'});
    showTransactionPage();
    clearLoginPage();
}

function showLoginPage() {
    var $loginContent = $('#loginContent');
    $loginContent.find('*').removeClass('fadeOut');
    $loginContent.find('.title').addClass('fadeIn');
    $loginContent.find('.loginForm').addClass('fadeIn');
    $loginContent.css({'transition': '1s', 'height': '100%'});
    hideTransactionPage();
}

function showTransactionPage() {
    var $transactionContainer = $('#transactionContainer');
    $transactionContainer.removeClass('fadeOut');
    $transactionContainer.removeClass('hide');
    populateTransactions();
}

function hideTransactionPage() {
    var $transactionContainer = $('#transactionContainer');
    $transactionContainer.addClass('fadeOut');
    $transactionContainer.addClass('hide');
}

function populateTransactions() {
    balance = 0;
    var $transactionContainer = $('#transactionContainer');
    $transactionContainer.find('.error').addClass('hide');
    $transactionContainer.find('#transactionTable').addClass('hide');
    $transactionContainer.find('#transactionForm').addClass('hide');
    $transactionContainer.find('.spinner-div').toggleClass('hide');
    $('#transactionTableBody').html('');
    $.ajax({
        type : "GET",
        async: true,
        url  : ENV_DATA['getTransactionsEndpoint'],
        data : { authToken : userData['authToken'] },
        success: (response) => {  
                    response = JSON.parse(response.substring(0, response.length-1));
                    $transactionContainer.find('#transactionTable').removeClass('hide');
                    $transactionContainer.find('#transactionForm').removeClass('hide');
                    $transactionContainer.find('.spinner-div').toggleClass('hide');
                    var transactionList = response.transactionList;
                    var tableBodyData = document.createDocumentFragment();
                    var tableBodyElement = document.getElementById('transactionTableBody');
                    for (var index=0; index<transactionList.length; index++) {                    
                        tableBodyData.appendChild(getTableRow(transactionList[index]));
                    }
                    tableBodyElement.appendChild(tableBodyData);
                    setBalance();
                },
        error: (XMLHttpRequest, textStatus, errorThrown) => { 
                    showTransactionPageError();
                }  
    });
}

function setBalance() {
    balance = parseFloat(balance);
    $balanceElement = $('#transactionTable #balance span');
    if(balance<0) {
        $balanceElement.addClass('debt');
    } else {
        $balanceElement.removeClass('debt');
    }
    var balanceStr = getPrettyNumber(balance);
    if (!balanceStr.split('.')[1]) {
        balanceStr += '.00'
    }
    $balanceElement.html(`\$ ${balanceStr}`);
} 

function showTransactionPageError() {
    $('#transactionContainer .error').removeClass('hide');
}

function getTableRow(item) {
    var row, tableData;
    row = document.createElement("tr");
    tableData = document.createElement("td");
    tableData.appendChild(document.createTextNode(getPrettyDate(item.created)));
    row.appendChild(tableData);
    tableData = document.createElement("td");
    tableData.appendChild(document.createTextNode(item.merchant));
    row.appendChild(tableData);
    tableData = document.createElement("td");
    amount = parseFloat(item.amount)/100;
    balance += amount;
    if(amount<0) {
        tableData.className = 'debit';
    } else {
        tableData.className = 'credit';
    }
    amount = getPrettyNumber(amount);
    if (!amount.split('.')[1]) {
        amount += '.00'
    }
    tableData.appendChild(document.createTextNode(`\$ ${amount}`));
    row.appendChild(tableData);
    return row;
}

function getPrettyDate(date) {
    date = date.split(' ')[0].split('-');
    return `${months[parseInt(date[1])-1]} ${parseInt(date[2])}, ${date[0]}`;
}

function getPrettyNumber(number) {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function openNav() {
    $('#transactionForm').css('width', '40%');
}
  
function closeNav() {
    $('#transactionForm').css('width', '0px');
}

function addTransaction() {
    $('.transactionInputForm .error').addClass('hide');
    var $merchantName = $('#merchantName');
    var $amount = $('#amount');
    var $date = $('#date');
    var merchantNameVal = $merchantName.val().trim();
    var amountVal = $amount.val().trim();
    var dateVal = $date.val();
    $merchantName.val(merchantNameVal);
    $amount.val(amountVal);
    if(merchantNameVal == '' || checkIfAmountIsInvalid(amountVal) || dateVal == '') {
        document.querySelector('#merchantName').setCustomValidity('Enter a valid merchant name');
        document.querySelector('#amount').setCustomValidity('Enter a valid amount');
        document.querySelector('#date').setCustomValidity('Enter a valid date');
        (dateVal == '') && document.querySelector('#date').reportValidity();
        checkIfAmountIsInvalid(amountVal) && document.querySelector('#amount').reportValidity();
        (merchantNameVal == '') && document.querySelector('#merchantName').reportValidity();
    } else {
        createTransaction(merchantNameVal, amountVal, dateVal);
    }
}

function checkIfAmountIsInvalid(amountVal) {
    return (amountVal == '' || (amountVal.split('.').length==2 && amountVal.split('.')[1].length>2) || isNaN(parseInt(amountVal)));
}

function createTransaction(merchant, amount, date) {
    amount = (-1*parseFloat(amount)*100).toString(); //Convert USD amount to Cents. -1 is multiplied to counteract the API issue
    var $transactionButton = $('.transactionInputForm button');
    $transactionButton.attr('disabled', true);
    $transactionButton.html('Adding Transaction');
    $.ajax({
        type : "POST",
        url  : ENV_DATA['createTransactionEndpoint'],
        data : { merchant : merchant, amount : amount, date : date, authToken : userData['authToken'] },
        success: (response) => {  
                    response = JSON.parse(response.substring(0, response.length-1));
                    $transactionButton.attr('disabled', false);
                    $transactionButton.html('Add');
                    if(response['jsonCode'] != 200) {
                        message = 'Unable to add transaction.';
                        showTransactionFormError(message);
                    } else {
                        var data = {
                            merchant: merchant,
                            amount: (-1*parseFloat(amount)), //-1 is multiplied to get back the correct amount (as it as changed to counteract the API issue)
                            created: date
                        }
                        addNewRowToTransactionTable(data);
                        clearTransactionFields();
                        closeNav();
                    }
                },
        error: (XMLHttpRequest, textStatus, errorThrown) => { 
                    $transactionButton.attr('disabled', false);
                    $transactionButton.html('Add');
                    var message = 'An error occured on the server';
                    showTransactionFormError(message);
                }  
    });
}

function clearTransactionFields() {
    $('#merchantName').val('');
    $('#amount').val('');
    $('#date').val('');
}

function addNewRowToTransactionTable(data) {
    var tableBodyElement = document.getElementById('transactionTableBody');
    var row = getTableRow(data);
    row.className = 'addedRow';
    tableBodyElement.insertBefore(row, tableBodyElement.firstChild);
    setBalance();
}

function showTransactionFormError(message) {
    $error = $('.transactionInputForm .error');
    $error.removeClass('hide');
    $error.find('span').html(message);
}

function logout() {
    myStorage.clear();
    showLoginPage();
}

//JQuery Functions

$('.numbersOnly').keydown(function (event) {
    if (event.shiftKey == true) {
        event.preventDefault();
    }
    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46 || event.keyCode == 190) {
            //Allow
    } else {
        event.preventDefault();
    }
    if($(this).val().indexOf('.') !== -1 && event.keyCode == 190)
        event.preventDefault(); 
});

$('form input').on('keydown', (event) => {
    document.querySelector(`#${event.target.id}`).setCustomValidity('');
});

$('form input').on('change', (event) => {
    var $HTMLElement = $(event.target);
    var value = $HTMLElement.val().trim();
    $HTMLElement.val(value);
});
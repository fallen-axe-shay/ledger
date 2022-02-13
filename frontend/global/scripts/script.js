//Global Constants

const myStorage = window.sessionStorage;
let userData = {};
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let balance = 0;
//ENV_DATA imported from ../env-var/envDataFrontend.js

(function() {
    //Set Datepicker Max Date
    document.getElementById('date').max = new Date().toLocaleDateString('en-ca');
    let authToken = myStorage.getItem('authToken');
    if(authToken) {
        userData['authToken'] = authToken;
        hideLoginPage();
    }
}()); //IIFY Function to directly skip login if authToken exists


//Functions

function login() { //Login Function
    $('#loginContent .loginInputForm .error').addClass('hide');
    [userVal, passVal] = getUserNameAndPassword();
    if(userVal=='' || passVal=='') {
        reportLoginFormValidity(userVal, passVal);
    } else {
        authenticateUser(userVal, passVal);
    }
}

function authenticateUser(username, password) { //Authenticate the User
    disableLoginButton();
    $.ajax({
        type : "POST",
        url  : ENV_DATA['loginEndpoint'],
        data : { username : username, password : password },
        success: authenticateUserSuccessCallback,
        error: authenticateUserErrorCallback  
    });
}

function getUserNameAndPassword() { //Get the values from the login input form
    var $username = $('#username');
    var $password = $('#password');
    var userVal = $username.val().trim();
    var passVal = $password.val().trim();
    $username.val(userVal); //Removing trailing and leading spaces
    $password.val(passVal); //Removing trailing and leading spaces
    passVal = window.btoa(passVal); //Base64 Encoding of Password
    return [userVal, passVal];
}

function addTransaction() { //Add a new transaction
    $('.transactionInputForm .error').addClass('hide');
    [merchantNameVal, amountVal, dateVal] = getNewTransactionValues();
    if(merchantNameVal == '' || checkIfAmountIsInvalid(amountVal) || dateVal == '') {
        reportTransactionFormValidity(merchantNameVal, dateVal, amountVal);
    } else {
        amountVal = parseFloat(amountVal) * ($('.transactionInputForm #amountCreditSwitch').prop('checked') ? 1 : -1); //Change the amount to negative/positive based on whether its debit/credit
        createTransaction(merchantNameVal, amountVal, dateVal);
    }
}

function getNewTransactionValues() { //Get the values from the transaction input form
    var $merchantName = $('#merchantName');
    var $amount = $('#amount');
    var $date = $('#date');
    var merchantNameVal = $merchantName.val().trim();
    var amountVal = $amount.val().trim();
    var dateVal = $date.val();
    $merchantName.val(merchantNameVal);
    $amount.val(amountVal);
    return [merchantNameVal, amountVal, dateVal];
}

function populateTransactions() { //Populate the transaction page
    balance = 0;
    var $transactionContainer = $('#transactionContainer');
    hideTransactionContainerElements($transactionContainer);
    $.ajax({
        type : "GET",
        async: true,
        url  : ENV_DATA['getTransactionsEndpoint'],
        data : { authToken : userData['authToken'] },
        success: populateTransactionsSuccessCallback,
        error: populateTransactionsErrorCallback 
    });
}

function setBalance() { //Setting the overall balance in the transaction page
    balance = parseFloat(balance);
    $balanceElement = $('#transactionTable #balance span');
    if(balance<0) {
        $balanceElement.addClass('debt');
    } else {
        $balanceElement.removeClass('debt');
    }
    var balanceStr = getPrettyNumber(balance.toFixed(2));
    $balanceElement.html(`\$ ${balanceStr}`);
} 

function getTableRow(item) { //Get a row to be added to the transaction table
    var row, dateData, amountData, merchantData;
    row = document.createElement("tr");
    dateData = document.createElement("td");
    dateData.appendChild(document.createTextNode(getPrettyDate(item.created)));
    row.appendChild(dateData);
    merchantData = document.createElement("td");
    merchantData.appendChild(document.createTextNode(item.merchant));
    row.appendChild(merchantData);
    amountData = document.createElement("td");
    amount = parseFloat(item.amount)/100; //Convert Cents to USD
    balance += amount;
    if(amount<0) {
        amountData.className = 'debit';
    } else {
        amountData.className = 'credit';
    }
    amount = getPrettyNumber(amount.toFixed(2));
    amount = amount.replace('-', '');
    amountData.appendChild(document.createTextNode(`\$ ${amount}`));
    row.appendChild(amountData);
    return row;
}

function getPrettyDate(date) { //Convert the response date to <Month Date, Year> format
    date = date.split(' ')[0].split('-');
    return `${months[parseInt(date[1])-1]} ${parseInt(date[2])}, ${date[0]}`;
}

function getPrettyNumber(number) { //Add commas to numbers
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function checkIfAmountIsInvalid(amountVal) { //Used for reportValidity functionality for the amount field
    return (amountVal == '' || (amountVal.split('.').length==2 && amountVal.split('.')[1].length>2) || isNaN(parseInt(amountVal)));
}

function createTransaction(merchant, amount, date) { //Create a new Transaction
    disableTransactionButton();
    amount = (-1 * amount * 100).toString(); //Convert USD amount to Cents. -1 is multiplied to counteract the API issue
    $.ajax({
        type : "POST",
        url  : ENV_DATA['createTransactionEndpoint'],
        data : { merchant : merchant, amount : amount, date : date, authToken : userData['authToken'] },
        success: (response) => { createTransactionSuccessCallback(response, merchant, amount, date) },
        error: createTransactionErrorCallback 
    });
}

function addNewRowToTransactionTable(data) { //Add a new row when we create a new transaction
    var tableBodyElement = document.getElementById('transactionTableBody');
    var row = getTableRow(data);
    row.className = 'addedRow';
    tableBodyElement.insertBefore(row, tableBodyElement.firstChild);
    setBalance();
}

function logout() { //Logout and delete AuthToken
    myStorage.clear();
    showLoginPage();
}

//JQuery Functions

$('.numbersOnly').keydown(function (event) { //Allow only numbers in number field
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
    document.querySelector(`#${event.target.id}`).setCustomValidity(''); //Remove form validation on input
});

$('form input').on('change', (event) => { //Cleanup/trim values when entering in field
    var $HTMLElement = $(event.target);
    var value = $HTMLElement.val().trim();
    $HTMLElement.val(value);
});

// UI Specific Functions

function showLoginError(message) {
    $error = $('#loginContent .loginInputForm .error');
    $error.removeClass('hide');
    $error.find('span').html(message);
}

function clearLoginPage() {
    $('#username').val('');
    $('#password').val('');
}

function slideUpLoginPage() {
    var $loginContent = $('#loginContent');
    $loginContent.addClass('slideUp');
    $loginContent.removeClass('slideDown');
}

function slideDownLoginPage() {
    var $loginContent = $('#loginContent');
    $loginContent.addClass('slideDown');
    $loginContent.removeClass('slideUp');
}

function hideLoginPage() {
    slideUpLoginPage();
    showTransactionPage();
    clearLoginPage();
}

function showLoginPage() {
    slideDownLoginPage();
    hideTransactionPage();
}

function reportLoginFormValidity(userVal, passVal) {
    document.querySelector('#password').setCustomValidity('Enter a valid password');
    document.querySelector('#username').setCustomValidity('Enter a valid username');
    (passVal == '') && document.querySelector('#password').reportValidity();
    (userVal == '') && document.querySelector('#username').reportValidity();
}

function enableLoginButton() {
    var $loginButton = $('.loginInputForm form button');
    $loginButton.attr('disabled', false);
    $loginButton.html('Login');
}

function disableLoginButton() {
    var $loginButton = $('.loginInputForm form button');
    $loginButton.attr('disabled', true);
    $loginButton.html('Logging In');
}

function slideUpTransactionPage() {
    var $transactionContainer = $('#transactionContainer');
    $transactionContainer.addClass('slideUp');
    $transactionContainer.removeClass('slideDown');
}

function showTransactionPage() {
    slideUpTransactionPage();
    populateTransactions();
}

function slideDownTransactionPage() {
    var $transactionContainer = $('#transactionContainer');
    $transactionContainer.addClass('slideDown');
    $transactionContainer.removeClass('slideUp');
}

function hideTransactionPage() {
    slideDownTransactionPage();
}

function reportTransactionFormValidity(merchantNameVal, dateVal, amountVal) {
    document.querySelector('#merchantName').setCustomValidity('Enter a valid merchant name');
    document.querySelector('#amount').setCustomValidity('Enter a valid amount');
    document.querySelector('#date').setCustomValidity('Enter a valid date');
    (dateVal == '') && document.querySelector('#date').reportValidity();
    checkIfAmountIsInvalid(amountVal) && document.querySelector('#amount').reportValidity();
    (merchantNameVal == '') && document.querySelector('#merchantName').reportValidity();
}

function disableTransactionButton() {
    var $transactionButton = $('.transactionInputForm button');
    $transactionButton.attr('disabled', true);
    $transactionButton.html('Adding Transaction');
}

function enableTransactionButton() {
    var $transactionButton = $('.transactionInputForm button');
    $transactionButton.attr('disabled', false);
    $transactionButton.html('Add');
}

function showTransactionFormError(message) {
    $error = $('.transactionInputForm .error');
    $error.removeClass('hide');
    $error.find('span').html(message);
}

function clearTransactionFields() {
    $('#merchantName').val('');
    $('#amount').val('');
    $('#date').val('');
    $('.transactionInputForm #amountCreditSwitch').prop('checked', false);
}

function showTransactionContainerElements($transactionContainer) {
    $transactionContainer.find('#transactionTable').removeClass('hide');
    $transactionContainer.find('#transactionForm').removeClass('hide');
    $transactionContainer.find('.spinner-div').toggleClass('hide');
}

function hideTransactionContainerElements($transactionContainer) {
    $transactionContainer.find('.error').addClass('hide');
    $transactionContainer.find('#transactionTable').addClass('hide');
    $transactionContainer.find('#transactionForm').addClass('hide');
    $transactionContainer.find('.spinner-div').toggleClass('hide');
    $transactionContainer.find('#transactionTableBody').html('');
}

function showTransactionPageError(message) {
    var $transactionContainer = $('#transactionContainer');
    var $errorDiv = $transactionContainer.find('> .error');
    $errorDiv.find('span').html(message);
    $errorDiv.removeClass('hide');
    $transactionContainer.find('.spinner-div').toggleClass('hide');
}

function openNav() {
    $('#transactionForm').addClass('opened');
}
  
function closeNav() {
    $('#transactionForm').removeClass('opened');
}

// Callback Functions

function authenticateUserSuccessCallback(response) {
    enableLoginButton();
    try {
        response = JSON.parse(response.substring(0, response.length-1));
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
    } catch (ex) {
        var message = 'An error occured on the server';
        showLoginError(message);
    }
}

function authenticateUserErrorCallback(XMLHttpRequest, textStatus, errorThrown) {
    enableLoginButton();
    var message = 'An error occured on the server';
    showLoginError(message);
}

function populateTransactionsSuccessCallback(response) {
    try {
        var $transactionContainer = $('#transactionContainer');
        response = JSON.parse(response.substring(0, response.length-1));
        if(response.jsonCode != 200) {
            var message = '';
            switch(response.jsonCode) {
                case 407:
                    message = 'AuthToken expired. Make sure you\'re getting a new authToken from the response of each request or log in again.';
                    break;
                default:
                    message = 'Unable to fetch transactions';
                    break;
            }
            showTransactionPageError(message);
        } else {
            showTransactionContainerElements($transactionContainer);
            var transactionList = response.transactionList;
            var tableBodyData = document.createDocumentFragment();
            var tableBodyElement = document.getElementById('transactionTableBody');
            for (var index=0; index<transactionList.length; index++) {                    
                tableBodyData.appendChild(getTableRow(transactionList[index])); //We use the nodes approach here as it's the fastest way to populate the HTML Document with a large dataset
            }
            tableBodyElement.appendChild(tableBodyData);
            setBalance();
        }
    } catch(ex) {
        var message = 'Unable to fetch transactions';
        showTransactionPageError(message);
    }
}

function populateTransactionsErrorCallback(XMLHttpRequest, textStatus, errorThrown) {
    var message = 'Server error';
    showTransactionPageError(message);
}

function createTransactionSuccessCallback(response, merchant, amount, date) {
    enableTransactionButton();
    try {
        response = JSON.parse(response.substring(0, response.length-1));
        if(response['jsonCode'] != 200) {
            var message = '';
            switch(response.jsonCode) {
                case 407:
                    message = 'AuthToken expired. Make sure you\'re getting a new authToken from the response of each request or log in again.';
                    break;
                default:
                    message = 'Unable to add transaction.';
                    break;
            }
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
    } catch(ex) {
        var message = 'An error occured on the server';
        showTransactionFormError(message);
    }
}

function createTransactionErrorCallback(XMLHttpRequest, textStatus, errorThrown) {
    enableTransactionButton();
    var message = 'An error occured on the server';
    showTransactionFormError(message);
}
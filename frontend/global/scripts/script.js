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
    var passVal = window.btoa($password.val().trim());
    $username.val(userVal);
    $password.val(passVal);
    if(userVal=='' || passVal=='') {
        document.querySelector('#password').setCustomValidity('Enter a valid password');
        document.querySelector('#username').setCustomValidity('Enter a valid username');
        (passVal == '') && document.querySelector('#password').reportValidity();
        (userVal == '') && document.querySelector('#username').reportValidity();
    } else {
        clearLoginFormValidation('username') && clearLoginFormValidation('password');
        authenticateUser(userVal, passVal);
    }
}

function clearLoginFormValidation(element) {
    document.querySelector(`#${element}`).setCustomValidity('');
}

function clearTransactionFormValidation(element) {
    document.querySelector(`#${element}`).setCustomValidity('');
}

function cleanLoginData(element) {
    var $HTMLElement = $(`#${element}`);
    var value = $HTMLElement.val().trim();
    $HTMLElement.val(value);
}

function cleanTransactionData(element) {
    var $HTMLElement = $(`#${element}`);
    var value = $HTMLElement.val().trim();
    $HTMLElement.val(value);
}

function authenticateUser(username, password) {
    $loginButton = $('.loginForm form button');
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
                        }
                        showLoginError(message);
                    } else {
                        userData = response;
                        sessionStorage.setItem('authToken', response['authToken']);
                        hideLoginPage();
                    }
                },
        error: (XMLHttpRequest, textStatus, errorThrown) => { 
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
                    console.log(response);
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
    $balanceElement = $('#transactionTable #balance span');
    if(balance<0) {
        $balanceElement.addClass('debt');
    } else {
        $balanceElement.removeClass('debt');
    }
    balance = getPrettyNumber(balance);
    if (!balance.split('.')[1]) {
        balance += '.00'
    }
    $balanceElement.html(`\$ ${balance}`);
} 

function showTransactionPageError() {
    $('#transactionContainer .error').removeClass('hide');
}

function getTableRow(item) {
    var row;
    row = document.createElement("tr");
    tableData = document.createElement("td");
    tableData.appendChild(document.createTextNode(getPrettyDate(item.inserted)));
    row.appendChild(tableData);
    tableData = document.createElement("td");
    tableData.appendChild(document.createTextNode(item.merchant));
    row.appendChild(tableData);
    tableData = document.createElement("td");
    amount = parseInt(item.convertedAmount);
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

}

function logout() {
    myStorage.clear();
    showLoginPage();
}
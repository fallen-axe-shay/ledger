const myStorage = window.sessionStorage;

(function() {
    let authToken = sessionStorage.getItem('authToken');
    if(authToken) {
        hideLoginPage(true);
    }
}());

function login() {
    var $username = $('#username');
    var $password = $('#password');
    var userVal = $username.val().trim();
    var passVal = $password.val().trim();
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
    document.querySelector('#password').setCustomValidity('') && document.querySelector('#username').setCustomValidity('');
}

function cleanLoginData(element) {
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
                        showLoginError(false);
                    } else {
                        console.log(response);
                        sessionStorage.setItem('authToken', response['authToken']);
                        hideLoginPage(false);
                        populateTransactions(response);
                    }
                },
        error: (XMLHttpRequest, textStatus, errorThrown) => { 
                    showLoginError(true);
                }  
    });
}

function showLoginError(serverError) {
    $error = $('#loginContent .loginForm .error');
    $error.removeClass('hide');
    $error.find('span').html(serverError ? 'An error occured on the server' : 'Invalid username or password');
    setTimeout(()=> {
        $error.addClass('hide');
    }, 5000);
}

function hideLoginPage(immediate) {
    setTimeout(()=> {
        $('#loginContent').addClass('hide');
    }, immediate ? 0 : 2000);
    $('#loginContent').css({'transition': '1s', 'height': '0px'});
    $('#loginContent *').addClass('fadeOut');
    showTransactionPage();
}

function showTransactionPage() {
    $('#transactionContainer').removeClass('hide');
}

function populateTransactions(data) {

}
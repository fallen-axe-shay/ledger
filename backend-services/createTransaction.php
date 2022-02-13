<?php
    include 'global/env-var/envDataBackend.php'; //Get Environment Variables
    $data = [
        'authToken' => $_POST['authToken'],
        'created' => $_POST['date'],
        'amount' => $_POST['amount'],
        'merchant' => $_POST['merchant']
    ]; //Data to send to API
    $curl = curl_init($ENV_DATA['expensifyBaseAPI'].$ENV_DATA['createTransactionEndpoint']);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    $result = curl_exec($curl);
    curl_close($curl);
    echo $result; //Send result back
?>
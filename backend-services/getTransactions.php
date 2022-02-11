<?php
    include 'global/env-var/envDataBackend.php';
    $data = [
        'authToken' => $_GET['authToken'],
        'returnValueList' => 'transactionList'
    ];
    if(!empty($_GET['startDate'])) {
        $data['startDate'] = $_GET['startDate'];
    }
    if(!empty($_GET['endDate'])) {
        $data['endDate'] = $_GET['endDate'];
    }
    $curl = curl_init($ENV_DATA['expensifyBaseAPI'].$ENV_DATA['getTransactionsAPIEndpoint']);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    $result = curl_exec($curl);
    curl_close($curl);
    echo $result;
?>
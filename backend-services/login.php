<?php
    include 'global/env-var/envDataBackend.php';
    $data = [
        'partnerName' => $ENV_DATA['partnerName'],
        'partnerPassword' => $ENV_DATA['partnerPassword'],
        'partnerUserID' => $_POST["username"],
        'partnerUserSecret' => $_POST["password"]
    ];
    $curl = curl_init($ENV_DATA['expensifyBaseAPI'].$ENV_DATA['loginAPIEndpoint']);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    $result = curl_exec($curl);
    curl_close($curl);
    echo $result;
?>
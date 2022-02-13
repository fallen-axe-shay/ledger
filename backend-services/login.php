<?php
    include 'global/env-var/envDataBackend.php'; //Get Environment Variables
    $data = [
        'partnerName' => $ENV_DATA['partnerName'],
        'partnerPassword' => $ENV_DATA['partnerPassword'],
        'partnerUserID' => $_POST["username"],
        'partnerUserSecret' => urldecode(base64_decode($_POST['password'])) //Convert from base64 to plaintext
    ]; //Data to send to API
    $curl = curl_init($ENV_DATA['expensifyBaseAPI'].$ENV_DATA['loginAPIEndpoint']);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    $result = curl_exec($curl);
    curl_close($curl);
    echo $result; //Send result back
?>
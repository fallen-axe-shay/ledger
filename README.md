# Expensify Take-Home Challenge

<!-- 1) Find someplace to host a basic PHP environment. Some suggested services are AWS, Heroku, Cloud9, etc. Make your application publicly available so that we can try it out, and remember to remove it once your challenge review is done. Do not host your source code on any online repo (public or private).

2) Building on top of the files we give you, comprise a single AJAX-ified application that doesn’t use any page refreshes. Do not use any MVCs or API libraries. You should create a simple PHP API proxy file to get around any CORS issues with calling our API. You can access the files here: 
https://gist.github.com/botify/3d44b292fb7d16e5ee0d6992cf554833 
CSS libraries, like Bootstrap or Material UI are allowed, but we really want to see what your raw CSS skills are and these frameworks can cover up your natural talent. We would rather get something that doesn’t look good which demonstrates your skill rather than something that looks polished with Bootstrap (which just about anyone can implement). Use your best judgment here.

3) First, when loaded, if there is no "authToken" cookie set, the page should show a simple username/password form (if it is already set, the user is already logged in; skip down to 6). Don’t worry about securing the data in the cookie for the purposes of this application.

4) When you click "Sign In" use AJAX to call the “Authenticate” endpoint on the Expensify API. Details follow:
https://gist.github.com/botify/0cb8498fcae696b5d507ade2bae3b78a 
These are the API credentials (should be kept relatively secure in your code):
partnerName: applicant
partnerPassword: d7c3119c6cdab02d68d9

These are the account credentials entered by the person in the login form:
partnerUserID: <email address>
partnerUserSecret: <password>

Feel free to test using this account (but read the value from the form, don't hard-code these values into the page at all):
email: expensifytest@mailinator.com
password: hire_me

5) If “Authenticate” fails, show a meaningful error message and let the user try again.

6) Upon success, call the "Get" API endpoint to get a list of all transactions in the account. Again, do this all via AJAX, without any page loads. Download the entire data set. When retrieving the transactions from the API, don't try to paginate or reduce the results.

7) With the "Get" results, assemble and display a table showing all transactions in the account. Make it pretty enough that real live users could reasonably understand it and display whatever fields you feel would be the most helpful for a user of your app. It is a large dataset and we want to see your abilities at dealing with it in a performant way.

8) Next, show a form that prompts the user for a date, merchant name, and amount. When the user clicks "Add" it calls the "CreateTransaction" API endpoint to create the new transaction. The new transaction is then immediately added to the table.

9) Finally to prove that "CreateTransaction" worked, let the user refresh the page. the authToken should be set, so it should just skip right to (6), redownload the latest transactions, and show the full table.

10) When done, please email your code for review as a Zip file as well as a detailed write-up of how long it took for each task, instructions on how we can access your hosted solution, what problems you encountered, how you overcame them, etc. Please bundle up your code as a ZIP archive before uploading it. Please make sure to send the above to me and the engineer originally cc'd here. If your challenge is too large to upload via email, please upload to Google Drive and share with us via private link. -->

## Time Measurements
1. Hosting a PHP environment on Heroku - 1 hour

## References
1. [Markdown Reference](https://www.markdownguide.org/) 
2. [Creating a Heroku server to deploy PHP ](https://www.doabledanny.com/Deploy-PHP-And-MySQL-to-Heroku)
3. [PHP Documentation](https://www.php.net/manual/en/)
4. [Heroku Documentation](https://devcenter.heroku.com/categories/reference)
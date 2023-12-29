# welcome
## Getting Started

> This app contains connection strings and secrets that have been hidden deliberately, However, feel free to clone this repository, default values have been given to to the environment variables.
### Clone or download this repository

```sh
git clone https://github.com/abhaybhatia01/mongoAuth.git
```

### Install dependencies

```sh
npm install
```


### start the server 
It creates a new db by default in your local mongoDB .
If you want to use mongoDB atlas you need to put connection string in the env file.
```sh
npm run start
```


## API Documentation:
default port
```sh
http:localhost:3000/
```

   1. Register User:
      - Endpoint: POST /register
      - Description: Creates a new user account.
      - Request Body:
        - email: string (required) - User's email address.
        - password: string (required) - User's password.
        - name: string (optional) - User's name.
      - Response:
        - 200 OK: User registration successful. Returns the session token.
        - 400 Bad Request: Invalid input values. Returns an error message.
        - 409 Conflict: User already exists. Returns an error message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   2. Log In User:
      - Endpoint: POST /login
      - Description: Authenticates a user and creates a session.
      - Request Body:
        - email: string (required) - User's email address.
        - password: string (required) - User's password.
      - Response:
        - 200 OK: User login successful. Returns the session token.
        - 400 Bad Request: Invalid input values. Returns an error message.
        - 401 Unauthorized: Invalid credentials. Returns an error message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   3. Token Refresh:
      - Endpoint: POST /token-refresh
      - Description: Refreshes an expired session token.
      - Request Body:
        - oldToken: string (required) - Expired session token.
      - Response:
        - 200 OK: Token refreshed successfully. Returns the new session token.
        - 401 Unauthorized: No refresh token provided or invalid refresh token. Returns an error message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   4. Log Out User:
      - Endpoint: POST /logout
      - Description: Logs out a user by deleting the session.
      - Request Headers:
        - Authorization: string (required) - Session token.
      - Response:
        - 200 OK: Logout successful. Returns a success message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   5. Protected Route:
      - Endpoint: GET /secret
      - Description: Accesses a protected route that requires authentication.
      - Request Headers:
        - Authorization: string (required) - Session token.
      - Response:
        - 200 OK: Access granted. Returns a success message and user email.
        - 401 Unauthorized: Invalid or expired session token. Returns an error message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   ### Authentication Flow:
      1. Register a new user by sending a POST request to /register with the required information (email and password). If successful, you will receive a session token.
      2. Log in with an existing user by sending a POST request to /login with the email and password. If successful, you will receive a session token.
      3. To access protected routes, include the session token in the Authorization header of the request.
      4. To refresh an expired session token, send a POST request to /token-refresh with the oldToken (expired session token). If successful, you will receive a new session token.
      5. To log out, send a POST request to /logout with the session token in the Authorization header. You will receive a success message.
      6. Access the protected route /secret by sending a GET request with the session token in the Authorization header. If successful, you will receive a success message and user email.

## Testing 
```sh
npm run test
```
   ![image](https://github.com/abhaybhatia01/mongoAuth/assets/85993083/89b80fdd-d08f-430a-a198-25558b05fcf3)
   
   ![image](https://github.com/abhaybhatia01/mongoAuth/assets/85993083/fdcd3566-6b4f-4580-b535-5beb791a5c90)
   
   
   The tests validate the following aspects mentioned in the API documentation.
   ## Integration testing 
   1. User Registration: 
      - Tests are performed to check for errors when creating a user, such as missing email, invalid email format, missing password, password less than 8 characters, and password not meeting the required criteria. 
      - A test is also included to register a new user successfully. 
      - Another test checks for duplicate user creation. 
    
   2. User Login: 
      - Similar to user registration, tests are performed to check for errors when logging in a user, such as missing email, invalid email format, missing password, password less than 8 characters, and password not meeting the required criteria. 
      - A test is also included to check for incorrect password during login. 
      - Finally, a test verifies successful user login. 
    
   3. Session Management: 
      - Tests are performed to check the functionality of token refresh, accessing a protected route with a valid token, logging out a user, and handling session expiration. 
   
   ## Unit testing 
   1.  authenticate  Middleware: 
      - Tests are performed to check the behavior of the  authenticate  middleware function. 
      - The middleware is tested for scenarios where no token is provided, an invalid token is provided, an expired token is provided, and a valid token is provided. 
      - The tests verify the expected status codes, response messages, and whether the  next  function is called appropriately. 
   
   2. Helper Functions: 
      - Tests are performed for several helper functions used in the authentication system. 
      - The  generateToken  function is tested to ensure it generates a token with a valid payload. 
      - The  refreshToken  function is tested for scenarios where no token is provided and when a valid token is provided. The tests verify the validity of the returned object, the presence of a new token, and the message indicating a new token was generated. 
      - The  verifyEmail  function is tested for scenarios where the email is valid, not provided, or invalid. The tests verify the validity of the returned object and the appropriate error messages. 
      - The  VerifyPassword  function is tested for scenarios where the password is valid, not provided, less than 8 characters, or not strong enough. The tests verify the validity of the returned object and the appropriate error messages. 


Overall, the tests provide good coverage of the API endpoints and their expected behavior based on the API documentation.
## What can be improved:
      1. custom error handeling class can be defined so we can trow our custom errors and handle them accordingly.
      2. make a heigher order fuction which will take a function and wrap it with try and catch. this way we don't have to pur try catch in every controller.
      3. we can add content policy when we deploy to production. so that only scripts which we allow will get to run in production.
   

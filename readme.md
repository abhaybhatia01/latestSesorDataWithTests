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
      - Endpoint: POST users/register
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
      - Endpoint: POST users/login
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
      - Endpoint: POST users/token-refresh
      - Description: Refreshes an expired session token.
      - Request Body:
        - oldToken: string (required) - Expired session token.
      - Response:
        - 200 OK: Token refreshed successfully. Returns the new session token.
        - 401 Unauthorized: No refresh token provided or invalid refresh token. Returns an error message.
        - 500 Internal Server Error: An unexpected error occurred.
   
   4. Log Out User:
      - Endpoint: POST users/logout
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

   

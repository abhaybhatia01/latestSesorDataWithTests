const assert = require("assert");
const request = require("supertest");
const app = require("../index");


describe("user testing",() => {
    let token; // To store the session token for authenticated requests
    const email = "test" + Math.floor(Math.random() * 1000) + "@example.com"; // random email generated
    const password = "Password123"

    describe("Authentication System", () => {

        // Test user registration
        describe("User Registration", async () => {
            it("Should give error for not having email while creating user",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    password: 'Pwd123',
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'email missing');

            })
            it("Should give error for not having valid email format",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    email: "test@example",
                    password: 'Pwd123',
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Invalid email');

            })
            it("should give error for not having password while creating user",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    email: email,
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'password missing');

            })
            it("should give error for password less than 8 charactor",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    email: email,
                    password: 'Pwd123',
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Password should have a minimum length of 8 characters');

            })
            it("pwd should contain at least one uppercase letter, one lowercase letter, and one digit.",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    email: email,
                    password: 'dskfllwd123',
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Password should contain at least one uppercase letter, one lowercase letter, and one digit');

            })
            it("should register a new user", async function () {
                const response = await request(app)
                    .post("/users/register")
                    .send({
                        email: email,
                        password: password,
                        name: "Test User",
                    });
                assert.strictEqual(response.status, 200);
                assert.strictEqual(typeof response.body.token, "string");
                // token = response.body.token;
            });
            it("should not create duplicate user",async function(){
                const response = await request(app)
                .post('/users/register')
                .send({
                    email: email,
                    password: password,
                    name: 'Test User'
                })
                assert.strictEqual(response.status, 409);
                assert.strictEqual(response.body.message, 'User already exists');

            })
        
        
        });

        // Test user login
        describe('User Login , Session and Deletion', () => {
            it("Should give error for not having email while logging in user",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    password: 'Pwd123',
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'email missing');
            })
            it("Should give error for not having valid email format",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    email: "test@example",
                    password: 'Pwd123',
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Invalid email');

            })
            it("should give error for not having password while logging in user",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    email: email,
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'password missing');
            })
            it("should give error for password less than 8 charactor",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    email: email,
                    password: 'Pwd123',
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Password should have a minimum length of 8 characters');
            })
            it("pwd should contain at least one uppercase letter, one lowercase letter, and one digit",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    email: email,
                    password: 'dskfllwd123',
                })
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.body.message, 'Password should contain at least one uppercase letter, one lowercase letter, and one digit');
            })
            it("should not login for wrong password",async function(){
                const response = await request(app)
                .post('/users/login')
                .send({
                    email: email,
                    password: 'Wrong123',
                })
                assert.strictEqual(response.status, 401);
                assert.strictEqual(response.body.message, 'Invalid credentials');
            })
            it("should login user for correct email and password", async function () {
                const response = await request(app)
                    .post("/users/login")
                    .send({
                        email: email,
                        password: password,
                    });
                assert.strictEqual( response.body.message, "Logged in");
                assert.strictEqual(response.status, 200);
                assert.strictEqual(typeof response.body.token, "string");

            });
            it("user should be able to login in multiple times", async function () {
                const response = await request(app)
                    .post("/users/login")
                    .send({
                        email: email,
                        password: password,
                    });
                assert.strictEqual( response.body.message, "Logged in");
                assert.strictEqual(response.status, 200);
                assert.strictEqual(typeof response.body.token, "string");
            });
     

       
            // it('should refresh token', async () => {
            //     console.log(token)
            //     const response = await request(app)
            //         .post('/users/token-refresh')
            //         .send({
            //             oldToken: token
            //         });
            //         assert.strictEqual(response.body.message, 'Token refreshed');
            //         assert.strictEqual(response.status, 200);
            //     token = response.body.token;
            // });


            // it('should be able to access /secret with token', async () => {
            //     const response = await request(app)
            //         .get('/users/secret')
            //         .set('Authorization', token);
            //     assert.strictEqual(response.status, 200);
            //     assert.strictEqual(response.body.route, '/secret');
            // });

            // it('should log out user and delete session', async () => {
            //     const response = await request(app)
            //     .post('/users/logout')
            //     .set('Authorization', token);
        
            //     assert.strictEqual(response.status, 200);
            //     assert.strictEqual(response.body.message, 'Logout successful');
            // });

            // it('should delete user', async () => {
            //     const response = await request(app)
            //         .post("/users/login")
            //         .send({
            //             email: email,
            //             password:password,
            //         });
            //     assert.strictEqual( response.body.message, "Logged in");
            //     assert.strictEqual(response.status, 200);
            //     assert.strictEqual(typeof response.body.token, "string");
            //     const thisToken = response.body.token;
            //     console.log(thisToken)
            //     const deleteResponse = await request(app)
            //     .delete("/users/delete")
            //     .set('Authorization', thisToken);
                
            //     assert.strictEqual(deleteResponse.status, 200);
            //     assert.strictEqual( deleteResponse.body.message, "Logout and delete successful");      
            // });
        });
    });
})
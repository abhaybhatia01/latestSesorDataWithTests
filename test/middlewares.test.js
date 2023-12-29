
const Session = require("../models/Session");
const sinon = require('sinon');
const supertest = require("supertest");
const app = require("../index");
const request = supertest(app)
const expect = require('chai').expect;

const { authenticate } = require('../middlewares');

describe("middlewares testing ",()=>{

    describe('authenticate middleware', () => {
        let email ="user3@gmail.com"
        let password = "Superman1"

        let req, res, next  ;
        let code = 0
        let data ={}
        let token

        beforeEach(() => {
        req = {
            headers: {},
            
        };
        res = {
            status: function(code) {
            this.statusCode = code;
            return this;
            },
            json: function(data) {
            this.responseData = data;
            },
        };
        next = sinon.spy();
        });
    
        afterEach(() => {
        req = null;
        res = null;
        next = null;
        });
        
        it('should login demo user', async () => {
        const response = await request
            .post('/users/login')
            .send({
                password: password,
                email: email
            })
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', "Logged in");
            expect(response.body).to.have.property('token')
            token = response.body.token;
        });
        
    
        it('should return 401 if no token is provided', async () => {
            await authenticate(req, res, next);

            expect(res.statusCode).to.equal(401);
            expect(res.responseData).to.have.property('message','No token provided');
            expect(next.called).to.equal(false);
        });
    
        it('should return 401 if token is invalid', async () => {
            req.headers.authorization = 'invalid-token';
        
            await authenticate(req, res, next);
        
            expect(res.statusCode).to.equal(401);
            expect(next.called).to.equal(false);
            expect(res.responseData).to.have.property('message','Invalid token');
        });
    
  
        
        it('should set sessionData in req and call next if token is valid', async () => {
            req.headers.authorization = token;
        
            await authenticate(req, res, next);

            expect(next.called).to.equal(true);
            expect(res.statusCode).to.equal(undefined);
            expect(res.responseData).to.equal(undefined);
            expect(req.sessionData).to.have.property( 'userId');
            expect(req.sessionData).to.have.property( 'email');
        });

        it('should return 401 if token is expired', async () => {
            req.headers.authorization = token;

            Session.findOne = async function() {
                return null;
            };
        
            await authenticate(req, res, next);
        
            expect(res.statusCode).to.equal(401);
            expect(next.called).to.equal(false);
            expect(res.responseData).to.have.property('message','Token expired, please login again');
        });
    });
})
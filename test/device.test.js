
const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../index.js'); 
const { describe } = require('mocha');

// import app from '../index.js'
// import  supertest from 'supertest' 
// import  {expect} from 'chai' 

// const chai = require.resolve('chai');
// const expect = chai.expect

describe('Device Controller Tests', () => {
  let request;
  let token;
  let email ="user3@gmail.com"
  let password = "Superman1"
  let devId = "INEM_DEMO"
  // this.timeout(10000);

  before(() => {
    request = supertest(app);
  });
  describe("Log in as demo user",()=>{
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
  })

  describe('GET /devices/getLatestSensorsData', () => {

    it('should respond with 200 and body to have latestdata as an Array', async () => {
      const response = await request
        .get(`/devices/getLatestSensorsData?devId=${devId}&precision=${2}`)
        .set('Authorization', token) 
        
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('message', 'device found');
      expect(response.body).to.have.property('latestData').that.is.an('array');
    });

    it('should respond with 400 and body to have message of "userId and devId are required"', async () => {
      const response = await request
        .get(`/devices/getLatestSensorsData`)
        .set('Authorization', token) 

      expect(response.status).to.equal(400);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('message', "userId and devId are required");
    });

    it('should respond with 404 it is case of wrong devId', async () => {
      const response = await request
        .get(`/devices/getLatestSensorsData?devId=${"invalid"}`)
        .set('Authorization', token) 

      expect(response.status).to.equal(404);
    });
  });

  describe('GET /devices/DownloadLatestSensorDataInExcel', () => {
    
    it('should respond with 200 and an Excel file', async () => {
      const response = await request
        .get(`/devices/DownloadLatestSensorDataInExcel?devId=${devId}&precision=2`)
        .set('Authorization', token) 

      expect(response.status).to.equal(200);
      expect(response.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

});

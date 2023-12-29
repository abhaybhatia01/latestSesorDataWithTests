const jwt = require('jsonwebtoken');
const Session = require("../models/Session");
const User = require("../models/User");
const secret = process.env.SECRET || "not-a-good-secret-key";
const assert = require('assert');
const sinon = require('sinon');

const {
  generateToken,
  refreshToken,
  verifyEmail,
  VerifyPassword,
} = require('../helpers');


describe("helper functions testing",() => {

  let token;
  const payload = { userId: 123 };

  describe("Helper functions",()=>{
    describe('generateToken', () => {
      it('should generate a token with valid payload', () => {
        token = generateToken(payload);
        assert.strictEqual(typeof token, 'string');
      });
    });

    describe('refreshToken', function() {
      const oldToken = jwt.sign({ userId: 'user123' }, secret, { expiresIn: '1h' });
    
      it('should return an object with isValid=false if no token is provided', async function() {
        const result = await refreshToken();
        assert.strictEqual(result.isValid, false);
      });
  

      it('should return an object with isValid=true and a new token if the token is valid', async function() {
        const result = await refreshToken(oldToken);
        assert.strictEqual(result.isValid, true);
        assert.ok(result.token);
      });

      it('should return an object with a message indicating that a new token was generated', async function() {
        const result = await refreshToken(oldToken);
        assert.strictEqual(result.message, 'new token generated');
      });
    });

    describe('verifyEmail', () => {
      it('should return isValid true if email is valid', () => {
        const email = 'test@example.com';
        const result = verifyEmail(email);
        assert.strictEqual(result.isValid, true);
      });

      it('should return isValid false and message "email missing" if email is not provided', () => {
        const result = verifyEmail();
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.message, 'email missing');
      });

      it('should return isValid false and message "Invalid email" if email is invalid', () => {
        const email = 'invalid-email';
        const result = verifyEmail(email);
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.message, 'Invalid email');
      });
    });

    describe('VerifyPassword', () => {
      it('should return isValid true if password is valid', () => {
        const password = 'Abcdefg1';
        const result = VerifyPassword(password);
        assert.strictEqual(result.isValid, true);
      });

      it('should return isValid false and message "password missing" if password is not provided', () => {
        const result = VerifyPassword();
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.message, 'password missing');
      });

      it('should return isValid false and message "Password should have a minimum length of 8 characters" if password length is less than 8', () => {
        const password = 'Abc1';
        const result = VerifyPassword(password);
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.message, 'Password should have a minimum length of 8 characters');
      });

      it('should return isValid false and message "Password should contain at least one uppercase letter, one lowercase letter, and one digit" if password is not strong enough', () => {
        const password = 'abcdefgh';
        const result = VerifyPassword(password);
        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.message, 'Password should contain at least one uppercase letter, one lowercase letter, and one digit');
      });
    });

  })
})
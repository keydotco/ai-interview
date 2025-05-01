/**
 * Unit tests for the authentication controller
 */

import { jest } from '@jest/globals';
import { authController } from '../../../src/controllers/authController.js';
import { userModel } from '../../../src/models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.spyOn(userModel, 'findByEmail').mockImplementation(() => jest.fn());
jest.spyOn(userModel, 'create').mockImplementation(() => jest.fn());
jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => jest.fn());
jest.spyOn(bcrypt, 'hash').mockImplementation(() => jest.fn());
jest.spyOn(bcrypt, 'compare').mockImplementation(() => jest.fn());
jest.spyOn(jwt, 'sign').mockImplementation(() => jest.fn());

describe('Auth Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = 'hashed_password';
      const newUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      };
      const token = 'jwt_token';
      
      req.body = userData;
      
      userModel.findByEmail.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      userModel.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue(token);
      
      await authController.register(req, res, next);
      
      expect(userModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(userModel.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: 'user'
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { name: 'Test User' }; // Missing email and password
      
      await authController.register(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Name, email, and password are required');
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = userData;
      
      userModel.findByEmail.mockResolvedValue({ id: '123', email: userData.email });
      
      await authController.register(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(409);
      expect(next.mock.calls[0][0].message).toBe('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'user'
      };
      const token = 'jwt_token';
      
      req.body = credentials;
      
      userModel.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);
      
      await authController.login(req, res, next);
      
      expect(userModel.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, user.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password
      
      await authController.login(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Email and password are required');
    });

    it('should return 401 if user not found', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = credentials;
      
      userModel.findByEmail.mockResolvedValue(null);
      
      await authController.login(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong_password'
      };
      
      const user = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password'
      };
      
      req.body = credentials;
      
      userModel.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);
      
      await authController.login(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
    });
  });
});

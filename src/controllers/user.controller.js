import validator from 'validator';
import createUserService from '../services/user.service.js';
import { ValidationError } from '../errors/error.types.js';

const createUserController = ({ userService = createUserService() } = {}) => {
  const register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new ValidationError('Name, email and password are required');
      }

      if (!validator.isEmail(email)) {
        throw new ValidationError('Invalid email format');
      }

      const user = await userService.register({ name, email, password });

      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const { user, token } = await userService.login({ email, password });

      res.status(200).json({ data: user, token });
    } catch (error) {
      next(error);
    }
  };

  const getMe = async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.id);

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  const getUsers = async (req, res, next) => {
    try {
      const { count, users } = await userService.getUsersAll();

      res.status(200).json({ data: { count, users } });
    } catch (error) {
      next(error);
    }
  };

  const getUser = async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.params.id);

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  const updateUser = async (req, res, next) => {
    try {
      const user = await userService.updateUser(
        req.params.id,
        req.body,
        req.user,
      );

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  const deleteUser = async (req, res, next) => {
    try {
      await userService.deleteUser(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    register,
    login,
    getMe,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
  };
};

export default createUserController;

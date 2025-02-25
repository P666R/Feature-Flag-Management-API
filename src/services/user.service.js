import { systemLogs as logger } from '../utils/logger.js';
import createUserRepository from '../repositories/user.repository.js';
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../errors/error.types.js';
import { ROLES } from '../constants/index.js';

const createUserService = ({
  userRepository = createUserRepository(),
} = {}) => {
  const register = async ({ name, email, password }) => {
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ForbiddenError('Email already in use');
    }

    const user = await userRepository.createUser({
      name,
      email,
      password,
    });

    logger.info('User registered', { email });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  const login = async ({ email, password }) => {
    const user = await userRepository.findUserByEmail(email);

    if (!user || !(await user.matchPassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = user.getSignedJwtToken();
    logger.info('User logged in', { email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  };

  const getUsersAll = async () => {
    const users = await userRepository.findUsersAll();

    return {
      count: users.length,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  };

  const getUserById = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found', { id });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  const updateUser = async (id, data, requestingUser) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found', { id });
    }

    if (requestingUser.id !== id && requestingUser.role !== ROLES.ADMIN) {
      throw new ForbiddenError('You are not authorized to update this user');
    }

    const updatedUser = await userRepository.updateUser(id, data);
    logger.info('User updated', { id });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  };

  const deleteUser = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found', { id });
    }

    await userRepository.deleteUser(id);
    logger.info('User deleted', { id });
  };

  return {
    register,
    login,
    getUsersAll,
    getUserById,
    updateUser,
    deleteUser,
  };
};

export default createUserService;

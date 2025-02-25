import { systemLogs as logger } from '../utils/logger.js';
import createUserModel from '../models/user.model.js';

const createUserRepository = ({ User = createUserModel() } = {}) => {
  const createUser = async (data) => {
    try {
      const user = await User.create(data);
      logger.info('User created in database', { email: data.email });
      return user;
    } catch (error) {
      logger.error('Failed to create user in database', {
        error,
        email: data.email,
      });
      throw error;
    }
  };

  const findUsersAll = async () => {
    return await User.find().select('-_id -__v');
  };

  const findUserById = async (id) => {
    return await User.findOne({ id }).select('-_id -__v');
  };

  const findUserByEmail = async (email) => {
    return await User.findOne({ email }).select('+password -_id -__v');
  };

  const updateUser = async (id, data) => {
    try {
      const user = await User.findOneAndUpdate({ id }, data, {
        new: true,
        runValidators: true,
      }).select('-_id -__v');
      logger.info('User updated in database', { id });
      return user;
    } catch (error) {
      logger.error('Failed to update user in database', {
        error,
        id,
      });
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await User.findOneAndDelete({ id });
      logger.info('User deleted in database', { id });
      return null;
    } catch (error) {
      logger.error('Failed to delete user in database', {
        error,
        id,
      });
      throw error;
    }
  };

  return {
    createUser,
    findUsersAll,
    findUserById,
    findUserByEmail,
    updateUser,
    deleteUser,
  };
};

export default createUserRepository;

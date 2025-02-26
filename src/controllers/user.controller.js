import createUserService from '../services/user.service.js';

const createUserController = ({ userService = createUserService() } = {}) => {
  const register = async (req, res, next) => {
    try {
      const user = await userService.register(req.body);

      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  const login = async (req, res, next) => {
    try {
      const { user, token } = await userService.login(req.body);

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

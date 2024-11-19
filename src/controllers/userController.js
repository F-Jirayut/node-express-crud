const bcrypt = require('bcrypt');
const User = require('../models/User');
const { getFromRedis, setToRedis, deleteFromRedis } = require('../helpers/redisHelper');

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;

    // if (!username) {
    //   return res.status(400).json({ error: 'Username is required' });
    // }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ 
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      password: hashedPassword,
    });

    await deleteFromRedis('all_users');

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const cacheKey = 'all_users';
    let users = await getFromRedis(cacheKey);

    if (!users) {
      users = await User.findAll();
      await setToRedis(cacheKey, users);
    }

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const cacheKey = `user_${req.params.id}`;
    let user = await getFromRedis(cacheKey);

    if (!user) {
      user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await setToRedis(cacheKey, user);
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, password, username } = req.body;

    let updatedData = { firstName, lastName, email, username};
    // if (username) {
    //   updatedData.username = username;
    // }

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updatedData.password = hashedPassword;
    }

    await user.update(updatedData);

    await deleteFromRedis('all_users');
    await deleteFromRedis(`user_${req.params.id}`);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    await deleteFromRedis('all_users');
    await deleteFromRedis(`user_${req.params.id}`);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

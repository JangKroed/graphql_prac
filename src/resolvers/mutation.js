const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');

const AUTH_ERROR = 'Error signing in';

module.exports = {
  newNote: async (_, args, { models }) => {
    let noteValue = {
      content: args.content,
      author: 'Adam Scott'
    };
    return await models.Note.create(noteValue);
  },
  deleteNote: async (_, { id }, { models }) => {
    try {
      const result = await models.Note.findOneAndRemove({ _id: id });

      if (!result) {
        throw new Error('error!');
      }

      return true;
    } catch (_) {
      return false;
    }
  },
  updateNote: async (_, { content, id }, { models }) => {
    const form = [{ _id: id }, { $set: { content } }, { new: true }];
    return await models.Note.findOneAndUpdate(...form);
  },
  signUp: async (_, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();

    const hashed = await bcrypt.hash(password, 10);

    const avatar = gravatar(email);
    try {
      const form = { username, email, avatar, password: hashed };
      const user = await models.User.create(form);

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (error) {
      console.log(error);
      throw new Error('Error creating account');
    }
  },
  signIn: async (_, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
      throw new AuthenticationError(AUTH_ERROR);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError(AUTH_ERROR);
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

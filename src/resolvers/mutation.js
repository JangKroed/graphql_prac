const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');

const AUTH_ERROR = 'Error signing in';

module.exports = {
  newNote: async (_, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }

    let noteValue = {
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    };
    return await models.Note.create(noteValue);
  },
  deleteNote: async (_, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }

    try {
      if (!note) {
        throw new Error('error!');
      }

      await note.remove();

      return true;
    } catch (_) {
      return false;
    }
  },
  updateNote: async (_, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }

    const form = [{ _id: id }, { $set: { content } }, { new: true }];
    return await models.Note.findOneAndUpdate(...form);
  },
  toggleFavorite: async (_, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: { favoritedBy: mongoose.Types.ObjectId(user.id) },
          $inc: { favoriteCount: -1 }
        },
        { new: true }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: { favoritedBy: mongoose.Types.ObjectId(user.id) },
          $inc: { favoriteCount: 1 }
        },
        { new: true }
      );
    }
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

module.exports = {
  notes: async (parent, _2, { models }) => {
    return await models.Note.find();
  },
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },
  user: async (parent, { username }, { models }) => {
    return await models.User.findOne({ username });
  },
  users: async (parent, _2, { models }) => {
    return await models.User.find({});
  },
  me: async (parent, _2, { models, user }) => {
    return await models.User.findById(user.id);
  }
};

module.exports = {
  notes: async (_1, _2, { models }) => {
    return await models.Note.find();
  },
  note: async (_, args, { models }) => {
    return await models.Note.findById(args.id);
  }
};

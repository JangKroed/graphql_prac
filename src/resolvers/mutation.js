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
  }
};

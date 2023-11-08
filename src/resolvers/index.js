const { GraphQLDateTime } = require('graphql-iso-date');

module.exports = {
  Query: require('./query'),
  Mutation: require('./mutation'),
  User: require('./user'),
  Note: require('./note'),
  DateTime: GraphQLDateTime
};

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();
const db = require('./db');
const models = require('./models');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  },
});

server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen({ port }, () => {
  db.connect(DB_HOST);

  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`,
  );
});

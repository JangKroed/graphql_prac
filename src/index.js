const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
require('dotenv').config();
const db = require('./db');
const models = require('./models');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Sesstion invalid');
    }
  }
};

const server = new ApolloServer({
  typeDefs: require('./schema'),
  resolvers: require('./resolvers'),
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);

    console.log(user);

    return { models, user };
  }
});

server.applyMiddleware({ app, path: '/api' });

app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen({ port }, () => {
  db.connect(DB_HOST);

  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  );
});

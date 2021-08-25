const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUser(username) {
  return users.find((user) => user.username === username);
}

function getTodo(user, todoId) {
  return user.todos.find((todo) => todo.id === todoId);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const accountExists = getUser(username);
  if (!accountExists) {
    return response.status(400).json({ error: "Account not found!" })
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return response.status(400).json({error: "User already exists!"});
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = getUser(username);
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = getUser(username);

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = getUser(username);
  const todo = getTodo(user, id);

  if(!todo) {
    return response.status(404).json({ error: 'ToDo not found!' });
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = getUser(username);
  const todo = getTodo(user, id);

  if(!todo) {
    return response.status(404).json({ error: 'ToDo not found!' });
  }

  todo.done = true;
  
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = getUser(username);
  const todo = getTodo(user, id);

  if(!todo) {
    return response.status(404).json({ error: 'ToDo not found!' });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;

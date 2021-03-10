const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  if (!username) {
    return response.status(401).json({ error: 'Not allowed for anonymous users' });
  }

  const existsUser = users.some(user => user.username === username);

  if (!existsUser) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  request.user = {
    username,
  };

  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const user = users.find(user => user.username === username);

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  const { username } = request.user;

  const user = users.find(user => user.username === username);

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request.user;

  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: "todo not exists" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: "todo not exists" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const existsTodo = user.todos.some(todo => todo.id === todoId);

  if (!existsTodo) {
    return response.status(404).json({ error: "todo not exists" });
  }

  const newTodos = user.todos.filter(todo => todo.id !== todoId);

  user.todos = newTodos;

  return response.status(204).send();

});

module.exports = app;
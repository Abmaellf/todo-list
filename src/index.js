const express = require('express');

const cors = require('cors');

const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  //(user) o parentese é opcional
  // => { validação1} para uma unica validação não é preciso ter as chaves e pode ocorrer erros se houver
  const user = users.find(user => user.username === username);

  //Validando o usuário
  if (!user) {
    return response.status(400).json({ error: "User not found" })
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const usersAlredyExists = users.some(
    (user) => user.username === username
  )
  if (usersAlredyExists) {
    return response.status(400).json({
      error: "User already exists "
    })
  }



  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []

  });

  const user = users.find((user) => user.username === username);
  return response.status(201).json(user);

});




app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  return response.json(user.todos);


});


app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;

  const { user } = request;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  }

  user.todos.push(todoOperation);

  return response.status(201).send(todoOperation);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Not found todo" })
  }


  todo.title = title;

  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // const { done } = request.body;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Not found" })
  }

  todo.done = true;

  return response.json(todo);


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Not found" })
  }

  user.todos.pop(todo);

  return response.status(204).json(user.todos);


});

module.exports = app;
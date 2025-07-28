const express = require('express');
const router = express.Router();
const todosController = require('../controller/todosController');

router.get('/', todosController.getAllTodos);
router.post('/add', todosController.addTodo);
router.post('/toggle/:id', todosController.toggleTodo);
router.post('/delete/:id', todosController.deleteTodo);
router.post('/clear', todosController.clearAll);

module.exports = router;
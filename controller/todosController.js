let todos = [];

exports.getAllTodos = (req, res) => {
    res.render('index', {
        todos,
        taskCount: todos.length,
        completedCount: todos.filter(t => t.completed).length
    });
};

exports.addTodo = (req, res) => {
    const newTodo = {
        id: Date.now(),
        text: req.body.task,
        completed: false
    };
    todos.push(newTodo);
    res.redirect('/');
};

exports.toggleTodo = (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (todo) todo.completed = !todo.completed;
    res.redirect('/');
};

exports.deleteTodo = (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    res.redirect('/');
};

exports.clearAll = (req, res) => {
    todos = [];
    res.redirect('/');
};
import { useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
// Icons
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { FaCheckCircle } from "react-icons/fa";

function Home() {
  const [todos, setTodos] = useState([]);
  const [editid, seteditid] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchtask = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getTask');
        setTodos(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchtask();
  }, []);

  const HandleDone = async (id) => {
    try {
      const CurrentTodo = todos.find(todo => todo._id === id);
      const newDonestatus = !CurrentTodo.done;
      const response = await axios.put('http://localhost:3000/updateTask/' + id, { done: newDonestatus });
      location.reload();
      const updateTodo = todos.map(todo => {
        return todo._id === id ? { ...todo, done: newDonestatus } : todo;
      });
      setTodos(updateTodo);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete('http://localhost:3000/DeleteTask/' + id);
      location.reload();
      const DeleteToDo = todos.map(todo => {
        if (todo._id === id) {
          return response.data;
        }
        return todo;
      });
      setTodos(DeleteToDo);
    } catch (error) {
      console.log(error);
    }
  };

  const Edittod = (todo) => {
    seteditid(todo._id);
    setEditText(todo.task);
  };

  const SaveEdit = async (id) => {
    try {
      if (editText.trim() === '') {
        alert('Task cannot be empty');
        return;
      }
      await axios.put('http://localhost:3000/editTask/' + id, {
        task: editText
      });
      seteditid(null);
      setTodos(todos.map((todo) => {
        return todo._id === id ? { ...todo, task: editText } : todo;
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const CancelEdit = () => {
    seteditid(null);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">To Do List</h1>
      </header>
      
      <main className="home-main">
        <Create />
        
        <div className="todos-container">
          {todos.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-message">No Tasks Found</h2>
            </div>
          ) : (
            todos.map((todo, index) => (
              <div key={todo._id} className={`todo-item ${todo.done ? 'todo-item--completed' : ''}`}>
                {editid === todo._id ? (
                  <div className="todo-edit">
                    <input 
                      type="text" 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)}
                      className="todo-edit-input"
                    />
                    <div className="todo-edit-actions">
                      <button onClick={() => SaveEdit(todo._id)} className="btn btn--save">Save</button>
                      <button onClick={CancelEdit} className="btn btn--cancel">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-content">
                    <div className="todo-check" onClick={() => HandleDone(todo._id)}>
                      {todo.done ? (
                        <FaCheckCircle className="todo-check-icon todo-check-icon--completed" />
                      ) : (
                        <CiCircleCheck className="todo-check-icon" />
                      )}
                    </div>
                    
                    <span className={`todo-text ${todo.done ? 'todo-text--completed' : ''}`}>
                      {todo.task}
                    </span>
                    
                    <div className="todo-actions">
                      <button onClick={() => Edittod(todo)} className="todo-action-btn todo-action-btn--edit">
                        <CiEdit className="todo-action-icon" />
                      </button>
                      <button onClick={() => handleDelete(todo._id)} className="todo-action-btn todo-action-btn--delete">
                        <MdDelete className="todo-action-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
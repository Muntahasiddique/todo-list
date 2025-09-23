import { useState } from "react";
import axios from "axios";

function Create() {
  const [task, settask] = useState("");

  const HandleTask = async () => {
    try {
      if (task.trim() === '') {
        alert('Task cannot be empty');
        return;
      }
      const result = await axios.post('http://localhost:3000/add', { task: task });
      console.log(result.data);
      location.reload();
      settask("");
      alert("Task added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="create-container">
      <div className="create-form">
        <input 
          type="text" 
          placeholder="Enter your task..." 
          value={task} 
          onChange={(e) => settask(e.target.value)}
          className="create-input"
        />
        <button onClick={HandleTask} className="create-btn">Add Task</button>
      </div>
    </div>
  );
}

export default Create;

import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const App = () => {

  const [socket, setSocket] = useState();
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    const socket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socket);

    socket.on('addTask', (task) => addTask(task));
    socket.on('removeTask', (id) => removeTask(id));
    socket.on('updateData', (data) => updateTasks(data));

    return () => {
      socket.off('addTask')
      socket.off('removeTask')
      socket.off('updateData')
      socket.disconnect();
    };
}, []);

const removeTask = (id, emit = false) => {
  setTasks(tasks => tasks.filter(task => task.id !== id));
  if(socket && emit) {
    socket.emit('removeTask', id);
  }
};

const addTask = (task) => {
  setTasks(tasks => [...tasks, task]);
};

const updateTasks = (data) => {
  setTasks(data);
};

const submitForm = (e) => {
  e.preventDefault();
  if(taskName.trim() === "") {
    return;
  }
  const task = { id: uuidv4(), name: taskName };
  addTask(task);
  socket.emit('addTask', task);
  setTaskName("");
};

  return (
    <div className="App">

        <header>
          <h1>ToDoList.app</h1>
        </header>

        <section className="tasks-section" id="tasks-section">
          <h2>Tasks</h2>

          <ul className="tasks-section__list" id="tasks-list">
            {tasks.map((task, index) => (
              <li key={index} className="tasks">
                {task.name}
                <button className="btn btn--red" onClick={() => removeTask(task.id, true)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form id="add-task-form" onSubmit={(e) => submitForm(e)}> 
            <input 
              className="text-input" 
              autoComplete="off" 
              type="text" 
              placeholder="Type your description" 
              id="task-name" 
              value={taskName} 
              onChange={(e) => setTaskName(e.target.value)} 
            />
            <button className="btn" type="submit">Add</button>
          </form>

        </section>
    </div>
  );
};

export default App;
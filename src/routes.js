import { Database } from "./database.js"
import { randomUUID } from "node:crypto"
import { buildRoutePath } from "./utils/build-route-path.js"
import { validateBody, validateId } from "./utils/data-validation.js";

const database = new Database;

export const routes = [
  {
    method: "GET",
    url: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select("tasks", search ? search : undefined)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: "POST",
    url: buildRoutePath("/tasks"),
    handler: (req, res) => {
      if (validateBody(req.body)) {
        const { 
          title,
          description
        } = req.body
  
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date(),
          updated_at: null,
        }
        
        database.insert('tasks', task)
  
        return res.writeHead(201).end(JSON.stringify(task))
      }
      
      return res.writeHead(400).end(JSON.stringify({ message: "Incorrect title or description!" }))
    }
  },
  {
    method: "PUT",
    url: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      if (validateBody(req.body)) {
        const { id } = req.params
        if (validateId(id, database)) {
          const {
            title,
            description
          } = req.body
          
          let task = database.select('tasks', id)[0];
          
          task.title = title;
          task.description = description;
          task.updated_at = new Date();
          
          database.update("tasks", id, task)
          return res.end(JSON.stringify(task))
        }

        return res.writeHead(400).end(JSON.stringify({ message: "Task with informed id not found!" }))
      }
      
      return res.writeHead(400).end(JSON.stringify({ message: "Incorrect title or description!" }))
    }
  },
  {
    method: "PATCH",
    url: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params

      if(validateId(id, database)) {
        let task = database.select('tasks', id)[0];

        task.completed_at = new Date();

        database.update('tasks', id, task)

        return res.end(JSON.stringify(task))
      }

      return res.writeHead(400).end(JSON.stringify({ message: "Task with informed id not found!" }))
    }
  },
  {
    method: "DELETE",
    url: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params
      if (validateId(id, database)) {
        database.drop("tasks", id);

        return res.end()
      }
      return res.writeHead(400).end(JSON.stringify({ message: "Task with informed id not found!" }))
    }
  }
]
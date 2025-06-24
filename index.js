import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs-extra'
import cors from 'cors'
import {doc} from './doc.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const PORT = 3000
const J_FILE = "./data.json"

app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //allowedHeaders: ['Content-Type', 'Authorization']
}))

const writeData = async (data) => await fs.writeJson(J_FILE, data, {space:2})
const readData = async () => await fs.readJson(J_FILE)

app.get('/', (req, res) => {
    res.json(doc)
})

// TODOS
//toutes les todos
app.get('/todos', async (req, res) => {
    const data = await readData()
    res.json(data.todos)
})

//une todo
app.get('/todos/:id', async (req, res) => {
     const id = req.params.id
     console.log(id)
     const data = await readData()
    const todo = data.todos[id]

  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ error: "Todo introuvable" });
  }
})

app.delete('/todos/:id', async (req, res) => {
      const id = parseInt(req.params.id)
      if (!id || !Number(id)) {
        res.status(403).json({ error: "Il manque un id" })
        return
      }
      const data = await readData()
      const todo = data.todos[id]
      if (todo) {
        let deleted = data.todos.splice(id,1)
        await writeData(data)
        res.json({'todo deleted': deleted})
    } else {
        res.status(404).json({ error: "Todo introuvable" });
    }
})

app.post('/todos/', async (req, res) => {
     const data = req.body
      const oldDdata = await readData()
      oldDdata.todos.push(data)
      await writeData(oldDdata)
      res.json({message: "Ajout", key:oldDdata.todos.length-1})
})

app.patch('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id)
     const data = req.body
     console.log(data)
    if (!data.label || typeof data.user !== 'number' || data.user < 0) {
      res.status(501).json({message: "Objet envoyé non conforme", key:id})
      return
     }
      const oldDdata = await readData()
      oldDdata.todos[id] = data
      await writeData(oldDdata)
      res.json({message: "Edit", key:id})
})

app.get('/todos-users/', async (req, res) => {
    const data = await readData()
    let sortie = []
    data.todos.forEach((todo, key) => {
      let item = todo
      item.id = key
      item.userData = data.users[todo.user]
      console.log(item)
      sortie.push(item)
    });
    res.json(sortie)
})

//USERS
app.get('/users', async (req, res) => {
    const oldDdata = await readData()
    res.json(oldDdata.users)
})

app.get('/users/:id', async (req, res) => {
     const id = req.params.id
     //console.log(id)
     const data = await readData()
    const user = data.users[id]

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User introuvable" });
  }
})

app.delete('/users/:id', async (req, res) => {
      const id = parseInt(req.params.id)
      const data = await readData()
      const user = data.users[id]
      if (user) {
        let deleted = data.users.splice(id,1)
        await writeData(data)
        res.json({'user deleted': deleted})
    } else {
        res.status(404).json({ error: "User introuvable" });
    }
})

app.post('/users/', async (req, res) => {
     const data = req.body
      const oldDdata = await readData()
      oldDdata.users.push(data)
      await writeData(oldDdata)
      res.json({message: "Ajout", key:oldDdata.users.length-1})
})

app.patch('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id)
     const data = req.body
      const oldDdata = await readData()
      oldDdata.users[id] = data
      await writeData(oldDdata)
      res.json({message: "Edit", key:id})
})


//error 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée', method: req.method });
});

app.listen(PORT, () => {
    console.log(`Serveur est démarré : http://localhost:${PORT}`)
})
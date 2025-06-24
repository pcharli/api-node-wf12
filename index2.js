import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs-extra'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    res.json({"documentation":"blabla"})
})

function createCrudRoutes(entityName) {
  const plural = entityName // ex: 'todos'
  const dataKey = entityName // même nom dans ton JSON

  // GET all
  app.get(`/${plural}`, async (_req, res) => {
    const data = await readData()
    res.json(data[dataKey])
  })

  // GET one
  app.get(`/${plural}/:id`, async (req, res) => {
    const id = parseInt(req.params.id)
    const data = await readData()
    const item = data[dataKey][id]
    if (item) {
      res.json(item)
    } else {
      res.status(404).json({ error: `${entityName} introuvable` })
    }
  })

  // POST
  app.post(`/${plural}`, async (req, res) => {
    const newItem = req.body
    const data = await readData()
    data[dataKey].push(newItem)
    await writeData(data)
    res.json({ message: 'Ajout', key: data[dataKey].length - 1 })
  })

  // PATCH
  app.patch(`/${plural}/:id`, async (req, res) => {
    const id = parseInt(req.params.id)
    const updatedItem = req.body
    const data = await readData()
    if (data[dataKey][id]) {
      data[dataKey][id] = updatedItem
      await writeData(data)
      res.json({ message: 'Modifié', key: id })
    } else {
      res.status(404).json({ error: `${entityName} introuvable` })
    }
  })

  // DELETE
  app.delete(`/${plural}/:id`, async (req, res) => {
    const id = parseInt(req.params.id)
    const data = await readData()
    if (data[dataKey][id]) {
      const deleted = data[dataKey].splice(id, 1)
      await writeData(data)
      res.json({ message: `${entityName} supprimé`, deleted })
    } else {
      res.status(404).json({ error: `${entityName} introuvable` })
    }
  })
}

createCrudRoutes('todos')
createCrudRoutes('users')

app.get('/todos-users/', async (_req, res) => {
    const data = await readData()
    let sortie = []
    data.todos.forEach((todo, key) => {
      let item = todo
      item.id = key
      item.userData = data.users[todo.user]
      console.log(item)
      sortie.push(item)
    })
    res.json(sortie)
})

//error 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée', method: req.method })
})

app.listen(PORT, () => {
    console.log(`Serveur est démarré : http://localhost:${PORT}`)
})
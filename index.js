const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Genius Car Service Running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x9bx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

const run = async () => {
  try {
    await client.connect()

    const serviceCollection = client.db('geniusCar').collection('service')

    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.toArray()
      res.send(services)
    })

    app.get('/service/:id', async (req, res) => {
      const id = req.params
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })

    app.post('/service', async (req, res) => {
      const service = req.body
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })

    app.delete('/service/:id', async (req, res) => {
      const id = req.params
      const query = { _id: ObjectId(id) }
      const result = await serviceCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
  }
}

run().catch(console.dir)
app.listen(port, () => console.log('Genius Car Service Server Running,'))

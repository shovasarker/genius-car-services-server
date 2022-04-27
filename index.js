const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthrized Access' })
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }
    console.log('decoded', decoded)
    req.decoded = decoded
    next()
  })
}

app.get('/', (req, res) => {
  res.send('Genius Car Service Running in UnKnown port')
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
    const orderCollection = client.db('geniusCar').collection('order')

    //AUTH Getting JWT Token
    app.post('/login', async (req, res) => {
      const user = req.body
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      })
      res.send({ accessToken })
    })

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

    app.get('/order', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const query = req.query
      if (decodedEmail === query.email) {
        const cursor = orderCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
      } else {
        res.status(403).send({ message: 'Forbidden Access' })
      }
    })

    app.post('/order', async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })
  } finally {
  }
}

run().catch(console.dir)
app.listen(port, () => console.log('Genius Car Service Server Running,'))

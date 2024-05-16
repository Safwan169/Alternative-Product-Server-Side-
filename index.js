const express = require('express');
const app = express();
const port = process.env.PROT || 5000;
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const cors = require('cors')
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: ["http://localhost:5174", "http://localhost:5173", "https://product-info-bd6b7.web.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }

));

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log('token in the middleware', token);
  // no token available 
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access ' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access ' })
    }
    req.user = decoded;
    next();
  })
}


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


const uri = `mongodb+srv://${process.env.DATA_1}:${process.env.DATA_2}@cluster0.6zehkma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



    const database = client.db("alternative");
    const data = database.collection("queries");
    const data1 = database.collection("recommendationData");


    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie('token', token,cookieOptions)
        .send({ success: true });
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', {...cookieOptions, maxAge: 0 }).send({ success: true })
  })

    // get all queries data
    app.get('/queries', async (req, res) => {
      const cursor = data.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // post  queries data

    app.post('/queries', async (req, res) => {
      const user = req.body
      const result = await data.insertOne(user)
      res.send(result)
    })

    // update queries data
    app.put('/queriesUpdate/:idd', async (req, res) => {
      const id = req.params.idd;
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const datas1 = req.body;
      console.log(datas1)

      const updateData = {
        $set: {
          date: datas1.date,
          name: datas1.name,
          brand_name: datas1.brand_name,
          url: datas1.url,
          reason: datas1.reason,
          location: datas1.location,
          product_title: datas1.product_title,
          // description: datas1.description,
          // spot: datas1.spot
        }
      }

      const result = await data.updateOne(filter, updateData, options);
      res.send(result);
    })

    // delete queries data
    app.delete('/queries/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await data.deleteOne(query);
      res.send(result);
    })

// ver
    // my queries  
    app.get('/myqueries/:email', async (req, res) => {


      if (req.user.email !== req.params.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }

      const email = req.params.email
      const cursor = data.find({ email })
      const request = await cursor.toArray();
      res.send(request)

    })

    // recommendation update
    app.put('/recc/:idd', async (req, res) => {
      const id = req.params.idd;
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      // const datas1 = req.body;
      // console.log(datas1)

      const updateData = {
        $inc: { recommendationCount: 1 }
      }

      const result = await data.updateOne(filter, updateData, options);
      res.send(result);
    })
    // decreasing  recommendation count
    app.put('/delete/:idd', async (req, res) => {
      const id = req.params.idd;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      // const datas1 = req.body;
      // console.log(datas1)
      // console.log(id,filter)

      const deleteData = {
        $inc: { recommendationCount: -1 }
      }

      const result = await data.updateOne(filter, deleteData, options);
      res.send(result);
    })

    // delete recommendation data
    app.delete('/de/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await data1.deleteOne(query);
      res.send(result);
    })


    // recommendation data post
    app.post('/rec', async (req, res) => {
      const user = req.body
      const result = await data1.insertOne(user)
      res.send(result)
    })

    // recommendation data get 
    app.get('/rec', async (req, res) => {
      const cursor = data1.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // const movie = await movies.find();
    // console.log(movie)
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
;


app.get('/', (req, res) => {
  res.send('asdhfjsd')
})



app.listen(port, () => {
  console.log(`kaj hoisa ${port}`)
})
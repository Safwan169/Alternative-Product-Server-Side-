const express= require('express');
const app=express();
const port =process.env.PROT||5000;
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const cors =require('cors')
app.use(express.json());
app.use(cors());






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
    await client.connect();



    const database = client.db("alternative");
    const data = database.collection("queries");
    const data1 = database.collection("recommendationData");


    app.get('/queries',async (req,res)=>{
        const cursor = data.find();
                const result = await cursor.toArray();
                res.send(result);
      })
      app.post('/queries',async(req,res)=>{
        const user=req.body
        const result = await data.insertOne(user)
          res.send(result)
      })
// my queries
      app.get('/myqueries/:email',async(req,res)=>{
        const email=req.params.email
        const cursor=data.find({email})
        const request=await cursor.toArray();
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
        console.log(id,filter)
      
        const deleteData = {
          $inc: { recommendationCount: -1 }
        }
      
        const result = await data.updateOne(filter, deleteData, options);
        res.send(result);
      })

      // delete recommendation data
      app.delete('/de/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id)
        const query = { _id: new ObjectId(id) }
        const result = await data1.deleteOne(query);
        res.send(result);
      })


      // recommendation data post
      app.post('/rec',async(req,res)=>{
        const user=req.body
        const result = await data1.insertOne(user)
          res.send(result)
      })

      // recommendation data get 
      app.get('/rec',async (req,res)=>{
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


app.get('/',(req,res)=>{
    res.send('asdhfjsd')
})



app.listen(port,()=>{
    console.log(`kaj hoisa ${port}`)
})
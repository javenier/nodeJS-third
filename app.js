const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;

const app = express();
const jsonParser = express.json();

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/",{ useUnifiedTopology: true });

let dbClient;

app.use(express.static(__dirname + "/public"));


mongoClient.connect().then(mongoClient => {
    dbClient = mongoClient;
    app.locals.collection = dbClient.db("restaurant").collection("dish");
    app.listen(3000, function () {
        console.log("Сервер ожидает подключения...");
    });
});

app.get("/api/dish", function (req, res) {

    const collection = req.app.locals.collection;
    collection.find().toArray().then((dish) => {
        res.json(dish)
    }).catch((err) => console.log(err));

});


//finding
app.get("/api/dish/:id", function(req, res) {
  
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    
    collection.findOne({ _id: id })
      .then(dish => {
        res.send(dish);
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      });
  });


  //adding
  app.post("/api/dish", jsonParser, function(req, res) {
    if (!req.body) return res.sendStatus(400);
  
    const dishName = req.body.dishName;
    const dishWeight = req.body.dishWeight;
    const dishCuisine = req.body.dishCuisine;
    const dish = { dishName: dishName, dishWeight:dishWeight ,dishCuisine:dishCuisine };
  
    const collection = req.app.locals.collection;
  
    collection.insertOne(dish)
      .then(result => {
        res.send(dish);
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      });
  });

  app.delete("/api/dish/:id", function (req, res) {

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;

    collection.findOneAndDelete({ _id: id })
        .then(result => {
            let dish = result.value;
            res.send(dish);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Error deleting dish");
        });
});

app.put("/api/dish", jsonParser, function(req, res) {

    if (!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const dishName = req.body.dishName;
    const dishWeight = req.body.dishWeight;
    const dishCuisine = req.body.dishCuisine;

    const collection = req.app.locals.collection;

    collection.findOneAndUpdate({ _id: id }, { $set: { dishName: dishName, dishWeight:dishWeight ,dishCuisine:dishCuisine }},
        { returnOriginal: false })
        .then(result => {
            const dish = result.value;
            res.send(dish);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Error updating dish");
        });

});

// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});

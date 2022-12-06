const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const PORT = 3131;
require("dotenv").config();

let db,
  dbConnectionStr = process.env.DB_STRING,
  dbName = "todo";

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
  (client) => {
    console.log(`Connected to ${dbName} Database!`);
    db = client.db(dbName);
  }
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Get data from DB and Render HTML
app.get("/", async (request, response) => {
  const todoItems = await db.collection("todos").find().toArray();
  const itemsLeft = await db
    .collection("todos")
    .countDocuments({ completed: false });
  response.render("index.ejs", { items: todoItems, left: itemsLeft });
});

//Add a todo item to DB and refresh
app.post("/addTodo", (request, response) => {
  db.collection("todos")
    .insertOne({ item: request.body.todoItem, completed: false })
    .then((result) => {
      console.log("Todo Added");
      response.redirect("/");
    })
    .catch((error) => console.error(error));
});

//Mark a todo item as complete
app.put("/markComplete", (request, response) => {
  db.collection("todos")
    .updateOne(
      { item: request.body.itemFromJS },
      {
        $set: {
          completed: true,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      console.log("Marked Complete");
      response.json("Marked Complete");
    })
    .catch((error) => console.error(error));
});

//Mark a todo item as not complete
app.put("/markUncomplete", (request, response) => {
  db.collection("todos")
    .updateOne(
      { item: request.body.itemFromJS },
      {
        $set: {
          completed: false,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      console.log("Marked Incomplete");
      response.json("Marked Incomplete");
    })
    .catch((error) => console.error(error));
});

//Delete todo item
app.delete("/deleteItem", (request, response) => {
  db.collection("todos")
    .deleteOne({ item: request.body.itemFromJS })
    .then((result) => {
      console.log("Todo Deleted");
      response.json("Todo Deleted");
    })
    .catch((error) => console.error(error));
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

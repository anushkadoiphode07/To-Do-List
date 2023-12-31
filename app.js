//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anushkadoiphode07:Anukaran%402003@cluster0.2avh9cp.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Why no item?"]
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
} );

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1,item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0) {
       Item.insertMany(defaultItems);
       res.redirect("/");
    } else {
      res.render("list.ejs", {listTitle: "Today", newListItems: foundItems});
    }
    console.log(foundItems);
    
  })
  .catch(function(err) {
    console.log(err)
  });
  

});

app.get("/:customListName", (req,res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
          if(!foundList) {
            // create a new list
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
          }
          else {
          //  show an existing list
              res.render("list.ejs", {listTitle: foundList.name, newListItems: foundList.items});
          }
    });
    
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });
  if(listName === "Today") {
      
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
  }
  

  
});

app.post("/delete", (req,res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
      Item.findByIdAndRemove(checkedItemId).then(()=> {
        console.log("Successfully Deleted");
        res.redirect("/");
      }).catch((err) => {
        console.log(err);
      });
    }
    else {
      List.findOne({ name: listName })

      .then(function (foundList) {

        // Use req.body.checkbox to find the item to remove

        foundList.items.pull({ _id: req.body.checkbox });

        foundList.save();

        res.redirect("/" + listName);

      })

      .catch(function (err) {

        console.log(err);

      });
    }
    
});


app.get("/about", function(req, res){
  res.render("about.ejs");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

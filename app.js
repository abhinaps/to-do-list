const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todo",{ useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemSchema);


const morning = new Item({
  name:"Good morning"
});
const breakfast = new Item({
  name:"Have breakfast"
});
const startingList = [morning, breakfast];

const listSchema = new mongoose.Schema({
  name: String,
  item: [itemSchema]
});
const List = mongoose.model("List",listSchema);

let today = new Date();
let option = {
  day : "numeric",
  month : "long",
  weekday : "long"
};
let day = today.toLocaleString("us-EN", option);

app.get("/",function(req,res){

  Item.find(function(err,item){
    if(item.length === 0){
      Item.insertMany(startingList,function(err){
        if(err)
        console.log(err);
        else
        res.redirect("/");
      })
    }else{
      res.render("list", {day: "Today",items: item})
    }
  });
});

app.get("/:listname",function(req,res){
  const routeName = _.capitalize(req.params.listname);

  List.findOne({name:routeName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: routeName,
          item: startingList
        });
        list.save();
        res.redirect("/"+routeName);
      }else
      res.render("list", {day: foundlist.name, items: foundlist.item})
    }

  });

});

app.post("/",function(req,res){
  let listitem = req.body.li;
  const listname = req.body.button;

  const itemName = new Item({
    name:listitem
  });

if(listname === "Today"){
  itemName.save();
  res.redirect("/");
}else{
  List.findOne({name:listname},function(err,foundlistforadding){
    foundlistforadding.item.push(itemName);
    foundlistforadding.save();
    res.redirect("/"+listname);
  });
}


});

app.post("/delete",function(req,res){
  const itemid =  req.body.checkbox;
  const title = req.body.title;

  if(title === "Today"){
    Item.findByIdAndRemove(itemid,function(err){
      if(err)
      console.log(err);
      else
      res.redirect("/");
    });
  }else{
    console.log(itemid);
    List.findOneAndUpdate({name:title}, {$pull: {item: { _id: itemid} }},function(err){
      if(err)
      console.log(err);
      else
      res.redirect("/"+title);
    })
  }


});


app.listen("3000",function(){
  console.log("Server started at port 3000");
})

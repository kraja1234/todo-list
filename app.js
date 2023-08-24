//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://raja:raja@cluster0.vvokndf.mongodb.net/todolistDB');

const itemSchema={
  name :String,
};

const Item=mongoose.model("Item",itemSchema) ;

const item1=new Item({
  name:"Welcome to your todolist!"
});

const item2=new Item({
  name:"Hit + button to add a new item"
});

const item3=new Item({
  name:"<--- hit this to delete an item"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}).then(function(docs){

    if(docs.length===0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Succesess");
      }).catch(function(err){
        console.log(err);
      })
      
      res.redirect("/");

    }
    else{
      res.render("list", {listTitle: "Today", newListItems: docs});

    }
   
  }).catch(function(err){
    console.log(err);
  })



});

app.get("/:CustomListName",function(req,resp){

  const CustomListName=_.capitalize(req.params.CustomListName);
  List.findOne({name:CustomListName}).then(function(data){
    if(!data){
      const list=new List({
        name:CustomListName,
        items:defaultItems
      })
    
      list.save();
      resp.redirect("/"+CustomListName);
    
      
    }else{
       resp.render("list",{listTitle : data.name, newListItems:data.items})
    }
  }).catch(function(err){
    console.log(err);
  })
  })

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
   const item=new Item({
    name:itemName
   });

   if(listname==="Today"){
    
  item.save();
  res.redirect("/");

   }
    else{
      List.findOne({name:listname }).then(function(data){
        data.items.push(item);
        data.save();
        res.redirect("/"+listname);
      }).catch(function(err){
        console.log(err);
      })
    }
    
   
 });

app.post("/delete",function(req,resp){
  const Itemdel=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(Itemdel).then(function(){
      console.log("suceesss");
      resp.redirect("/");
    }).catch(function(err){
      console.log(err);
    })

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items : {_id:Itemdel}}}).then(function(data){
      resp.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    })
  }
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

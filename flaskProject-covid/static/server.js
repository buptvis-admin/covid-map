const express = require("express");
const app = express();
const mongoClient = require('mongodb').MongoClient;
const url = "mongodb://covid19:covid1920@182.92.174.94:27017/covid19?authSource=covid19";

//解决跨域问题
app.all('*',function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');//*表示可以跨域任何域名都行（包括直接存在本地的html文件）出于安全考虑最好只设置 你信任的来源也可以填域名表示只接受某个域名
  res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type');//可以支持的消息首部列表
  res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');//可以支持的提交方式
  res.header('Content-Type','application/json;charset=utf-8');//响应头中定义的类型
  next();
});

mongoClient.connect(url, function(err, client) {
  if(err){
        console.log('Failure to connect database');
        throw err;
  }
  console.log('Connected to mongo!');

  var database = client.db("covid19");
  var collection = database.collection("anhui");
  var condition = {};

  app.get("/", function(req, res) {
    if(req.query.value) {
      console.log(req.query.value);
      collection = database.collection(req.query.value)
    }
    collection.find(condition).toArray(function(err, docs) {
      if(err) console.log('Failed to find data');
      res.status(200);
      res.send(docs);
      res.end();
      console.log(docs);
    });
  });
});

app.listen(3000, function() {
  console.log("express running on http://localhost:3000");
});
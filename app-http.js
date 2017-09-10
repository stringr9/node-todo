"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var db = require('./db.js')
//Log all the requests to the console
app.use(function(req,res,next){
  console.log('New request on: ' + req.path + ' Method: '+  req.method);
  next();
});

//TODO: What if the json here is invalid, should I try to catch the error?
app.use('/tasks',bodyParser.json())

app.post('/tasks', function(req, res){
  var data = req.body;
  //Check that request contains the task key
  if(!data.task){
    res.status(400).end("No task to add\n");
  };

  db.addTask(data.task)
    .then(function(){
      console.log("Added task \"" + data.task + "\" to list")
      res.status(204).end();
    })
    .catch(function(err){
      console.log(err);
      res.status(500).end();
  });
});

app.delete('/tasks/:id', function(req, res){
  db.deleteTask(req.params.id)
    .then(function(){
      console.log("Deleted task " + req.params.id);
      res.status(204).end();
    })
    .catch(function(err){
      // TODO: Get some feedback on how to handle errors.  This does what I want but feels messy
      // But maybe it doesn't matter if we try to delete a task that doesn't exist?  But then we're failing silently...
      console.log(err);
      if(err.code = db.ERROR_CODE_TASK_DOES_NOT_EXIST){
        res.status(404).end("Task does not exist\n");
      }
      res.status(500).end();
  });
});

app.put('/tasks/complete/:id', function(req, res){
  db.completeTask(req.params.id)
    .then(function(){
      console.log("Set task " + req.params.id + " as completed.");
      res.status(204).end();
    })
    .catch(function(err){
      console.log(err);
      if(err.code = db.ERROR_CODE_TASK_DOES_NOT_EXIST){
        res.status(404).end("Task does not exist\n");
      }
      res.status(500).end();
  });
});

app.get('/tasks', function(req, res){
  db.getAllTasks()
    .then(function(rows){
      //TODO: Should this respond with just an array or should it have a tasks key with value the array?
      var data = {};
      data.tasks = rows;
      res.json(data);
      res.status(204).end();
    })
    .catch(function(err){
      console.log(err);
      res.status(500).end();
  });
});

//Give anything not explicitly routed a 404
app.use(function(req,res,next){
  res.status(404).end();
});

app.listen(3000);

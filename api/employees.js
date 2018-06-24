const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheets.js');

const employeeRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
  sql = `SELECT * FROM Employee WHERE is_current_employee = 1`;

  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    res.status(200).json({employees: rows});
  });
});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  sql = `SELECT * FROM Employee WHERE id = ${employeeId}`;
  db.get(sql, (err, row) => {
    if(row){
      req.employee = row;
      next();
    }
    else if(err){
      next(err);
    }
    else{
      res.status(404).send();
    }
  });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

//function to make sure request employee is valid
employeeChecker = (req, res, next) => {
  employee = req.body.employee;
  if(employee.name && employee.position && employee.wage){
    next();
  }
  else{
    res.status(400).send();
  }
};

employeeRouter.post('/', employeeChecker, (req, res, next) => {
  employee = req.body.employee;

  sql = `INSERT INTO Employee (name, position, wage)
  VALUES ($name, $position, $wage)`;

  values = {
    $name: employee.name,
    $position: employee.position,
    $wage: employee.wage
  };

  db.run(sql, values, function(err){
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) =>{
      res.status(201).json({employee: row});
    });
  });
});

employeeRouter.put('/:employeeId', employeeChecker, (req, res, next) => {
  employee = req.body.employee;

  //check that employee exists
  db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
    if(err){
      next(err);
    }
    else if(!row){
      res.status(400).send();
    }
  });

  sql = `UPDATE Employee SET
  name = $name,
  position = $position,
  wage = $wage
  WHERE id = $id`;

  values = {
    $name: employee.name,
    $position: employee.position,
    $wage: employee.wage,
    $id: req.params.employeeId
  };

  db.run(sql, values, function(err){
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) =>{
      if(err){
        next(err);
      }
      res.status(200).json({employee: row});
    });
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
  sql = `UPDATE Employee SET
  is_current_employee = 0
  WHERE ${req.params.employeeId}`;

  db.run(sql, (err) =>{
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) =>{
      res.json({employee: row});
    });
  });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

module.exports = employeeRouter;

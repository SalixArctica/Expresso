const express = require('express');
const sqlite3 = require('sqlite3');

timesheetRouter = express.Router({mergeParams: true});
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.get('/', (req, res, next) => {
  sql = `SELECT * FROM Timesheet WHERE employee_id = ${req.employee.id}`;
  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    res.json({timesheets: rows});
  });
});

timesheetChecker = (req, res, next) => {
  sheet = req.body.timesheet;

  if(!sheet || !sheet.hours || !sheet.rate || !sheet.date){
    res.status(400).send();
  }
  next();
};

timesheetRouter.post('/', timesheetChecker, (req, res, next) => {
  sql = `INSERT INTO Timesheet
    (hours, rate, date, employee_id)
    VALUES ($hours, $rate, $date, $employee_id)`;

  values = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employee_id: req.employee.id
  };

  db.run(sql, values, function(err){
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
      if(err){
        next(err);
      }
      res.status(201).json({timesheet: row});
    });
  });
});

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  sql = `SELECT * FROM Timesheet WHERE id = ${timesheetId}`;
  db.get(sql, (err, row) => {
    if(err){
      next(err);
    }
    if(row){
      req.timesheet = row;
      next();
    }
    else{
      res.status(404).send();
    }
  });
});

timesheetRouter.put('/:timesheetId', timesheetChecker, (req, res, next) => {
  sql = `UPDATE Timesheet
  SET hours = $hours,
  rate = $rate,
  date = $date,
  employee_id = $employee_id
  WHERE id = $id`;

  values = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employee_id: req.employee.id,
    $id: req.params.timesheetId
  };

  db.run(sql, values, function(err){
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) =>{
      if(err){
        next(err);
      }
      res.status(200).json({timesheet: row});
    });
  });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err) => {
    if(err){
      next(err);
    }
    res.status(204).send();
  });
});

module.exports = timesheetRouter;

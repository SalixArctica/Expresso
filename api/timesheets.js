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

timesheetRouter.post('/', (req, res, next) => {
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
    db.get(`SELECT * FROM Timesheet WHERE employee_id = ${this.lastID}`, (err, row) => {
      res.status(201).json({timesheet: row});
    });
  });
});

module.exports = timesheetRouter;

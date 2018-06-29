const sqlite3 = require('sqlite3');
const express = require('express');

menuRouter = express.Router();
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.get('/', (req, res, next) => {
  sql = `SELECT * FROM Menu`;

  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    res.json({menus: rows});
  });
});

menuChecker = (req, res, next) => {
  if(req.body.menu.name){
    next();
  }
  res.status(404).send();
};

menuRouter.post('/', menuChecker, (req, res, next) => {
  sql = `INSERT INTO Menu (name)
  VALUES (${req.body.menu.name})`;

  db.run(sql, function(err){
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
      if(err){
        next(err);
      }
      res.status(201).json({menu: row});
    });
  });
});

menuRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, row) => {
    if(err){
      next(err);
    }
    if(row){
      req.menu = row;
      next();
    }
    res.status(404).send();
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.json({menu: req.menu});
});

menuRouter.put('/:menuId', menuChecker, (req, res, next) => {
  sql = `UPDATE Menu SET name = ${req.body.menu.name}
  WHERE id = ${req.params.menuId}`;

  db.run(sql, (err) => {
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, row) => {
      if(err){
        next(err);
      }
      res.json({menu: row});
    });
  });
});

module.exports = menuRouter;

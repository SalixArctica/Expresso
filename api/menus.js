const sqlite3 = require('sqlite3');
const express = require('express');
const menuItemRouter = require('./menuItems.js');


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
  if(req.body.menu.title){
    next();
  }
  else{
    res.status(400).send();
  }
};

menuRouter.post('/', menuChecker, (req, res, next) => {
  sql = `INSERT INTO Menu (title) VALUES ($title)`;

  values = {
    $title: req.body.menu.title
  };

  db.run(sql, values, function(err){
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
    else if(row){
      req.menu = row;
      next();
    }
    else{
        res.status(404).send();
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.json({menu: req.menu});
});

menuRouter.put('/:menuId', menuChecker, (req, res, next) => {
  sql = `UPDATE Menu SET title = $title
  WHERE id = $id`;

  values = {
    $title: req.body.menu.title,
    $id: req.params.menuId
  };

  db.run(sql, values, (err) => {
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

menuRouter.delete('/:menuId', (req, res, next) => {
  sql = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`;

  //check for menuItems in the menu
  db.get(sql, (err, row) => {
    if(err){
      next(err);
    }
    if(row){
      res.status(400).send();
    }
    else{
      sql = `DELETE FROM Menu WHERE id = ${req.params.menuId}`;

      db.run(sql, (err) => {
        if(err){
        next(err);
        }
        res.status(204).send();
      });
    }
  });
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

module.exports = menuRouter;

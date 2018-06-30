const express = require('express');
const sqlite3 = require('sqlite3');

menuItemRouter = express.Router({mergeParams: true});
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.get('/', (req, res, next) => {
  sql = `SELECT * FROM MenuItem
    WHERE menu_id = ${req.params.menuId}`;

  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    res.status(200).json({menuItems: rows});
  });
});

menuItemChecker = (req, res, next) => {
  item = req.body.menuItem;

  if(!item.name || !item.description || !item.inventory || !item.price){
    res.status(400).send();
  }
  else{
    next();
  }
}

menuItemRouter.post('/', menuItemChecker, (req, res, next) => {
  newItem = req.body.menuItem;

  sql =  `INSERT INTO MenuItem
  (name, description, inventory, price, menu_id)
  VALUES ($name, $description, $inventory, $price, $menu_id)`

  values = {
    $name: newItem.name,
    $description: newItem.description,
    $inventory: newItem.inventory,
    $price: newItem.price,
    $menu_id: req.params.menuId
  };

  db.run(sql, values, function(err) {
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) =>{
      if(err){
        next(err);
      }
      res.status(201).json({menuItem: row});
    });
  });
});

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  sql = `SELECT * FROM  MenuItem WHERE id = ${menuItemId}`;

  db.get(sql, (err, row) => {
    if(err){
      next(err);
    }
    if(row){
      req.menuItem = row;
      next();
    }
    else{
      res.status(404).send();
    }
  });
});

menuItemRouter.put('/:menuItemId', menuItemChecker, (req, res, next) => {

  sql = `UPDATE MenuItem
  SET name = $name,
  description = $description,
  inventory = $inventory,
  price = $price,
  menu_id = $menu_id
  WHERE id = $id`

  newItem = req.body.menuItem;

  values = {
    $name: newItem.name,
    $description: newItem.description,
    $inventory: newItem.inventory,
    $price: newItem.price,
    $menu_id: req.params.menuId,
    $id: req.params.menuItemId
  };

  db.run(sql, values, (err) => {
    if(err){
      next(err);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
      if(err){
        next(err);
      }
      res.json({menuItem: row});
    });
  });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  sql = `DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`;

  db.run(sql, (err) => {
    if(err){
      next(err);
    }
    res.status(204).send();
  });
});

module.exports = menuItemRouter;

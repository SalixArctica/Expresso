const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const employeeRouter = require('./api/employees.js');

const app = express();
const PORT = process.env.PORT || 4000;

//middleware
//app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/employees', employeeRouter);

app.use(errorHandler());

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;

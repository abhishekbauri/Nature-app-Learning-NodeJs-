const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  // only using morgan in development and not in production
  // 3rd party middleware (morgan)
  // Morgan is another HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application.
  app.use(morgan('dev'));
}

// required to post data (middleware)
app.use(express.json());

// middleware for serving static files
// app.use(express.static(`${__dirname}/public`));

// // creating simple middleware
// // this middleware applies for each and every single request
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// mounting a new router into a route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling (handling unhandled routes)
// 'all' is used for all type of HTTP request
app.all('*', (req, res, next) => {
  // method -1
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // // method-2 (using global error handling middleware)
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);

  // method-3
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
// method -1
// app.use((err, req, res, next) => {
//   // console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

// method-2
app.use(globalErrorHandler);

// // get all tours
// app.get('/api/v1/tours', getAllTours);

// // Get tours by id
// app.get('/api/v1/tours/:id', getTour);

// // post data and update data in file as well
// app.post('/api/v1/tours', createTour);

// // patch to update data
// app.patch('/api/v1/tours/:id', updateTour);

// // delete to delete data
// app.delete('/api/v1/tours/:id', deleteTour);

// // more optimised way of routing
// app.route('/api/v1/tours').get(getAllTours).post(createTour);
// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

module.exports = app;

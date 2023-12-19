const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// Helmet helps you secure your Express apps by setting various HTTP headers
const helmet = require('helmet');
// For Data sanitization against NoSQL query injection
const mongoSanitize = require('express-mongo-sanitize');
// For Data sanitization against XSS
const xss = require('xss-clean');
// For prventing parameter pollution
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global middleware
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  // only using morgan in development and not in production
  // 3rd party middleware (morgan)
  // Morgan is another HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application.
  app.use(morgan('dev'));
}

// Limit request from same API
// 100 request in 1hr from same ip (for security purpose)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser (reading data from body into req.body)
// required to post data (middleware)
// app.use(express.json());

// limiting size of data from body
// if body data more than 10 kb then it will not accept
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// example of request -> api/tours?sort=duration&sort=price
// It actually removes the duplicates field. In above example it will sort on the basis of price (last parameter)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // means it will not work on duration property / field
  }),
);

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

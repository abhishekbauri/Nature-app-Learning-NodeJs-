const express = require('express');
const morgan = require('morgan');

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

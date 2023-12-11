const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router(); // middleware

// param middleware
// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is : ${val}`); // val will store the id
//   next();
// });

// router.param('id', tourController.checkId);

// create a checkBody middleware
// check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

// authcontroller.protect is a middleware to check user login status
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

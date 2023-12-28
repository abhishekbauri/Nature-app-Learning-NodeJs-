const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

// only logged in users with role 'users' are allowed to reviews
// users with 'admin' and 'tour guide' role are not allowed to review

module.exports = router;

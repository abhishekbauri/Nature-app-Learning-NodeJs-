// review / rating / createdAt, ref to tour / ref to user
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Parent referencing
    // because single tours can have more than thousands of reviews and hence array size will be huge if we do child referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  // for virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate User and Tour
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });

  // for virtual populate
  this.populate({
    path: 'user',
    select: 'name',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

// POST/tour/tourId/reviews  -> nested routes
// GET/tour/tourId/reviews
// GET/tour/tourId/reviews/94875ad

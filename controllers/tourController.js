// const fs = require('fs');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Refactored tourController with error handling -------------->>>>>

// catching errors in async function (this code has been moved to utils folder)
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id})

  // handling 404 not found errors
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // handling 404 not found errors
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  // handling 404 not found errors
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Aggregation Pipeline: Matching and Grouping
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // avgPrice is from the above pipeline docs
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// create document using mongoose

// exports.getAllTours = async (req, res) => {
//   try {
//     // for filtering data based on query
//     // 127.0.0.1:8000/api/v1/tours?duration=5&difficulty=easy (GET)
//     // console.log(req.query);
//     // { duration: '5', difficulty: 'easy' } -> output of above console

//     // method-1
//     // const tours = await Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');

//     // method-2
//     // const tours = await Tour.find({
//     //   duration: 5,
//     //   difficulty: 'easy',
//     // });

//     // BUILD QUERY
//     // 1(A). Filtering
//     // creating deep copy of query object
//     const queryObj = { ...req.query };
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];

//     // for removing the excludedFields if present in the req.query
//     excludedFields.forEach((ele) => delete queryObj[ele]);

//     console.log(req.query);
//     console.log(queryObj);

//     // 1(B). Advance Filtering

//     // 127.0.0.1:8000/api/v1/tours?difficulty=easy&duration[gte]=5
//     // console.log(req.query);
//     // { difficulty: 'easy', duration: { gte: '5' } }
//     // {difficulty: 'easy', duration: {$gte: 5}}  -> query in mongoDB

//     // for replacing gte, gt, lte, lte with $ symbol($gte, $gt etc)
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // console.log(JSON.parse(queryStr));

//     let query = Tour.find(JSON.parse(queryStr));

//     // 2. Sorting
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' ');
//       // console.log(sortBy);
//       query = query.sort(sortBy);
//       // query = query.sort(req.query.sort);
//       // sort('price ratingsAverage')
//     } else {
//       query = query.sort('-createdAt/');
//     }

//     // 3. Limiting Fields
//     if (req.query.fields) {
//       const fields = req.query.fields.split(',').join(' ');
//       query = query.select(fields);
//     } else {
//       query = query.select('-__v'); // negative for excluding that field only
//     }

//     // 4. Pagination
//     // page=2&limit=10, 1-10 ->page1, 11-20 ->page2
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     query = query.skip(skip).limit(limit);

//     if (req.query.page) {
//       const numTours = await Tour.countDocuments();
//       if (skip >= numTours) throw new Error('This page does not exist');
//     }

//     // EXECUTE QUERY
//     // console.log('query-->', query);
//     const tours = await query;

//     ///////////////////////////////////////////////////

//     // SEND RESPONSE
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (error) {
//     console.log('err->', error);
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Refactoring API Features only getAllTours

// Below class is moved to utils folder--------------->>>>>>>>>>>>>>>>>>>>>>

// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     // 1(A). Filtering
//     // creating deep copy of query object
//     const queryObj = { ...this.queryString };
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];

//     // for removing the excludedFields if present in the req.query
//     excludedFields.forEach((ele) => delete queryObj[ele]);

//     // 1(B). Advance Filtering
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     this.query = this.query.find(JSON.parse(queryStr));
//     return this;
//   }

//   sort() {
//     // 2. Sorting
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort('-createdAt/');
//     }

//     return this;
//   }

//   limitFields() {
//     // 3. Limiting Fields
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       this.query = this.query.select(fields);
//     } else {
//       this.query = this.query.select('-__v'); // negative for excluding that field only
//     }

//     return this;
//   }

//   paginate() {
//     // 4. Pagination
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// exports.getAllTours = async (req, res) => {
//   try {
//     // EXECUTE QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;

//     // SEND RESPONSE
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (error) {
//     // console.log('err->', error);
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// exports.createTour = async (req, res, next) => {
//   try {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Invalid data sent',
//     });
//   }
// };

// exports.getTour = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     // Tour.findOne({_id: req.params.id})

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

// // Aggregation Pipeline: Matching and Grouping
// exports.getTourStats = async (req, res) => {
//   try {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } },
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$difficulty' },
//           // _id: '$ratingsAverage',
//           numTour: { $sum: 1 },
//           numRatings: { $sum: '$ratingsQuantity' },
//           avgRating: { $avg: '$ratingsAverage' },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' },
//         },
//       },
//       {
//         $sort: { avgPrice: 1 }, // avgPrice is from the above pipeline docs
//       },
//       // {
//       //   $match: { _id: { $ne: 'EASY' } },
//       // },
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         stats,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

//////////////////////////////////////////////////////////////////

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id is : ${val}`); // val will store the id
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// // route handlers
// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// };

// exports.getTour = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1; // converting string into number because id is string

//   const tour = tours.find((ele) => ele.id === id);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };

// exports.createTour = (req, res) => {
//   //   console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         tour: newTour,
//       });
//     },
//   );
//   //   res.send('Done');
// };

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<updated tour here .....>',
//     },
//   });
// };

// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

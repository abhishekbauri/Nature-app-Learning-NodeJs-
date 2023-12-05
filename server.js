const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(app.get('env')); // development

// console.log(process.env);

// connecting mongoDB
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

// Creating a new document out of a Tour model
// const testTour = new Tour({
//   name: 'The Park Hamper',
//   price: 597,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log('saved successfully');
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error: --->', err);
//   });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

if(process.env.NODE_ENV !=="production"){
  require('dotenv').config()
}
const express = require('express');
const mongoose = require('mongoose');
var morgan = require('morgan')
var cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

// require routes
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const relationRoutes = require('./routes/relationRoutes')
const deviceRoutes = require('./routes/deviceRoutes')

//initialize express app
const app = module.exports = express();

// Database configuration
const uri = process.env.DB_URL || 'mongodb://localhost:27018,localhost:27019,localhost:27020/mongoauth?replicaSet=rs0';
app.use(cors())

// Connect to the database
mongoose.set("strictQuery", false);
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(morgan('tiny'))
app.use(helmet());
app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);


//routes
app.get("/",(req,res)=>{
  res.send("hello")
})
app.use("/users",userRoutes);
app.use("/relations",relationRoutes);
app.use('/posts', postRoutes);
app.use('/devices', deviceRoutes);


//404 route
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// port listening 
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app; 
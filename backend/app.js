const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const userRoute = require("./routes/user");
const interviewRoutes = require("./routes/interview");
require('dotenv').config();




const app = express();

app.use(cors({
    origin: "https://interviewmateai.onrender.com",
    credentials: true,
}))


const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // httpOnly: true,
    // sameSite: "none",  
    // secure: true,      //  must be true in production with HTTPS
  },
};

app.use(cookieParser());
app.use(express.json());
app.use(session(sessionOptions));

app.use("/ai/user",userRoute);
app.use("/ai/interviews", interviewRoutes);



mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to the database");
}).catch((err) => {
  console.error("Database connection error:", err);
});




app.get("/",(req,res)=>{
    res.send("This is root");
})

app.listen(8080,()=>{
    console.log("App is listening");
})
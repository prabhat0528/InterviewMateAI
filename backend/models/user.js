const mongoose = require("mongoose");
//const InterviewModel = require("./interview");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
      email: {
        type: String,
        required: true,
      },
       password: {
        type: String,
        required: true,
    },
    Interview:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"InterviewModel"
}]
});

const User = mongoose.model("User",userSchema);

module.exports = User;
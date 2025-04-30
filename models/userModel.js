const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },  
    password: {
        type: String,
        required: true
    },
    cart_items: {
        type: Array,
        required: false
    },
    role: {
        type:String,
        default: "user"
    }
})

const User = mongoose.model("User", userSchema)
module.exports = User;
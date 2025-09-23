const mongoose = require('mongoose')

const   Todoschema = new mongoose.Schema({
    task : String,
    done:{
        type:Boolean,
        default:false
    }
})

const TOdoModel = mongoose.model("todolist" , Todoschema)

module.exports = TOdoModel
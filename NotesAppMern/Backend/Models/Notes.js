const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
    title:String,
    content:String,
    important:{
        default:false,
        type:Boolean
    }
})
const NoteModel = mongoose.model("notes" , NoteSchema)
module.exports =  NoteModel
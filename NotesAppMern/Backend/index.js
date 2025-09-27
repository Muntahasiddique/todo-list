const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const NoteModel = require('./Models/Notes')

const app = express()
app.use(cors())
app.use(express.json())


mongoose.connect('mongodb+srv://muntahamirza890:dbMuntahaPass@mydb.bcxy0.mongodb.net/notesapp')
app.post('/add' , async(req , res)=>{
    try {
        const title = req.body.title;
        const content = req.body.content;
       const newNotes= await NoteModel.create({
            title:title,
            content:content
        })
        res.json(newNotes)
    } catch (error) {
         console.log(error)
    }
} )

app.get('/getNotes' , async (req, res)=>{
    try {
        const notes =await NoteModel.find()
        res.json(notes)
    } catch (error) {
         console.log(error)
    }
})

app.delete('/deleteNotes/:id' , async (req, res)=>{
try {
    const id = req.params.id;
    const response =await NoteModel.findByIdAndDelete(id)
    res.json(response)
} catch (error) {
      console.log(error)
}
})

app.put('/updateNote/:id' , async (req , res)=>{
    try {
        const id = req.params.id;
        const important = req.body.important;
      const response=  await NoteModel.findByIdAndUpdate(
            id ,
    {
        important:important
    })
    res.json(response)
    } catch (error) {
          console.log(error)
    }
})
app.put('/EditNote/:id' , async (req, res)=>{
    try {
        const id = req.params.id;
        const   title =req.body.title;
           const content =req.body.content;
 const response =await NoteModel.findByIdAndUpdate(
    id,
 {title:title,
 content:content},

)
res.json(response)
        
    } catch (error) {
          console.log(error)
    }
})

console.log("Server started...")
app.listen(3000, () => {
    console.log("Running on port 3000")
})
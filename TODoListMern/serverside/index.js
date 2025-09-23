const express = require('express')
const mongoose = require('mongoose')
const cors= require('cors')
const TOdoModel = require('./Models/Task')



const app = express()
app.use(cors())
app.use(express.json())
 mongoose.connect('mongodb+srv://muntahamirza890:dbMuntahaPass@mydb.bcxy0.mongodb.net/todolist')

// Add
app.post('/add', async (req,res) => {
  try{
      const task = req.body.task
   const newTask = await TOdoModel.create({
        task:task
    })
    res.status(201).json({
        message:"added",
        task:newTask
    })

  }
  catch(error){
    console.log(error)
  }
})

// Send task to frontend 
app.get('/getTask' ,async (req, res) =>{
try{
    const respdata =await TOdoModel.find()
  res.json(respdata) 
}  
catch(error){
console.log(res.json(error))
}
} )
//put when task done
app.put('/updateTask/:id' , async (req , res)=>{
  try{
  const id = req.params.id;
  const done = req.body.done
   const response = await TOdoModel.findByIdAndUpdate({_id:id},{done:done})
   res.json(response)
  }
  catch(error){
  console.log(error)
  }
})
app.delete('/DeleteTask/:id' , async (req, res)=>{
  try {
      const id = req.params.id;
       const response = await TOdoModel.findByIdAndDelete({_id:id})
        res.json(response)
  } catch (error) {
      console.log(error)
  }


})
app.put('/editTask/:id'  , async (req , res)=>{
  try {
    const id = req.params.id;
    const task = req.body.task;
    const response = await TOdoModel.findByIdAndUpdate(
      id,
      {task : task}
    )
    res.json(response)
  } catch (error) {
    console.log(error)
  }
})

app.listen(3000 , ()=>{
    console.log("ruuning on 3000")
} )
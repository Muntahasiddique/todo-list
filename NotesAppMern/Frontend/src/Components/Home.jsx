import { useEffect } from "react"
import axios from "axios"
import { useState } from "react"
function Home() {
    const [notes , setNotes] =  useState([])
    const [title , setTitle] = useState("")
    const [content ,  setContent] = useState("")

    // for adit
     const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")
    useEffect(()=>{
       const fetchNotes = async () =>{
        try {
         const response =   await axios.get('http://localhost:3000/getNotes')
            setNotes(response.data)
            
        } catch (error) {
             console.log(error)
        }
       }
       fetchNotes()
    },[])

    const  HandleAdd = async () =>{
     if(title.trim()=== '' || content.trim() === ''){
      alert ('Both feilds must be filled')
      return
     }
     else{
      try {
       await axios.post('http://localhost:3000/add' , {
        title :title,
        content:content
       })
       setTitle(" ")
       setContent(" ")
       const response =await axios.get('http://localhost:3000/getNotes')
       setNotes(response.data)

      } catch (error) {
        
      }
     }
    }


    const HandleDelete = async (id)=>{
     try {
      await axios.delete('http://localhost:3000/deleteNotes/' + id)
      setNotes(notes.filter(note => note._id !== id))
     } catch (error) {
      console.log(error)
     }
    }

    const handleImportant = async (id , currentStatus) =>{
     try {
      await axios.put('http://localhost:3000/updateNote/' + id , {
        important : !currentStatus
      })
      setNotes(notes.map(note=>
        note._id === id ? {...note , important:!currentStatus} :note
      ))
     } catch (error) {
      
     }
    }
    const HandleEdit =  async (note)=>{
     try {
     setEditingId(note._id)
     setEditTitle(note.title)
     setEditContent(note.content)
     } catch (error) {
      console.log(error)
     }
    }
    const SaveEdit = async (id) =>{
      if(editTitle.trim() === '' || editContent.trim() === '' ){
        alert('Title and content cannot be empty!')
        return
      }
      try {
        await axios.put('http://localhost:3000/EditNote/' + id,{
          title :editTitle,
          content:editContent
        })
        setNotes(notes.map(note => note._id === id ? { ...note , title:editTitle , content:editContent} :note ))
           setEditingId(null)
      } catch (error) {
        
      }
    }
    const cancelEdit = () =>{
      setEditingId(null) 
    }

  return (
    <div>
        <h1>My Notes</h1>
       {/* Notes Form */}
       <div>
           <input type="text" placeholder="Title" value={title}  onChange={(e)=>setTitle(e.target.value)} />
            <br />
            <textarea name="" id="" onChange={(e)=>{setContent(e.target.value)}} placeholder="Content" value={content} ></textarea>
            <br />
            <button onClick={HandleAdd} >Add Note</button>

       </div>
       {
        notes.map((note )=>{
          return <div key={note._id} >
            {/* edit */}

            {editingId === note._id ? (
              <div>
                <input type="text" value={editTitle} onChange={(e) =>setEditTitle (e.target.value)} />
                <textarea value={editContent} onChange={(e)=>setEditContent(e.target.value)} />
                  <button onClick={()=> SaveEdit(note._id)} >Save</button>
                  <button onClick={cancelEdit} >Cancel</button>
              </div>
            ) : (
              <div>
                                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <small>Important:{note.important ? 'yes' :'No'}</small>
                <br />
                    <button onClick={()=>HandleDelete(note._id)} >Delete</button>
                    <button onClick={()=>HandleEdit(note)} >Edit</button>
                    <button onClick={()=> handleImportant (note._id , note.important)} > {note.important? 'unmark important' : 'mark impotant'} </button>

              </div>
            ) }

          </div>
        })
       }
  
   
        <p>{notes.length}</p>
      
    </div>
  )
}

export default Home

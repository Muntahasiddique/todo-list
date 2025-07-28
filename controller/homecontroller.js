function todohome(req , res){
    res.render("index" , {title : "index"});
}
module.exports={
    todohome:todohome
}
function todohome(req , res){
    res.render("index" , {title : "index"});
}
function todohome(req, res) {
    // Check for dark mode preference (default to system preference)
    const darkMode = req.cookies?.darkMode === 'true' || 
                   (req.cookies?.darkMode !== 'false' && 
                    req.headers['sec-ch-prefers-color-scheme'] === 'dark');

    res.render("index", { 
        title: "To-Do List",
        darkMode 
    });
}

module.exports = {
    todohome
};

const express=require("express");
const app=express();
const mongoose=require("mongoose");
require("dotenv").config();
const cors=require("cors");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
const multer = require("multer");
const auth=require("./midllewares/authenticate");
const authorize=require("./midllewares/authorization");
const User=require("./models/user");
const Hagz=require("./models/Hagz");
const Team = require('./models/Team');
const Match = require('./models/match');
const Player=require("./models/Player")
mongoose.connect(process.env.mongoUrl).then(()=>{
console.log("connected");
}).catch(()=>{
    console.log("error");
})
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "photos/"); // Folder to save
  },
  filename: (req, file, cb) => {
    const ext=file.mimetype.split("/")[1];
    const filename = `Photo-${Date.now()}.${ext}`;
    cb(null, filename); 
  },
});
const upload = multer({ storage });
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());
app.use('/photos', express.static('photos'));
app.get("/",(req,res)=>{
res.render("home page.ejs",{error:null})
})
app.get("/register",(req,res)=>{
    res.render("SignUp.ejs",{error:null});
})
app.post("/register",async(req,res)=>{
    const{username,email,password,confirmPassword}=req.body;
    const existinguser=await User.findOne({username});
    const hashed=await bcrypt.hash(password,10);
    if(existinguser){
       return res.render("SignUp.ejs",{error:"User Already Exists"})
    }
    else if(username.includes(" ")){
       return res.render("SignUp.ejs",{error:"Username Can’t Contain Spaces"})
    }
     else if(password.length<6){
       return res.render("SignUp.ejs",{error:"Password Should Contain 6 Characters"})
    }
    else if(password!==confirmPassword){
       return res.render("SignUp.ejs",{error:"Confirm Password Is wrong"})
    }
    else{
        const new_user=new User({
            username,
            email,
            password:hashed
        })
        await new_user.save();
    }
    
    res.redirect("/login");
})
app.get("/login",(req,res)=>{
    const message=req.query.message||null;
    res.render("LogIn.ejs",{message,error:null});
})
app.post("/login",async(req,res)=>{
    const{username,password}=req.body;
    const message=req.query.message||null;
    const found=await User.findOne({username});
    if(username.includes(" ")){
        return res.render("Login.ejs",{message,error:"Username Can,t Contain Spaces"})
    }
    if(!found){
        return res.render("LogIn.ejs",{message,error:"User Not Found"});
    }
    const matchpass=await bcrypt.compare(password,found.password);
    if(found&&matchpass){
        const token=jwt.sign({username:found.username,email:found.email,role:found.role},process.env.Jwt_secretKey)
        res.cookie("token",token);
        res.redirect("/dashboard")
    }
    else{
        res.render("LogIn.ejs",{message,error:"Enter Valid Cardinalities"})
    }
    
})
app.get("/dashboard",auth,authorize("USER","ADMIN"),async(req,res)=>{
    const Hgozat=await Hagz.find({createdBy:req.user.username});
    res.render("Dashboard.ejs",{Hgozat,error:null});
})
app.get("/logout",auth,authorize("USER","ADMIN"),(req,res)=>{
    res.clearCookie("token");
    res.redirect("/login?message=Logged Out Sucsesfully");
})
app.get("/addHagz",auth,authorize("USER","ADMIN"),(req,res)=>{
    res.render("add hagz.ejs",{error:null})
})
app.post("/addHagz",auth,authorize("USER","ADMIN"),async(req,res)=>{
    const{name,date,location}=req.body;
    const newHagz=new Hagz({
        name,
        date,
        location,
        createdBy:req.user.username
    })
    await newHagz.save();
    res.redirect("/dashboard")
})
app.get("/edit/:id",auth,authorize("USER","ADMIN"),async(req,res)=>{
const hte_id=req.params.id;
const hte=await Hagz.findById(hte_id)
res.render("edithagz.ejs",{hte,error:null});
})
app.post("/edit/:id",auth,authorize("USER","ADMIN"),async(req,res)=>{
const hte_id=req.params.id;
const {title,date,location}=req.body;
await Hagz.findByIdAndUpdate(hte_id,{
    name:title,
    date,
    location
})
res.redirect("/dashboard")
})
app.post("/deleteHagz/:id",auth,authorize("USER","ADMIN"),async(req,res)=>{
    const htd_id=req.params.id;
    await Hagz.findByIdAndDelete(htd_id);
    res.redirect("/dashboard")
})
app.get('/hagz/:id',auth,authorize("USER","ADMIN"), async (req, res) => {
  try {
    const hagz = await Hagz.findById(req.params.id);
    const teams = await Team.find({ hagz: hagz._id });
   const matches = await Match.find({ hagz: req.params.id })
  .populate("teamA", "name") // populate only the name field
  .populate("teamB", "name")
    res.render('hagzDetails.ejs', {
      hagz,
      teams,
      matches
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading hagz details');
  }
});
app.get("/add-team/:id",async(req,res)=>{
    const hagz=await Hagz.findById(req.params.id);
    res.render("addteam.ejs",{hagz,error:null})
})
app.post("/add-team/:id", async (req, res) => {
    try {
        const hagz = await Hagz.findById(req.params.id);
        if (!hagz) {
            return res.status(404).send("الحجز غير موجود");
        }

        const { teamName, members } = req.body; // members is an array now
        if (!teamName || !members || members.length === 0) {
            return res.status(400).send("يجب إدخال اسم الفريق وأعضاءه");
        }

        const playerIds = [];

        // Loop over each entered player name
        for (const name of members) {
            const trimmedName = name.trim();
            if (!trimmedName) continue;

            // Case-insensitive search to prevent duplicates
            let player = await Player.findOne({ name: new RegExp(`^${trimmedName}$`, "i") });
            if (!player) {
                player = await Player.create({ name: trimmedName });
            }
            playerIds.push(player._id);
        }

        // Create the new team
        const newTeam = await Team.create({
            name: teamName.trim(),
            members: playerIds,
            hagz: hagz._id
        });

        // Link team to Hagz
        hagz.teams.push(newTeam._id);
        await hagz.save();

        res.redirect(`/hagz/${hagz._id}`);
    } catch (error) {
        console.error("خطأ أثناء إضافة الفريق:", error);
        res.status(500).send("حدث خطأ في الخادم");
    }
});
app.get("/add-match/:id",async(req,res)=>{
    const hagz=await Hagz.findById(req.params.id)
    const teams=await Team.find({hagz:req.params.id})
    res.render("addmatch.ejs",{hagz,teams,error:null})
})
app.post("/add-match/:id", async (req, res) => {
  try {
    const hagz = await Hagz.findById(req.params.id);
    if (!hagz) return res.status(404).send("Hagz not found");

    const { team1, team2 } = req.body;

    // Create new match
    const newMatch = new Match({
      hagz: hagz._id,
      teamA: team1,
      teamB: team2
    });

    await newMatch.save();

    // Add match reference to hagz
    hagz.matches.push(newMatch._id);
    await hagz.save();

    res.redirect(`/hagz/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding match");
  }
});


app.listen(process.env.port,()=>{
    console.log("connected on port 3000")
})

const express = require('express');
const { CarRent,users } = require('./models'); 
const { connection } = require('./postgres.js');
var csrf=require('csurf');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const bcrypt=require('bcrypt');

const saltRounds=10;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("ssh the secret thing"));
app.use(csrf({cookie:true}))
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

connection();
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


const flash = require('express-flash');
app.use(flash());






const passport=require('passport')
const  connectEnsureLogin=require('connect-ensure-login')
const session=require('express-session')
const localStrategy=require('passport-local')

app.use(session({
  secret: "my-secret-key-12345",
  resave: false,
  saveUninitialized: true, 
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  }
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await users.findOne({ where: { email: email } });

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const result = await bcrypt.compare(password, user.password);

      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    } catch (error) {
      return done(error);
    }
  }
));





passport.serializeUser((user,done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


app.get('/', (req, res) => {
  res.render('new1');
});




app.get('/admin',connectEnsureLogin.ensureLoggedIn('/asignup'), async (req, res) => {
  try {
    const cars = await CarRent.findAll();
    res.render('admin', { cars,csrfToken:req.csrfToken()});
  } catch (err) {
    console.error("Error Occurred", err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin', async (req, res) => {
  console.log("Creating a sport ", req.body);
  try {

      await CarRent.addCar({
          sname: req.body.sname,
          vno: req.body.vno,
          sno: req.body.sno,
          rpd:req.body.rpd

      });

      return res.redirect('/admin');
  } catch (err) {
      console.error("Error Occurred", err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});









app.get('/Rent',(req,res)=>{
  res.render('Renting');
})







app.get('/play',connectEnsureLogin.ensureLoggedIn('/asignup'),async(req,res)=>{
  try {
      const cars = await CarRent.findAll(); 
      res.render('playersession', {cars,csrfToken:req.csrfToken() });
  } catch (err) {
      console.error("Error Occurred", err);
      res.status(500).send('Internal Server Error');
  }
})



app.post('/psignup', async (req, res) => {

  try {
    const hashedpwd=await bcrypt.hash(req.body.password,saltRounds);
    console.log("Adding a User ", req.body);
    const { name, email} = req.body;

    const user=await users.addadmin({
      name,
      email,
      password:hashedpwd,
    });
   
    req.login(user,(err)=>{
      if(err){
        console.log(err)
      }
      return res.redirect('/play');
    })
  } catch (err) {
    console.error("Error Occurred", err);
    return res.status(500).json({ error: 'Sorry Invalid Credentials', details: err.message });
  }
});

app.post('/asignup', async (req, res) => {
  try {
    const hashedPwd=await bcrypt.hash(req.body.password,saltRounds);
    console.log("Adding a User ", req.body);
 
    const {email} = req.body;
    const name=req.body.name;
    console.log(name);
    console.log(email);
   const user= await users.addadmin({
      name,
      email,
      password:hashedPwd,
      
    });
    req.login(user,(err)=>{
      if(err){
        console.log(err)
      }
      return res.redirect('/admin');
    })
  } catch (err) {
    console.error("Error Occurred", err);
    return res.status(500).json({ error: 'Sorry, Please Enter Valid Credentials', details: err.message });
  }
});


app.post('/alogin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).send('<script>alert("Internal Server Error. Please try again later."); window.location="/alogin";</script>');
    }
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.status(401).send('<script>alert("Invalid credentials. Please try again."); window.location="/asignup";</script>');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.status(500).send('<script>alert("Internal Server Error. Please try again later."); window.location="/asignup";</script>');
      }
      return res.redirect('/admin');
    });
  })(req, res, next);
});
app.post('/plogin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).send('<script>alert("Internal Server Error. Please try again later."); window.location="/plogin";</script>');
    }
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.status(401).send('<script>alert("Invalid credentials. Please try again."); window.location="/psignup";</script>');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.status(500).send('<script>alert("Internal Server Error. Please try again later."); window.location="/psignup";</script>');
      }
      return res.redirect('/play');
    });
  })(req, res, next);
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('<script>alert("Internal Server Error. Please try again later."); window.location="/";</script>');
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private'); 
    res.send('<script>window.location.href = "/";</script>'); 
  });
});


app.use((err, req, res, next) => {
  console.error('An unexpected error occurred:', err);
  res.status(500).send('Internal Server Error');
});

app.get('/psignup',(req,res)=>{
  res.render('psign',{csrfToken:req.csrfToken()});
})
app.get('/asignup',(req,res)=>{
  res.render('asignup',{csrfToken:req.csrfToken()});
  
})

app.post("/delete", async (req, res) => {
 
  await CarRent.destroy({ where: { id: req.body.id } });
   
  res.redirect("/admin");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server started running on port 3000');
});



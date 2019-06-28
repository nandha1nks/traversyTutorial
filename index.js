const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {check , expressValidator } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb',{useNewUrlParser:true});
let db = mongoose.connection;

//check connection
db.once('open',()=>{
	console.log('Connected to Mongodb');
});

//Check for db Errors
db.on('error',(err)=>{
	console.log(err);
});

//Init app
const app = express();

//Bring in Models
let Article = require('./models/article');

//Load View Engine
app.set("views",path.join(__dirname, "views"));
app.set('view engine','pug');

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
      var root    = namespace.shift();
      var formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Home Route
app.get('/', (req,res)=>{

	Article.find({},(err,articles)=>{
		if(err){
			console.log(err);
		}
		else{
			res.render('index',{
				title:"Articles",
				articles:articles
			});
		}
	});
});

// Get Single Article
app.get('/article/:id',function(req,res){
	Article.findById(req.params.id, (err,article)=>{
		res.render("article",{
			article: article
		});
	});
});

//Add Route
app.get('/articles/add',(req,res)=>{
	res.render('add_article',{
		title:"Add Article"
	});
});

//Add Submit POST Route
app.post('/articles/add',function(req,res){
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('/');
		}
	});
});

// Load Edit Form
app.get('/article/edit/:id',function(req,res){
	Article.findById(req.params.id, (err,article)=>{
		res.render("edit_article",{
			article: article
		});
	});
});

//Add Submit POST Route
app.post('/articles/edit/:id',function(req,res){
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id}

	Article.update(query,article,function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('/');
		}
	});
});

// Delete Request
app.delete('/article/:id',(req,res)=>{
	let query = {_id:req.params.id}
	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		res.send("success");
	});
});

//Start Server
app.listen(3000, ()=>{
	console.log('Server started at port no 3000...')
});

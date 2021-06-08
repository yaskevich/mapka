var express        = require('express'),
    bodyParser     = require('body-parser'),
    cookieParser   = require('cookie-parser'),
    exphbs         = require('express-handlebars'),
    i18n			= require('i18n'),
	minifyHTML		= require('express-minify-html');

var app = express();	

// you'll need cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());	
app.use(minifyHTML({
    override:      true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('top.db');

// db.serialize(function() {
// db.run("CREATE TABLE lorem (info TEXT)");

	  // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
	  // for (var i = 0; i < 3; i++) {
		  // stmt.run("Ipsum " + i);
	  // }
	  // stmt.finalize();
// });
	  
i18n.configure({
  locales: ['be', 'ru', 'en'],
  fallbacks: {'ua': 'hu'},
  defaultLocale: 'be',
  cookie: 'locale',
  queryParameter: 'lang',
  directory: __dirname + '/locales',
  directoryPermissions: '755',
  autoReload: true,
  updateFiles: true,
  syncFiles: true,
  api: {
    '__': '__',  //now req.__ becomes req.__
    '__n': '__n' //and req.__n can be called as req.__n
  }
});

// setup hbs
app.set('views', "" + __dirname + "/views");
// app.set('view engine', 'hbs');
// app.engine('hbs', hbs.__express);

// app.use(express.static('public'));
// app.use('/static', express.static(__dirname + '/public'));

app.engine('.hbs', exphbs({
  extname: '.hbs',
  // defaultLayout: 'index',
  defaultLayout: 'main',
  helpers: {
    __: function() { return i18n.__.apply(this, arguments); },
    __n: function() { return i18n.__n.apply(this, arguments); }
  }
}));
app.set('view engine', '.hbs');

// init i18n module for this loop
app.use(i18n.init);

// http://127.0.0.1:3000/hu
app.get('/ru', function (req, res) {
  res.cookie('locale', 'ru', { maxAge: 900000, httpOnly: false });
  res.redirect('back');
  console.log("loc:ru");
});

// http://127.0.0.1:3000/en
app.get('/en', function (req, res) {
  res.cookie('locale', 'en', { maxAge: 900000, httpOnly: false});
  res.redirect('back');
  console.log("loc:en");
});

app.get('/be', function (req, res) {
  res.cookie('locale', 'be', { maxAge: 900000, httpOnly: false});
  res.redirect('back');
  console.log("loc:be");
});

app.get('/test', function (req, res) {
  res.json({ items: [1,2,3] });
});

app.get('/ds1.json', function (req, res) {
	
	
	db.serialize(function() {
		var fruits = [];
	  // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
		  // console.log(row.id + ": " + row.info);
		  // fruits.push("lol");
		  // console.log(fruits);
	  // });
	  db.all("SELECT id, osm_id_rel, name_ru as name FROM beladmdiv where adm_lvl =2 and is_area=1", function(err, row){
		  // console.log(row);
        res.json(row);
		});
	  // console.log(fruits);
	// db.close();
		// res.json({ items: fruits });
	});

	
});
app.get('/units/:type/:lang', function (req, res) {
	var lvl = parseInt(req.params.type);
	var lang = req.params.lang;
	if ([2].indexOf(lvl) === -1){ lvl = 2;}
	if (['be','ru'].indexOf(lang) === -1){ lang = 'ru';}
	// console.log("lvl", lvl, lang);
	
	db.serialize(function() {
	  db.all("SELECT id, name_"+lang+" as name FROM beladmdiv where adm_lvl ="+lvl+" and is_area=1", function(err, row){
		  var obj = {};
		  for(var i in row){
			  obj[row[i].id] = row[i].name;
		  }
			res.json(obj);
		});
	});
});
app.get('/ds22.json', function (req, res) {
	
	
	db.serialize(function() {
	  db.all("SELECT id, name_ru as name FROM beladmdiv where adm_lvl =2 and is_area=1", function(err, row){
		  var obj = {};
		  for(var i in row){
			  obj[row[i].id] = row[i].name;
		  }
			res.json(obj);
		});
	});

	
});

// serving homepage
app.get('/cook', function (req, res) {
	// res.cookie('locale', 'hu', { maxAge: 900000, httpOnly: true });
	// res.cookie('cart', { items: [1,2,3] });
	// console.log('Cookies: ', res.cookies);
	console.log("render main");
	console.log('Cookies: ', req.cookies);
	res.render('index');
});
app.get('/', function (req, res) {
	// res.cookie('locale', 'hu', { maxAge: 900000, httpOnly: true });
	// res.cookie('cart', { items: [1,2,3] });
	// console.log('Cookies: ', res.cookies);
	console.log("render home");
	// console.log('Cookies: ', req.cookies);
	res.cookie('locale', req.cookies.locale ? req.cookies.locale : 'be', { maxAge: 900000, httpOnly: false});
	res.render('home');
});
// app.use('/static', express.static(__dirname + '/public'));	  
// app.use('/static', express.static('../mapka'));	  
app.use(express.static('../mapka'));

// startup
app.listen(80);
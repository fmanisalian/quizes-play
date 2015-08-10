var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require ('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
//app.use(session());
//app.use(session({cookie:{maxAge: 120000}}));
app.use(session( {secret: 'Quiz 2015'}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Midleware de autologout - Tiempo de sesion

app.use(function(req, res, next){
    var tiempoSesion = 120000;
    if (req.session.user) { //Si se ha iniciado sesion comprobamos que no ha caducado la sesión
        if (req.session.horaCaducaSesion > (new Date()).getTime()) { // Si no ha caducado la sesión, actualizamos hora de expiracion
            req.session.horaCaducaSesion = (new Date()).getTime() + tiempoSesion; 
            next();
        } else {
            //req.session.destroy(); // Si la sesion ha caducado la cerramos:
            delete req.session.user;   
            delete req.session.horaCaducaSesion;
            res.redirect(req.session.redir.toString()); // redirect a path anterior a login
        }
    } else {
        next(); // Si no hay sesión iniciada no hacemos nada
    }
});

// Helpers dinámicos:
app.use(function(req, res, next) {
    if (!req.session.redir) {       // si no existe lo inicializa
        req.session.redir = '/';
    }

    // Guardar path en session.redir para después de login:
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    // Hacer visible req.session en las vistas:
    res.locals.session = req.session;
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;

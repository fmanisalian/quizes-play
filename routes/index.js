var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var statisticsController = require('../controllers/statistics_controller');
var userController = require('../controllers/user_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: []});
});

//Autoload de comandos con :quizId
router.param('quizId', quizController.load); //autoload :quizId
router.param('commentId', commentController.load);  //autoload :commentId
router.param('userId', userController.load); 	//autoload :userId

//Definición de rutas de sesión:
router.get('/login', sessionController.new); 		//formulario login
router.post('/login', sessionController.create);	//crear sesión
router.get('/logout', sessionController.destroy);	//destruír sesión

//Definición de rutas de cuenta:
router.get('/user', userController.new); 	//formulario sign up
router.post('/user', userController.create); 	//registrar usuario
router.get('/user/:userId(\\d+)/edit', sessionController.loginRequired, userController.edit);
router.put('/user/:userId(\\d+)', sessionController.loginRequired, userController.update);
router.delete('/user/:userId(\\d+)', sessionController.loginRequired, userController.destroy);

//Definición de rutas de /quizes:
router.get('/quizes', quizController.index);
router.get('/quizes/:quizId(\\d+)', quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new', sessionController.loginRequired, quizController.new);
router.post('/quizes/create', sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',  sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)', sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)', sessionController.loginRequired, quizController.destroy);

//Definición de rutas de comentarios:
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.loginRequired, commentController.publish);

// Definición de ruta para las estadísticas:
router.get('/statistics', statisticsController.calculate, statisticsController.show);

router.get('/author', function(req, res) {
	res.render('author', { title: 'Autores', errors: []});
});

module.exports = router;
var models = require('../models/models.js');

//MW que permite acciones solamente si el quiz objeto
//pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId)},
		include: [{ model: models.Comment}]
	}).then (
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) {next(error);});
};

//GET /quizes?search=texto_a_buscar:
/*exports.index = function(req, res) {
	if (req.query.search) {
		var criterio = ('%' + req.query.search + '%').replace(/ /g, '%');			
		models.Quiz.findAll({
			where: ["pregunta like ?", criterio],
			order: 'pregunta ASC'
		}).then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, errors: []});
		}
		).catch(function(error) { next(error);})
	}
	else {
		models.Quiz.findAll().then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, errors: []});
		}
	).catch(function(error) { next(error);})
	}	
};*/

// GET /quizes?search=texto_a_buscar
// Código más eficiente que, para seleccionar, 
// no tiene en cuenta si escribimos en minúsculas o mayúsculas:
exports.index = function(req, res) {
  	var criterio = "%";
  	
  	if(req.query.search != undefined)
  	{
  		criterio = "%" + req.query.search + "%";
  		criterio = criterio.trim().replace(/\s/g,"%");
  	}

 	 models.Quiz.findAll({where:["upper(pregunta) like ?", criterio.toUpperCase()], order: 'pregunta ASC'}).

	then(
  		function(quizes) {
    		res.render('quizes/index', { quizes: quizes,    errors: []});
   		}
  	).catch(function(error) { next(error);})
};

//GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';

	var rpta_usuario = req.query.respuesta;
	rpta_usuario = rpta_usuario.trim().toUpperCase();

	var rpta_correcta = req.quiz.respuesta;
	rpta_correcta = rpta_correcta.toUpperCase();

	if (rpta_usuario === rpta_correcta) { resultado = 'Correcto';}

	/*if (req.query.respuesta === req.quiz.respuesta) {
			resultado = 'Correcto';
		}*/

	res.render ('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(	//crea objeto quiz
			{pregunta: "Pregunta", respuesta: "Respuesta"}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

//POST /quizes/create
exports.create = function(req, res) {
	req.body.quiz.UserId = req.session.user.id;
	var quiz = models.Quiz.build (req.body.quiz);	

	quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz 	//save: guarda en DB los campos pregunta y respuesta de quiz
				.save({fields: ["pregunta", "respuesta", "tema", "UserId"]})
				.then(function(){ res.redirect('/quizes')})	//res.redirect: Redirección HTTP (URL relativo) a lista de preguntas
			}
		}
	);
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;     //autoload de instancia de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz 	//save: guarda campos pregunta y respuesta en DB
				.save( {fields: ["pregunta", "respuesta", "tema"]})
				.then( function() { res.redirect('/quizes');});
			}	//Redirecciona HTTP a lista de preguntas (URL relativo)			
		} 
	)
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function() {
		res.redirect('/quizes');
	}).catch(function(error) {next(error)});
};
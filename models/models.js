var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

//Cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres:
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);

//Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
//Importar definición de la tabla Comment en comment.js
var Comment = sequelize.import(path.join(__dirname, 'comment'));

//Importar definición de la tabla User
var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

//Establecer relaciones entre las tablas
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

//los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

exports.Quiz = Quiz; //exportar definición de tabla Quiz
exports.Comment = Comment;  //exportar definición de tabla Comment
exports.User = User; 	//exportar definición de tabla User

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
	//then(...) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function (count) {
		if (count === 0) {	//la tabla se inicializa solo si está vacía
			User.bulkCreate(
					[
						{ username: 'admin', password: '1234', isAdmin: true},
						{ username: 'pepe', password: '5678'}	//isAdmin por defecto: 'false'
					]
				).then (function() {
					console.log('Base de datos (tabla user) inicializada');
					Quiz.count().then(function(count) {
						if (count === 0) {	//la tabla se inicializa solo si está vacía
							Quiz.bulkCreate(	//estos quizes pertenecen al usuario pepe (2)
									[
										{pregunta: 'Capital de Italia', respuesta: 'Roma', tema: 'humanidades', UserId: 2},
										{pregunta: 'Capital de Portugal', respuesta: 'Lisboa', tema: 'humanidades', UserId: 2}
									]
								).then (function() {console.log('Base de datos (tabla quiz) inicializada')});
						};
					});
				});

			/*Quiz.create({ 
				pregunta: 'Capital de Italia',
				respuesta: 'Roma',
				tema: 'humanidades'
			});
			Quiz.create({
				pregunta: 'Capital de Portugal',
				respuesta: 'Lisboa',
				tema: 'humanidades'
			})
			.then(function() {console.log('Base de datos inicializada')});*/
		};
	});
});
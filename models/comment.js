// Definición del modelo de Comment con validación:

module.exports = function(sequelize, DataTypes) {
	return sequelize.define (
		'Comment',
		{ texto: {
			type: DataTypes.STRING,
			validate: { notEmpty: {msg: "--> Falta Comentario"}}
		},
		publicado: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
		},
		{
			classMethods: {
    			countUnpublished: function () {
        			return this.count({'where': {'publicado': false}}).then('success', function(count) {
        				return count;   
        			})	 //función "count"
      			},
      			countCommentedQuizes: function () {
        			return this.aggregate('QuizId', 'count', { distinct: true }).then('success', function(count) {
        				return count;
        			})   //función "aggregate"
      			}
    		}
		}
	);
};
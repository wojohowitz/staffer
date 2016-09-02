'use strict';
module.exports = function(sequelize, DataTypes) {
  var Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    hireDate: DataTypes.DATEONLY,
    terminationDate: DataTypes.DATEONLY
  }, {
    classMethods: {
      associate: function(models) {
        Employee.belongsTo(models.Employee, {
          as: 'supervisor',
        }),
        Employee.hasMany(models.Employee, {as: 'emloyees', foreignKey: 'supervisorId'})
      }
    }
  });
  return Employee;
};

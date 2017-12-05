var Migrations = artifacts.require("./Migrations.sol");
var Conference = artifacts.require("./Conference.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Conference);//debo agregar esto para que me haga el deploy del conference.sol y luego ejecutar truffle.migrate en node
};

var Conference = artifacts.require("./Conference.sol");

contract('Conference', function(accounts) {
	console.log(accounts);
	var owner_account = accounts[0];
  var sender_account = accounts[1];


  it("La configuracion inicial deberia matchear", function(done) {
  	
  	Conference.new({from: owner_account}).then(
  		function(conference) {
  			
  			//Modifying any value in a contract is a transaction. Just checking a variable value is not. So don’t forget to add call() when calling variables!
  			conference.quota.call().then(
  				function(quota) { 
  					assert.equal(quota, 25, "El cupo de personas no coincide!"); 
  			}).then(
  				function() { 
  					return conference.numRegistrants.call(); 
  			}).then(
  				function(num) { 
  					assert.equal(num, 0, "La cantidad de registrantes no coinciden!");
  					return conference.organizer.call();
  			}).then(
  				function(organizer) { 
  					assert.equal(organizer, owner_account, "El dueño no matchea!");
  					done();
  			}).catch(done);
  	}).catch(done);
  });

  it("Deberia actualizar el cupo", function(done) {
  	
  	Conference.new({from: owner_account}).then(
  		function(conference) {
  			conference.quota.call().then(
  				function(quota) { 
  					assert.equal(quota, 25, "El cupo de personas no coincide!"); 
  			}).then(
  				function() { 
  					return conference.changeQuota(50); //esto cambia la cantidad de personas aumentando el cupo a 50
  			}).then(
  				function() { 
  					return conference.quota.call()
  			}).then(
  				function(quota) { 
  					assert.equal(quota, 50, "El nuevo cupo no es correcto!");
  					done();
  			}).catch(done);
  	}).catch(done);
  });




it("Solo el dueño deberia poder hacer un refund", function(done) {
  Conference.new({ from: owner_account }).then(
    function(conference) {
      var ticketPrice = web3.toWei(.05, 'ether');
      var initialBalance = web3.eth.getBalance(conference.address).toNumber();

// la cuenta nro 2 compra un ticket. Luego chequeo que el balnce del contrato se haya actualizado y que haya aumentado la cantidad de registrantes
        conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
       function() {
         var newBalance = web3.eth.getBalance(conference.address).toNumber();
         var difference = newBalance - initialBalance;
         assert.equal(difference, ticketPrice, "La diferencia deberia ser lo que se envio");
         // Ahora intentemos hacer un refund como segundo usuario, deberia fallar
         return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[1]});
       }).then(function() {var balance = web3.eth.getBalance(conference.address).toNumber();
       assert.equal(web3.toBigNumber(balance), ticketPrice, "El Balance no deberia haber cambiado");
       //  Ahora intentemos hacer un refund como organizador, deberia andar
       return conference.refundTicket(accounts[1], ticketPrice, {from: owner_account});
     }).then( function() {
       var postRefundBalance = web3.eth.getBalance(conference.address).toNumber();
       assert.equal(postRefundBalance, initialBalance, "El Balance deberia ser el inicial porque se hizo un refund");
       done();
     }).catch(done);
  }).catch(done);
});

it("Debo dejarte comprar", function(done) {
  Conference.new({ from: owner_account }).then(
    function(conference) {
    var ticketPrice = web3.toWei(.05, 'ether');
    var initialBalance = web3.eth.getBalance(conference.address).toNumber();

        // si hiciese esto en mainnet deberia pedirme el PK de la cuenta 1
  			conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
        function() {
         var newBalance = web3.eth.getBalance(conference.address).toNumber();
         var difference = newBalance - initialBalance;
         assert.equal(difference, ticketPrice, "La diferencia deberia ser lo que se envio");
         return conference.numRegistrants.call();
      }).then(
       function(num) {
         assert.equal(num, 1, "deberia haber una persona registrada al curso"); 
         return conference.registrantsPaid.call(sender_account);
         // return conference.registrantsPaid.call(accounts[1]);
      }).then(function(amount) {
         assert.equal(amount.toNumber(), ticketPrice, "El que envio no esta en la lista");
         return web3.eth.getBalance(conference.address);
  			}).then(
  				function(bal) {
            assert.equal(bal.toNumber(), ticketPrice, "El balance final no coincide");
         done();
      }).catch(done);
   }).catch(done);
});	
	
});


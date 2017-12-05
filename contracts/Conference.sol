pragma solidity ^0.4.4;

contract Conference { 
  address public organizer; // este es el dueño
  mapping (address => uint) public registrantsPaid; //aca almaceno cuanto pago cada registrante. Lo uso para devolver los fondos
  uint public numRegistrants;
  uint public quota;

	event Deposit(address _from, uint _amount); // para loguear el evento buyTicket() 
	event Refund(address _to, uint _amount); // para loguear el evento refundTicket()
  
  function Conference() public {
    organizer = msg.sender;
    quota = 25; // cupo de registrantes
    numRegistrants = 0;
  }
  
	function buyTicket() payable public {
		if (numRegistrants >= quota) { 
			throw; // si el numero de registrantes excede la cuota se ejecuta un throw para devolveerle el dinero
		}
     registrantsPaid[msg.sender] = msg.value;
     numRegistrants++;
     Deposit(msg.sender, msg.value);
  }

  function changeQuota(uint newquota) public {
    if (msg.sender != organizer) { return; }
    quota = newquota;
  }

	function refundTicket(address recipient, uint amount) payable public {
		if (msg.sender != organizer) { return; }
  if (registrantsPaid[recipient] == amount) {
    
    if (this.balance >= amount) { //this es el address del contrato
      registrantsPaid[recipient] = 0; //para evitar el bug de reentry de DAO tengo que ejecutar esto antes de hacer el send del monto
        numRegistrants--;
        Refund(recipient, amount);
        recipient.transfer(amount);
    }
  }
  return;
}

  // tengo que agregarle un require para que esta funcion no sea ejecutada por nadie mas que el owner del contrato
  function destroy() public { // so funds not locked in contract forever
  	
  // probar esto si es igual a lo de abajo require(msg.sender == owner)
    if (msg.sender == organizer) { // solo si lo ejecuta el dueño
      selfdestruct(organizer); // devolver los fondos al dueño
    }
  }
}
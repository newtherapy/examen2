App = {
  web3Provider: null,
  contracts: {},

  init: function() {
  
    return App.initWeb3();
  },
  
  
// ->> Aca pongo lo de pet shop tutorial para levantar el front end
// alert("No anda. Make sure your Ethereum client is configured correctly.");
  	

  initWeb3: function() {
  	
  // Is there is an injected web3 instance?
if (typeof web3 !== 'undefined') {
  App.web3Provider = web3.currentProvider;
} else {
  // If no injected web3 instance is detected, fallback to the TestRPC
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:3000');
}
web3 = new Web3(App.web3Provider);

    App.initContract();
    
    App.initializeConference();
  },
// <--

// ->> Aca pongo lo de pet shop tutorial para levantar el front end
  initContract: function() {
 
     getJSON('../build/contracts/Conference.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
  var ConferenceArtifact = data;
  App.contracts.Conference = TruffleContract(ConferenceArtifact);

  // Set the provider for our contract
  App.contracts.Conference.setProvider(App.web3Provider);
  
});

  },
// <--
  
var accounts, account;
var myConferenceInstance;


// Initialize
function initializeConference() {
	
	// Get the contract instance using your contract's abi and address:
        //const myConferenceInstance = web3.eth.contract(abi).at(contractAddress);
	
	Conference.new({from: accounts[0], gas: 3141592}).then(
	function(conf) {
		console.log(conf);
		myConferenceInstance = conf;
		$("#confAddress").html(myConferenceInstance.address);
		checkValues();
	});
}

// Check Values
function checkValues() {
	myConferenceInstance.quota.call().then(
		function(quota) { 
			$("input#confQuota").val(quota);
			return myConferenceInstance.organizer.call();
	}).then(
		function(organizer) { 
			$("input#confOrganizer").val(organizer);
			return myConferenceInstance.numRegistrants.call(); 
	}).then(
		function(num) { 
			$("#numRegistrants").html(num.toNumber());
			return myConferenceInstance.organizer.call();
	});
}

// Change Quota
function changeQuota(val) {
	myConferenceInstance.changeQuota(val, {from: accounts[0]}).then(
		function() {
			return myConferenceInstance.quota.call();
		}).then(
		function(quota) {
			if (quota == val) {
				var msgResult;
				msgResult = "Change successful";
			} else {
				msgResult = "Change failed";
			}
			$("#changeQuotaResult").html(msgResult);
		});
}

// buyTicket
function buyTicket(buyerAddress, ticketPrice) {

	myConferenceInstance.buyTicket({ from: buyerAddress, value: ticketPrice }).then(
		function() {
			return myConferenceInstance.numRegistrants.call();
		}).then(
		function(num) {
			$("#numRegistrants").html(num.toNumber());
			return myConferenceInstance.registrantsPaid.call(buyerAddress);
		}).then(
		function(valuePaid) {
			var msgResult;
			if (valuePaid.toNumber() == ticketPrice) {
				msgResult = "Purchase successful";
			} else {
				msgResult = "Purchase failed";
			}
			$("#buyTicketResult").html(msgResult);
		});
}

// refundTicket
function refundTicket(buyerAddress, ticketPrice) {

		var msgResult;

		myConferenceInstance.registrantsPaid.call(buyerAddress).then(
		function(result) {
			if (result.toNumber() == 0) {
				$("#refundTicketResult").html("Buyer is not registered - no refund!");
			} else {		
				myConferenceInstance.refundTicket(buyerAddress, 
					ticketPrice, {from: accounts[0]}).then(
					function() {
						return myConferenceInstance.numRegistrants.call();
					}).then(
					function(num) {
						$("#numRegistrants").html(num.toNumber());
						return myConferenceInstance.registrantsPaid.call(buyerAddress);
					}).then(
					function(valuePaid) {
						if (valuePaid.toNumber() == 0) {
							msgResult = "Refund successful";
						} else {
							msgResult = "Refund failed";
						}
						$("#refundTicketResult").html(msgResult);
					});	
			}
		});
}

// createWallet
function createWallet(password) {

	var msgResult;

	var secretSeed = lightwallet.keystore.generateRandomSeed();

	$("#seed").html(secretSeed);

	lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {

		console.log("createWallet");

		var keystore = new lightwallet.keystore(secretSeed, pwDerivedKey);

		// generate one new address/private key pairs
		// the corresponding private keys are also encrypted
		keystore.generateNewAddress(pwDerivedKey);

		var address = keystore.getAddresses()[0];

		var privateKey = keystore.exportPrivateKey(address, pwDerivedKey);

		console.log(address);

		$("#wallet").html("0x"+address);
		$("#privateKey").html(privateKey);
		$("#balance").html(getBalance(address));


		// Now set ks as transaction_signer in the hooked web3 provider
		// and you can start using web3 using the keys/addresses in ks!

		switchToHooked3(keystore);

	});
}

function getBalance(address) {
	return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether');
}

// switch to hooked3webprovider which allows for external Tx signing
// (rather than signing from a wallet in the Ethereum client)
function switchToHooked3(_keystore) {

	console.log("switchToHooked3");

	var web3Provider = new HookedWeb3Provider({
	  host: "http://localhost:3000", // check what using in truffle.js
	  transaction_signer: _keystore
	});

	web3.setProvider(web3Provider);
}

function fundEth(newAddress, amt) {

	console.log("fundEth");

	var fromAddr = accounts[0]; // default owner address of client
	var toAddr = newAddress;
	var valueEth = amt;
	var value = parseFloat(valueEth)*1.0e18;
	var gasPrice = 1000000000000;
	var gas = 50000;
	web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value}, function (err, txhash) {
	  if (err) console.log('ERROR: ' + err)
	  console.log('txhash: ' + txhash + " (" + amt + " in ETH sent)");
		$("#balance").html(getBalance(toAddr));
	});
}


window.onload = function() {

	web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }
    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }
    accounts = accs;
    account = accounts[0];

  	initializeConference();
  });

	// Wire up the UI elements
	$("#changeQuota").click(function() {
		var val = $("#confQuota").val();
		changeQuota(val);
	});

	$("#buyTicket").click(function() {
		var val = $("#ticketPrice").val();
		var buyerAddress = $("#buyerAddress").val();
		buyTicket(buyerAddress, web3.toWei(val));
	});

	$("#refundTicket").click(function() {
		var val = $("#ticketPrice").val();
		var buyerAddress = $("#refBuyerAddress").val();
		refundTicket(buyerAddress, web3.toWei(val));
	});

	$("#createWallet").click(function() {
		var val = $("#password").val();
		if (!val) {
			$("#password").val("PASSWORD NEEDED").css("color", "red");
			$("#password").click(function() { 
				$("#password").val("").css("color", "black"); 
			});
		} else {
			createWallet(val);
		}
	});

	$("#fundWallet").click(function() {
		var address = $("#wallet").html();
		fundEth(address, 1);
	});

	$("#checkBalance").click(function() {
		var address = $("#wallet").html();
		$("#balance").html(getBalance(address));
	});

	// Set value of wallet to accounts[1]
	$("#buyerAddress").val(accounts[1]);
	$("#refBuyerAddress").val(accounts[1]);

};

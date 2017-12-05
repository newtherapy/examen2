module.exports = {
  build: {
    "index.html": "app/index.html",
    "app.js": [
      "app/javascripts/app.js"
    ],
    "app.css": [
      "app/stylesheets/app.css"
    ],
    "images/": "app/images/"
  },
   networks: {
   development: {
   host: "localhost",
   port: 3000,
   gas: 4000000,
   network_id: "*" // Match any network id
  },
    rpc: {
    host: "localhost",
    port: 3000,
    gas: 4000000,
    network_id: "*" // match any network
  },
  mynetwork: {
    host: "localhost",
    port: 3000,
    gas: 4000000,
    network_id: "*" // match any network
  },
 }
};

// truffle serve -p 3000
// truffle test --network mynetwork
// truffle develop --network test
/* para usarlo con el bulider de truffe 2.0
var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  }),
   networks: {
   development: {
   host: "localhost",
   port: 9545,
   gas: 4000000,
   network_id: "*" // Match any network id
  }
 }
};
*/
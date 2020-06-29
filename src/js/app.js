App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 100000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: async function() {
  // Modern dapp browsers…
  if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
  // Request account access
  await window.ethereum.enable();
  console.log("here2");
  } catch (error) {
  // User denied account access…
  console.error("User denied account access");
  }
  }
  // Legacy dapp browsers…
  else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
  App.web3Provider = new Web3.providers.HttpProvider("http://localhost:9545");
  }
  // App.web3Provider = new Web3.providers.HttpProvider(‘http://localhost:8545');
  web3 = new Web3(App.web3Provider);
  return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("SheepCoinSale.json", function(sheepCoinSale) {
      App.contracts.SheepCoinSale = TruffleContract(sheepCoinSale);
      App.contracts.SheepCoinSale.setProvider(App.web3Provider);
      App.contracts.SheepCoinSale.deployed().then(function(sheepCoinSale) {
        console.log("SheepCoin Token Sale Address:", sheepCoinSale.address);
      });
    }).done(function() {
      $.getJSON("SheepCoin.json", function(sheepCoin) {
        App.contracts.SheepCoin = TruffleContract(sheepCoin);
        App.contracts.SheepCoin.setProvider(App.web3Provider);
        App.contracts.SheepCoin.deployed().then(function(sheepCoin) {
          console.log("SheepCoin Token Address:", sheepCoin.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SheepCoinSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      App.account = accounts[0];
        $('#accountAddress').html("Your Account: " + account);
      });

    // Load token sale contract
    App.contracts.SheepCoinSale.deployed().then(function(instance) {
      sheepCoinSaleInstance = instance;
      return sheepCoinSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return sheepCoinSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable - 10000);

      var progressPercent = (Math.ceil(App.tokensSold) / (App.tokensAvailable - 10000)) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.SheepCoin.deployed().then(function(instance) {
        sheepCoinInstance = instance;
        return sheepCoinInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.SheepCoinSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});

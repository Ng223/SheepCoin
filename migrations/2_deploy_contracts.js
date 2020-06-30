const SheepCoin = artifacts.require("./SheepCoin.sol");
const SheepCoinSale = artifacts.require("./SheepCoinSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SheepCoin,10000000).then(function() {
    // Token price is 0.01 Ether
    var tokenPrice = 100000000000000;
    return deployer.deploy(SheepCoinSale, SheepCoin.address, tokenPrice);
  });
};

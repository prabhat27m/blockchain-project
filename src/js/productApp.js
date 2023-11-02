App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        await App.initWeb3();
        await App.initContract();
        App.bindEvents();
    },

    initWeb3: function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            window.ethereum.enable().then(function() {
                // User has allowed access to their wallet
                console.log("MetaMask is enabled.");
            }).catch(function(error) {
                // User has denied access to their wallet or an error occurred
                console.error("MetaMask access denied or error:", error);
            });
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('product.json', function(data) {
            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-register', App.registerProduct);
    },

    registerProduct: async function(event) {
        event.preventDefault();
        console.log("Register");
        var productInstance;

        var manufacturerID = document.getElementById('manufacturerID').value;
        var productName = document.getElementById('productName').value;
        var productSN = document.getElementById('productSN').value;
        var productBrand = document.getElementById('productBrand').value;
        var productPrice = document.getElementById('productPrice').value;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.product.deployed().then(function(instance) {
                productInstance = instance;
                return productInstance.addProduct(
                    web3.fromAscii(manufacturerID),
                    web3.fromAscii(productName),
                    web3.fromAscii(productSN),
                    web3.fromAscii(productBrand),
                    productPrice,
                    { from: account }
                );
            }).then(function(result) {
                document.getElementById('manufacturerID').value = '';
                document.getElementById('productName').value = '';
                document.getElementById('productSN').value = '';
                document.getElementById('productBrand').value = '';
                document.getElementById('productPrice').value = '';
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});

// test/setup.js

const { initKeychain } = require('../src/init');

before(() => {
    initKeychain('secureMasterPassword');
});

'use strict';

const chai = require('chai'),
      expect = chai.expect;

const lib = require('../lib'),
      ChaCha20 = lib.ChaCha20,
      sodium = require('sodium').api;

const NPUBBYTES = sodium.crypto_aead_chacha20poly1305_NPUBBYTES,
      KEYBYTES = sodium.crypto_aead_chacha20poly1305_KEYBYTES;

describe('ChaCha20', () => {
  
  it('should exist', () => {
    expect(lib).to.exist;
    expect(ChaCha20).to.exist;
    expect(ChaCha20).to.be.a('function');
  });
  
  describe('getNonce', () => {
    
    it('should exist', () => {
      expect(ChaCha20).to.have.property('getNonce');
      expect(ChaCha20.getNonce).to.be.a('function');
    });

    it('should return a nonce buffer', () => {
      let nonce = ChaCha20.getNonce();
      
      expect(nonce).to.be.an.instanceof(Buffer);
      expect(nonce).to.have.lengthOf(NPUBBYTES);
    });
  });

  describe('getNonceIncrement', () => {

    it('should exist', () => {
      expect(ChaCha20).to.have.property('getNonceIncrement');
      expect(ChaCha20.getNonceIncrement).to.be.a('function');
    });

    it('should return incremented nonce buffer from buffer', () => {
      let nonce = ChaCha20.getNonce(),
          inonce = ChaCha20.getNonceIncrement(nonce);
      
      expect(inonce).to.be.an.instanceof(Buffer);
      expect(inonce).to.have.lengthOf(NPUBBYTES);
      expect(inonce.compare(nonce)).equal(1);
    });

    it('should return incremented nonce buffer from encoded string', () => {
      let nonce = ChaCha20.getNonce(),
          nonceString = nonce.toString('base64'),
          inonce = ChaCha20.getNonceIncrement(nonceString);
      
      expect(nonceString).to.be.a('string');
      expect(inonce).to.be.an.instanceof(Buffer);
      expect(inonce).to.have.lengthOf(NPUBBYTES);
      expect(inonce.compare(nonce)).equal(1);

      nonceString = nonce.toString('hex');
      inonce = ChaCha20.getNonceIncrement(nonceString, 'hex');

      expect(nonceString).to.be.a('string');
      expect(inonce).to.be.an.instanceof(Buffer);
      expect(inonce).to.have.lengthOf(NPUBBYTES);
      expect(inonce.compare(nonce)).equal(1);
    });
    
    it('should not pass with invalid params', () => {
      let nonce = ChaCha20.getNonce();
      
      expect(ChaCha20.getNonceIncrement.bind(ChaCha20, nonce.toString('hex'), 'base64')).to.throw(Error);
      expect(ChaCha20.getNonceIncrement.bind(ChaCha20, nonce.toString('hex'), 'invalidEncoding')).to.throw(Error);
      expect(ChaCha20.getNonceIncrement.bind(ChaCha20, 'invalidNonce')).to.throw(Error);
      expect(ChaCha20.getNonceIncrement.bind(ChaCha20, new Buffer(9))).to.throw(Error);
      expect(ChaCha20.getNonceIncrement.bind(ChaCha20)).to.throw(Error);
    });
  });
  
  describe('getKey', () => {

    it('should exist', () => {
      expect(ChaCha20).to.have.property('getKey');
      expect(ChaCha20.getKey).to.be.a('function');
    });
    
    it('should return a random key from empty params', () => {
      let key = ChaCha20.getKey();
      
      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);
    });
    
    it('should return a key with secret param only', () => {
      let key = ChaCha20.getKey('SuperSecretKey');
      
      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);

      key = ChaCha20.getKey(new Buffer('SuperSecretKey'));

      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);
    });
    
    it('should return a key with secret and salt params', () => {
      let key = ChaCha20.getKey('SuperSecretKey', 'SuperRandomSalt');

      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);

      key = ChaCha20.getKey(new Buffer('SuperSecretKey'), new Buffer('SuperRandomSalt'));

      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);
    });
    
    it('should return a key with secret, salt and encoding params', () => {
      let key = ChaCha20.getKey(new Buffer('SuperSecretKey').toString('hex'), 'hex', 'SuperRandomSalt');

      expect(key).to.be.an.instanceof(Buffer);
      expect(key).to.have.lengthOf(KEYBYTES);
    });

    it('should not pass with invalid params', ()=> {
      expect(ChaCha20.getKey.bind(ChaCha20, false)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, true)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, null)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, {})).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, new Buffer('SuperSecretKey').toString('hex'), 'invalidEncoding', 'SuperRandomSalt')).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, 'SuperSecretKey', false)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, 'SuperSecretKey', true)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, 'SuperSecretKey', null)).to.throw(Error);
      expect(ChaCha20.getKey.bind(ChaCha20, 'SuperSecretKey', {})).to.throw(Error);
    });
  });

  let plainText = 'Test message from Alice',
      nonce = new Buffer('SUxfjOvrEyA=', 'base64'),
      key = new Buffer('GXu9CCjQHiQm5MUzdmxby6Nec2lPZzLiDY8OvygUg/c=', 'base64'),
      encrypted = 'padkGdmrymqLRNruHWrf9ArfqZEP4dR+s42EPZK/ojoQQGEMe1Zr';

  describe('encrypt', ()=> {
    
    it('should exist', () => {
      expect(ChaCha20).to.have.property('encrypt');
      expect(ChaCha20.encrypt).to.be.a('function');
    });
    
    it('should encrypt with plain buffer', ()=> {
      let enc = ChaCha20.encrypt(new Buffer(plainText, 'utf8'), nonce, key);
      
      expect(enc).to.be.an.instanceof(Buffer);
      expect(enc.toString('base64')).equal(encrypted);
    });
    
    it('should encrypt with plain string', ()=> {
      let enc = ChaCha20.encrypt(plainText, 'utf8', nonce, key);
      
      expect(enc).to.be.an.instanceof(Buffer);
      expect(enc.toString('base64')).equal(encrypted);

      enc = ChaCha20.encrypt(plainText, nonce, key);

      expect(enc).to.be.an.instanceof(Buffer);
      expect(enc.toString('base64')).equal(encrypted);
    });

    it('should not pass with invalid params', () => {
      expect(ChaCha20.encrypt.bind(ChaCha20)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText, 'secondRandomParam')).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText, 'hex', nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText, 'invalidEncoding', nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, false, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, true, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, null, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, {}, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, 0, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, 128, nonce, key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText, nonce.toString('base64'), key)).to.throw(Error);
      expect(ChaCha20.encrypt.bind(ChaCha20, plainText, nonce, key.toString('base64'))).to.throw(Error);
    });
  });

  describe('decrypt', ()=> {

    it('should exist', () => {
      expect(ChaCha20).to.have.property('decrypt');
      expect(ChaCha20.decrypt).to.be.a('function');
    });
    
    it('should decrypt with cipher buffer', () => {
      let dec = ChaCha20.decrypt(new Buffer(encrypted, 'base64'), nonce, key);

      expect(dec).to.be.an.instanceof(Buffer);
      expect(dec.toString('utf8')).equal(plainText);
    });

    it('should decrypt with cipher base64', () => {
      let dec = ChaCha20.decrypt(encrypted, 'base64', nonce, key);

      expect(dec).to.be.an.instanceof(Buffer);
      expect(dec.toString('utf8')).equal(plainText);

      dec = ChaCha20.decrypt(encrypted, nonce, key);

      expect(dec).to.be.an.instanceof(Buffer);
      expect(dec.toString('utf8')).equal(plainText);
    });
    
    it('should not pass with invalid params', () => {
      expect(ChaCha20.decrypt.bind(ChaCha20)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted, 'secondRandomParam')).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted, 'hex', nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted, 'invalidEncoding', nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, false, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, true, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, null, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, {}, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, 0, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, 128, nonce, key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted, nonce.toString('base64'), key)).to.throw(Error);
      expect(ChaCha20.decrypt.bind(ChaCha20, encrypted, nonce, key.toString('base64'))).to.throw(Error);
    });
  });
});
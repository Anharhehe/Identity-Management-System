const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';

const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
};

const decryptMessage = (encryptedMessage) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = {
  encryptMessage,
  decryptMessage
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSalt = exports.serializeBufferForStorage = exports.serializeBufferFromStorage = exports.keyFromPassword = exports.exportKey = exports.importKey = exports.decryptWithKey = exports.decryptWithDetail = exports.decrypt = exports.encryptWithKey = exports.encryptWithDetail = exports.encrypt = void 0;
const EXPORT_FORMAT = 'jwk';
const DERIVED_KEY_FORMAT = 'AES-GCM';
const STRING_ENCODING = 'utf-8';
/**
 * Encrypts a data object that can be any serializable value using
 * a provided password.
 *
 * @param password - The password to use for encryption.
 * @param dataObj - The data to encrypt.
 * @param key - The CryptoKey to encrypt with.
 * @param salt - The salt to use to encrypt.
 * @returns The encrypted vault.
 */
async function encrypt(password, dataObj, key, salt = generateSalt()) {
    const cryptoKey = key || (await keyFromPassword(password, salt));
    const payload = await encryptWithKey(cryptoKey, dataObj);
    payload.salt = salt;
    return JSON.stringify(payload);
}
exports.encrypt = encrypt;
/**
 * Encrypts a data object that can be any serializable value using
 * a provided password.
 *
 * @param password - A password to use for encryption.
 * @param dataObj - The data to encrypt.
 * @param salt - The salt used to encrypt.
 * @returns The vault and exported key string.
 */
async function encryptWithDetail(password, dataObj, salt = generateSalt()) {
    const key = await keyFromPassword(password, salt, true);
    const exportedKeyString = await exportKey(key);
    const vault = await encrypt(password, dataObj, key, salt);
    return {
        vault,
        exportedKeyString,
    };
}
exports.encryptWithDetail = encryptWithDetail;
/**
 * Encrypts the provided serializable javascript object using the
 * provided CryptoKey and returns an object containing the cypher text and
 * the initialization vector used.
 *
 * @param key - The CryptoKey to encrypt with.
 * @param dataObj - A serializable JavaScript object to encrypt.
 * @returns The encrypted data.
 */
async function encryptWithKey(key, dataObj) {
    const data = JSON.stringify(dataObj);
    const dataBuffer = Buffer.from(data, STRING_ENCODING);
    const vector = global.crypto.getRandomValues(new Uint8Array(16));
    const buf = await global.crypto.subtle.encrypt({
        name: DERIVED_KEY_FORMAT,
        iv: vector,
    }, key, dataBuffer);
    const buffer = new Uint8Array(buf);
    const vectorStr = Buffer.from(vector).toString('base64');
    const vaultStr = Buffer.from(buffer).toString('base64');
    return {
        data: vaultStr,
        iv: vectorStr,
    };
}
exports.encryptWithKey = encryptWithKey;
/**
 * Given a password and a cypher text, decrypts the text and returns
 * the resulting value.
 *
 * @param password - The password to decrypt with.
 * @param text - The cypher text to decrypt.
 * @param key - The key to decrypt with.
 * @returns The decrypted data.
 */
async function decrypt(password, text, key) {
    const payload = JSON.parse(text);
    const { salt } = payload;
    const cryptoKey = key || (await keyFromPassword(password, salt));
    const result = await decryptWithKey(cryptoKey, payload);
    return result;
}
exports.decrypt = decrypt;
/**
 * Given a password and a cypher text, decrypts the text and returns
 * the resulting value, keyString, and salt.
 *
 * @param password - The password to decrypt with.
 * @param text - The encrypted vault to decrypt.
 * @returns The decrypted vault along with the salt and exported key.
 */
async function decryptWithDetail(password, text) {
    const payload = JSON.parse(text);
    const { salt } = payload;
    const key = await keyFromPassword(password, salt, true);
    const exportedKeyString = await exportKey(key);
    const vault = await decrypt(password, text, key);
    return {
        exportedKeyString,
        vault,
        salt,
    };
}
exports.decryptWithDetail = decryptWithDetail;
/**
 * Given a CryptoKey and an EncryptionResult object containing the initialization
 * vector (iv) and data to decrypt, return the resulting decrypted value.
 *
 * @param key - The CryptoKey to decrypt with.
 * @param payload - The payload to decrypt, returned from an encryption method.
 * @returns The decrypted data.
 */
async function decryptWithKey(key, payload) {
    const encryptedData = Buffer.from(payload.data, 'base64');
    const vector = Buffer.from(payload.iv, 'base64');
    let decryptedObj;
    try {
        const result = await crypto.subtle.decrypt({ name: DERIVED_KEY_FORMAT, iv: vector }, key, encryptedData);
        const decryptedData = new Uint8Array(result);
        const decryptedStr = Buffer.from(decryptedData).toString(STRING_ENCODING);
        decryptedObj = JSON.parse(decryptedStr);
    }
    catch (e) {
        throw new Error('Incorrect password');
    }
    return decryptedObj;
}
exports.decryptWithKey = decryptWithKey;
/**
 * Receives an exported CryptoKey string and creates a key.
 *
 * @param keyString - The key string to import.
 * @returns A CryptoKey.
 */
async function importKey(keyString) {
    const key = await global.crypto.subtle.importKey(EXPORT_FORMAT, JSON.parse(keyString), DERIVED_KEY_FORMAT, true, ['encrypt', 'decrypt']);
    return key;
}
exports.importKey = importKey;
/**
 * Receives an exported CryptoKey string, creates a key,
 * and decrypts cipher text with the reconstructed key.
 *
 * @param key - The CryptoKey to export.
 * @returns A key string.
 */
async function exportKey(key) {
    const exportedKey = await global.crypto.subtle.exportKey(EXPORT_FORMAT, key);
    return JSON.stringify(exportedKey);
}
exports.exportKey = exportKey;
/**
 * Generate a CryptoKey from a password and random salt.
 *
 * @param password - The password to use to generate key.
 * @param salt - The salt string to use in key derivation.
 * @param exportable - Should the derived key be exportable.
 * @returns A CryptoKey for encryption and decryption.
 */
async function keyFromPassword(password, salt, exportable = false) {
    const passBuffer = Buffer.from(password, STRING_ENCODING);
    const saltBuffer = Buffer.from(salt, 'base64');
    const key = await global.crypto.subtle.importKey('raw', passBuffer, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
    const derivedKey = await global.crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 10000,
        hash: 'SHA-256',
    }, key, { name: DERIVED_KEY_FORMAT, length: 256 }, exportable, ['encrypt', 'decrypt']);
    return derivedKey;
}
exports.keyFromPassword = keyFromPassword;
/**
 * Converts a hex string into a buffer.
 *
 * @param str - Hex encoded string.
 * @returns The string ecoded as a byte array.
 */
function serializeBufferFromStorage(str) {
    const stripStr = str.slice(0, 2) === '0x' ? str.slice(2) : str;
    const buf = new Uint8Array(stripStr.length / 2);
    for (let i = 0; i < stripStr.length; i += 2) {
        const seg = stripStr.substr(i, 2);
        buf[i / 2] = parseInt(seg, 16);
    }
    return buf;
}
exports.serializeBufferFromStorage = serializeBufferFromStorage;
/**
 * Converts a buffer into a hex string ready for storage.
 *
 * @param buffer - Buffer to serialize.
 * @returns A hex encoded string.
 */
function serializeBufferForStorage(buffer) {
    let result = '0x';
    buffer.forEach((value) => {
        result += unprefixedHex(value);
    });
    return result;
}
exports.serializeBufferForStorage = serializeBufferForStorage;
/**
 * Converts a number into hex value, and ensures proper leading 0
 * for single characters strings.
 *
 * @param num - The number to convert to string.
 * @returns An unprefixed hex string.
 */
function unprefixedHex(num) {
    let hex = num.toString(16);
    while (hex.length < 2) {
        hex = `0${hex}`;
    }
    return hex;
}
/**
 * Generates a random string for use as a salt in CryptoKey generation.
 *
 * @param byteCount - The number of bytes to generate.
 * @returns A randomly generated string.
 */
function generateSalt(byteCount = 32) {
    const view = new Uint8Array(byteCount);
    global.crypto.getRandomValues(view);
    // Uint8Array is a fixed length array and thus does not have methods like pop, etc
    // so TypeScript complains about casting it to an array. Array.from() works here for
    // getting the proper type, but it results in a functional difference. In order to
    // cast, you have to first cast view to unknown then cast the unknown value to number[]
    // TypeScript ftw: double opt in to write potentially type-mismatched code.
    const b64encoded = btoa(String.fromCharCode.apply(null, view));
    return b64encoded;
}
exports.generateSalt = generateSalt;
//# sourceMappingURL=index.js.map
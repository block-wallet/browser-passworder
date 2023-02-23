declare type DetailedEncryptionResult = {
    vault: string;
    exportedKeyString: string;
};
declare type EncryptionResult = {
    data: string;
    iv: string;
    salt?: string;
};
declare type DetailedDecryptResult = {
    exportedKeyString: string;
    vault: unknown;
    salt: string;
};
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
export declare function encrypt<R>(password: string, dataObj: R, key?: CryptoKey, salt?: string): Promise<string>;
/**
 * Encrypts a data object that can be any serializable value using
 * a provided password.
 *
 * @param password - A password to use for encryption.
 * @param dataObj - The data to encrypt.
 * @param salt - The salt used to encrypt.
 * @returns The vault and exported key string.
 */
export declare function encryptWithDetail<R>(password: string, dataObj: R, salt?: string): Promise<DetailedEncryptionResult>;
/**
 * Encrypts the provided serializable javascript object using the
 * provided CryptoKey and returns an object containing the cypher text and
 * the initialization vector used.
 *
 * @param key - The CryptoKey to encrypt with.
 * @param dataObj - A serializable JavaScript object to encrypt.
 * @returns The encrypted data.
 */
export declare function encryptWithKey<R>(key: CryptoKey, dataObj: R): Promise<EncryptionResult>;
/**
 * Given a password and a cypher text, decrypts the text and returns
 * the resulting value.
 *
 * @param password - The password to decrypt with.
 * @param text - The cypher text to decrypt.
 * @param key - The key to decrypt with.
 * @returns The decrypted data.
 */
export declare function decrypt(password: string, text: string, key?: CryptoKey): Promise<unknown>;
/**
 * Given a password and a cypher text, decrypts the text and returns
 * the resulting value, keyString, and salt.
 *
 * @param password - The password to decrypt with.
 * @param text - The encrypted vault to decrypt.
 * @returns The decrypted vault along with the salt and exported key.
 */
export declare function decryptWithDetail(password: string, text: string): Promise<DetailedDecryptResult>;
/**
 * Given a CryptoKey and an EncryptionResult object containing the initialization
 * vector (iv) and data to decrypt, return the resulting decrypted value.
 *
 * @param key - The CryptoKey to decrypt with.
 * @param payload - The payload to decrypt, returned from an encryption method.
 * @returns The decrypted data.
 */
export declare function decryptWithKey<R>(key: CryptoKey, payload: EncryptionResult): Promise<R>;
/**
 * Receives an exported CryptoKey string and creates a key.
 *
 * @param keyString - The key string to import.
 * @returns A CryptoKey.
 */
export declare function importKey(keyString: string): Promise<CryptoKey>;
/**
 * Receives an exported CryptoKey string, creates a key,
 * and decrypts cipher text with the reconstructed key.
 *
 * @param key - The CryptoKey to export.
 * @returns A key string.
 */
export declare function exportKey(key: CryptoKey): Promise<string>;
/**
 * Generate a CryptoKey from a password and random salt.
 *
 * @param password - The password to use to generate key.
 * @param salt - The salt string to use in key derivation.
 * @param exportable - Should the derived key be exportable.
 * @returns A CryptoKey for encryption and decryption.
 */
export declare function keyFromPassword(password: string, salt: string, exportable?: boolean): Promise<CryptoKey>;
/**
 * Converts a hex string into a buffer.
 *
 * @param str - Hex encoded string.
 * @returns The string ecoded as a byte array.
 */
export declare function serializeBufferFromStorage(str: string): Uint8Array;
/**
 * Converts a buffer into a hex string ready for storage.
 *
 * @param buffer - Buffer to serialize.
 * @returns A hex encoded string.
 */
export declare function serializeBufferForStorage(buffer: Uint8Array): string;
/**
 * Generates a random string for use as a salt in CryptoKey generation.
 *
 * @param byteCount - The number of bytes to generate.
 * @returns A randomly generated string.
 */
export declare function generateSalt(byteCount?: number): string;
export {};

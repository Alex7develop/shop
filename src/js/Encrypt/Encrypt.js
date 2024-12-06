export default class Encrypt {
    _encrypt(data, key) {
        // Generate a random initialization vector (IV)
        const ivLength = 16; // AES block size for CBC mode
        const iv = window.crypto.getRandomValues(new Uint8Array(ivLength));
    
        // Encrypt data using AES-256-CBC
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        
        return window.crypto.subtle.importKey('raw', encoder.encode(key), { name: 'AES-CBC' }, false, ['encrypt'])
            .then(importedKey => {
                return window.crypto.subtle.encrypt(
                    {
                        name: 'AES-CBC',
                        iv: iv
                    },
                    importedKey,
                    encodedData
                );
            })
            .then(encryptedData => {
                const combinedData = new Uint8Array(ivLength + encryptedData.byteLength);
                combinedData.set(iv);
                combinedData.set(new Uint8Array(encryptedData), ivLength);
                return btoa(String.fromCharCode.apply(null, combinedData));
            });
    }
}
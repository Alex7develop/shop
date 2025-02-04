export default class Encrypt {
    async _encrypt(data, key) {
        // Генерация случайного IV (16 байт)
        const iv = window.crypto.getRandomValues(new Uint8Array(16));

        // Преобразуем ключ в бинарный формат и хешируем его с использованием SHA-256
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const hashedKey = await window.crypto.subtle.digest('SHA-256', keyData);

        // Импортируем ключ для использования в AES-CBC
        const importedKey = await window.crypto.subtle.importKey(
            'raw',
            hashedKey,
            { name: 'AES-CBC' },
            false, // Не экспортируемый ключ
            ['encrypt', 'decrypt']
        );

        // Преобразуем данные в бинарный формат
        const encodedData = encoder.encode(data);

        // Шифруем данные с использованием AES-256-CBC
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-CBC',
                iv: iv
            },
            importedKey,
            encodedData
        );

        // Объединяем IV и зашифрованные данные
        const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
        combinedData.set(iv);
        combinedData.set(new Uint8Array(encryptedData), iv.length);

        // Кодируем результат в Base64
        return btoa(String.fromCharCode.apply(null, combinedData));
    }
}
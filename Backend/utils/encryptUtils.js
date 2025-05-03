// cryptoUtils.js
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

// Función para derivar la clave de texto
export function deriveKeyFromText(textKey) {
    return crypto.createHash('sha256').update(textKey).digest();
}

// Función para cifrar con clave de texto
export  function encrypt(text, textKey) {
    const keyBuffer = deriveKeyFromText(textKey);
    const iv = crypto.randomBytes(16); // Generar un IV aleatorio para cada cifrado
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// Función para descifrar con clave de texto
export  function decrypt(encryptedText, textKey) {
    const keyBuffer = deriveKeyFromText(textKey);
    const [ivHex, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


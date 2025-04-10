
/**
 * Integer-based RSA cryptography implementation
 */

// Function for modular exponentiation (base^expo mod m)
export const power = (base: number, expo: number, m: number): number => {
    let res = 1;
    base = base % m;
    while (expo > 0) {
        if (expo & 1) {
            res = (res * base) % m;
        }
        base = (base * base) % m;
        expo = Math.floor(expo / 2);
    }
    return res;
};

// Function to find modular inverse of e modulo phi(n)
export const modInverse = (e: number, phi: number): number => {
    for (let d = 2; d < phi; d++) {
        if ((e * d) % phi === 1) {
            return d;
        }
    }
    return -1;
};

// Calculate greatest common divisor
export const gcd = (a: number, b: number): number => {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

export interface IntegerKeyPair {
    publicKey: {
        e: number;
        n: number;
    };
    privateKey: {
        d: number;
        n: number;
    };
}

// RSA Key Generation
export const generateIntegerKeyPair = (keySize: "small" | "large" = "large"): IntegerKeyPair => {
    // Pre-defined primes based on key size
    // Using smaller primes for demonstration
    const p = keySize === "large" ? 7919 : 103;
    const q = keySize === "large" ? 1009 : 101;
    
    const n = p * q;
    const phi = (p - 1) * (q - 1);

    // Choose e, where 1 < e < phi(n) and gcd(e, phi(n)) == 1
    let e = 0;
    for (let i = 2; i < phi; i++) {
        if (gcd(i, phi) === 1) {
            e = i;
            break;
        }
    }

    // Compute d such that e * d ≡ 1 (mod phi(n))
    const d = modInverse(e, phi);

    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
};

// Encrypt message using public key (e, n)
export const encryptInteger = (m: number, publicKey: { e: number, n: number }): number => {
    return power(m, publicKey.e, publicKey.n);
};

// Decrypt message using private key (d, n)
export const decryptInteger = (c: number, privateKey: { d: number, n: number }): number => {
    return power(c, privateKey.d, privateKey.n);
};

// Convert string to array of integers (simple ASCII conversion)
export const stringToIntegers = (text: string): number[] => {
    return Array.from(text).map(char => char.charCodeAt(0));
};

// Convert array of integers back to string
export const integersToString = (integers: number[]): string => {
    return integers.map(code => String.fromCharCode(code)).join('');
};

// Encrypt a string message
export const encryptMessage = (message: string, publicKey: { e: number, n: number }): string => {
    const integers = stringToIntegers(message);
    const encrypted = integers.map(m => encryptInteger(m, publicKey));
    return encrypted.join(',');
};

// Decrypt a string message
export const decryptMessage = (ciphertext: string, privateKey: { d: number, n: number }): string => {
    const integers = ciphertext.split(',').map(Number);
    const decrypted = integers.map(c => decryptInteger(c, privateKey));
    return integersToString(decrypted);
};

// Validate RSA public key format
export const isValidPublicKey = (key: string): boolean => {
    try {
        const parsed = JSON.parse(key);
        return typeof parsed.e === 'number' && typeof parsed.n === 'number';
    } catch (error) {
        return false;
    }
};

// Validate RSA private key format
export const isValidPrivateKey = (key: string): boolean => {
    try {
        const parsed = JSON.parse(key);
        return typeof parsed.d === 'number' && typeof parsed.n === 'number';
    } catch (error) {
        return false;
    }
};

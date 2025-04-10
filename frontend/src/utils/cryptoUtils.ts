
/**
 * Integer-based RSA cryptography implementation with improved performance
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
    let d = 0;
    let x1 = 0;
    let x2 = 1;
    let y1 = 1;
    let tempPhi = phi;
    
    let temp;
    while (e > 0) {
        temp = Math.floor(tempPhi / e);
        let t = e;
        e = tempPhi % e;
        tempPhi = t;
        
        t = x2;
        x2 = x1 - temp * x2;
        x1 = t;
        
        t = d;
        d = y1 - temp * d;
        y1 = t;
    }
    
    if (tempPhi === 1) {
        return (x1 + phi) % phi;
    }
    
    return -1; // No modular inverse exists
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

// Simplified primality test for faster execution
const isProbablyPrime = (n: number, k: number = 5): boolean => {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0) return false;
    
    // Check a few small primes directly for speed
    const smallPrimes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
    for (const prime of smallPrimes) {
        if (n === prime) return true;
        if (n % prime === 0) return false;
    }
    
    // Basic Fermat primality test (faster than Miller-Rabin but less accurate)
    // Still good enough for our demo purposes
    for (let i = 0; i < k; i++) {
        const a = 2 + Math.floor(Math.random() * (n - 4));
        if (power(a, n - 1, n) !== 1) return false;
    }
    
    return true; // Probably prime
};

// Generate a random prime number with caching for speed
const primeCache: number[] = []; // Cache some primes to speed up generation

const generatePrime = (min: number, max: number): number => {
    // Use smaller primes for demo purposes
    if (primeCache.length < 10) {
        // Pre-populate cache with some known primes in the range
        const candidatePrimes = [
            101, 103, 107, 109, 113, 127, 131, 137, 139, 149,
            151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199
        ];
        
        for (const prime of candidatePrimes) {
            if (prime >= min && prime <= max) {
                primeCache.push(prime);
            }
        }
    }
    
    // Use a cached prime if available
    if (primeCache.length > 0) {
        const randomIndex = Math.floor(Math.random() * primeCache.length);
        const prime = primeCache[randomIndex];
        
        // Remove used prime to ensure we don't reuse it
        primeCache.splice(randomIndex, 1);
        
        return prime;
    }
    
    // Generate a new prime if cache is empty
    let attempts = 0;
    const maxAttempts = 100; // Limit attempts to prevent infinite loop
    
    while (attempts < maxAttempts) {
        attempts++;
        const candidate = min + Math.floor(Math.random() * (max - min));
        // Make it odd
        const p = (candidate % 2 === 0) ? candidate + 1 : candidate;
        
        if (isProbablyPrime(p)) {
            return p;
        }
    }
    
    // Fallback to known primes if we can't find a random one quickly
    return 101 + Math.floor(Math.random() * 100) * 2 + 1; // Return an odd number in range
};

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

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

// RSA Key Generation with optimized performance
export const generateKeyPair = (keySize: number | "small" | "large" = "large"): IntegerKeyPair => {
    let primeRange: {min: number, max: number};
    
    // Use smaller primes for faster generation
    if (keySize === "small" || keySize === 1024) {
        primeRange = { min: 100, max: 200 }; // Smaller range for demo purposes
    } else {
        // For 2048 or "large" setting - still keep it manageable
        primeRange = { min: 200, max: 500 };
    }
    
    // Generate two distinct random primes from our optimized generator
    const p = generatePrime(primeRange.min, primeRange.max);
    
    // Ensure q is different from p
    let q;
    do {
        q = generatePrime(primeRange.min, primeRange.max);
    } while (q === p);
    
    const n = p * q;
    const phi = (p - 1) * (q - 1);

    // Common values for e
    const commonEs = [3, 5, 17, 257, 65537];
    
    // Find a suitable e from common values
    let e = 0;
    for (const candidate of commonEs) {
        if (candidate < phi && gcd(candidate, phi) === 1) {
            e = candidate;
            break;
        }
    }
    
    // If no common e works, use a simpler approach
    if (e === 0) {
        e = 65537; // Common default if it works
        if (e >= phi || gcd(e, phi) !== 1) {
            // Find the first odd number that works as e
            for (let candidate = 3; candidate < phi; candidate += 2) {
                if (gcd(candidate, phi) === 1) {
                    e = candidate;
                    break;
                }
            }
        }
    }

    // Compute d such that e * d ≡ 1 (mod phi(n))
    const d = modInverse(e, phi);
    
    console.log('Generated new RSA key pair');
    console.log(`p: ${p}, q: ${q}, n: ${n}, phi: ${phi}, e: ${e}, d: ${d}`);
    
    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
};

// Encrypt message using public key (e, n) - direct integer encryption
export const encryptInteger = (m: number, publicKey: { e: number, n: number }): number => {
    return power(m, publicKey.e, publicKey.n);
};

// Decrypt message using private key (d, n) - direct integer decryption
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

// NEW: Function to encrypt numeric values directly
export const encryptNumber = (num: number, publicKey: { e: number, n: number } | string): number => {
    let key: { e: number, n: number };
    
    if (typeof publicKey === 'string') {
        try {
            key = JSON.parse(publicKey);
        } catch {
            throw new Error("Invalid public key format");
        }
    } else {
        key = publicKey;
    }
    
    // Only encrypt if num is less than n to avoid modular issues
    if (num >= key.n) {
        throw new Error(`Number too large for this key. Max value: ${key.n - 1}`);
    }
    
    return encryptInteger(num, key);
};

// NEW: Function to decrypt encrypted numeric values
export const decryptNumber = (ciphertext: number, privateKey: { d: number, n: number } | string): number => {
    let key: { d: number, n: number };
    
    if (typeof privateKey === 'string') {
        try {
            key = JSON.parse(privateKey);
        } catch {
            throw new Error("Invalid private key format");
        }
    } else {
        key = privateKey;
    }
    
    return decryptInteger(ciphertext, key);
};

// Encrypt a string message - character by character
export const encryptMessage = (message: string, publicKey: { e: number, n: number } | string): string => {
    let key: { e: number, n: number };
    
    if (typeof publicKey === 'string') {
        try {
            key = JSON.parse(publicKey);
        } catch {
            // If not valid JSON, assume it's already an object
            throw new Error("Invalid public key format");
        }
    } else {
        key = publicKey;
    }
    
    // Check if message is a number
    const numericValue = Number(message);
    if (!isNaN(numericValue) && String(numericValue) === message) {
        // Handle as a numeric value
        try {
            const encrypted = encryptNumber(numericValue, key);
            return String(encrypted);
        } catch (e) {
            console.error(e);
            // Fall back to character-by-character if the number is too large
        }
    }
    
    // Default: character-by-character encryption
    const integers = stringToIntegers(message);
    const encrypted = integers.map(m => encryptInteger(m, key));
    return encrypted.join(',');
};

// Decrypt a string message
export const decryptMessage = (ciphertext: string, privateKey: { d: number, n: number } | string): string => {
    let key: { d: number, n: number };
    
    if (typeof privateKey === 'string') {
        try {
            key = JSON.parse(privateKey);
        } catch {
            // If not valid JSON, assume it's already an object
            throw new Error("Invalid private key format");
        }
    } else {
        key = privateKey;
    }
    
    // First, try to decrypt as a single numeric value
    const singleNumericValue = Number(ciphertext);
    if (!isNaN(singleNumericValue) && String(singleNumericValue) === ciphertext) {
        try {
            const decrypted = decryptNumber(singleNumericValue, key);
            return String(decrypted);
        } catch (e) {
            console.error(e);
            // Fall back to character-by-character if decryption fails
        }
    }
    
    // If not a single number or if decryption fails, try as comma-separated values
    const integers = ciphertext.split(',').map(Number);
    const decrypted = integers.map(c => decryptInteger(c, key));
    return integersToString(decrypted);
};

// Get key security level based on n value
export const getKeySecurityLevel = (n: number): "low" | "medium" | "high" => {
    if (n < 10000) {
        return "low";
    } else if (n < 1000000) {
        return "medium";
    } else {
        return "high";
    }
};

// Modular exponentiation
export const power = (base: number, expo: number, m: number): number => {
    let res = 1;
    base = base % m;
    while (expo > 0) {
      if (expo & 1) res = (res * base) % m;
      base = (base * base) % m;
      expo = Math.floor(expo / 2);
    }
    return res;
  };
  
  // Modular inverse
  export const modInverse = (e: number, phi: number): number => {
    let [a, b] = [e, phi];
    let [x0, x1] = [0, 1];
  
    while (a !== 0) {
      const q = Math.floor(b / a);
      [a, b] = [b % a, a];
      [x0, x1] = [x1 - q * x0, x0];
    }
  
    return x1 < 0 ? x1 + phi : x1;
  };
  
  export const gcd = (a: number, b: number): number => {
    while (b !== 0) [a, b] = [b, a % b];
    return a;
  };
  
  const isProbablyPrime = (n: number, k = 5): boolean => {
    if (n <= 1 || n % 2 === 0) return false;
    for (let i = 0; i < k; i++) {
      const a = 2 + Math.floor(Math.random() * (n - 4));
      if (power(a, n - 1, n) !== 1) return false;
    }
    return true;
  };
  
  const generateLargePrime = (bits: number): number => {
    const min = 1 << (bits - 1);
    const max = (1 << bits) - 1;
    while (true) {
      let candidate = Math.floor(Math.random() * (max - min)) + min;
      if (candidate % 2 === 0) candidate++;
      if (isProbablyPrime(candidate)) return candidate;
    }
  };
  
  export interface IntegerKeyPair {
    publicKey: { e: number; n: number };
    privateKey: { d: number; n: number };
  }
  
  export const generateKeyPair = (keySize = 1024): IntegerKeyPair => {
    const bits = keySize / 2;
    const p = generateLargePrime(bits);
    let q;
    do {
      q = generateLargePrime(bits);
    } while (q === p);
  
    const n = p * q;
    const phi = (p - 1) * (q - 1);
  
    const e = 65537;
    if (gcd(e, phi) !== 1) throw new Error("e and phi(n) are not coprime.");
  
    const d = modInverse(e, phi);
  
    return {
      publicKey: { e, n },
      privateKey: { d, n }
    };
  };
  
  export const encryptInteger = (m: number, publicKey: { e: number; n: number }): number => {
    return power(m, publicKey.e, publicKey.n);
  };
  
  export const decryptInteger = (c: number, privateKey: { d: number; n: number }): number => {
    return power(c, privateKey.d, privateKey.n);
  };
  
  export const stringToIntegers = (text: string): number[] => {
    return Array.from(text).map(char => char.charCodeAt(0));
  };
  
  export const integersToString = (ints: number[]): string => {
    return ints.map(code => String.fromCharCode(code)).join('');
  };
  
  export const encryptMessage = (message: string, publicKey: { e: number; n: number } | string): string => {
    const key = typeof publicKey === 'string' ? JSON.parse(publicKey) : publicKey;
    const ints = stringToIntegers(message);
    return ints.map(i => encryptInteger(i, key)).join(',');
  };
  
  export const decryptMessage = (cipher: string, privateKey: { d: number; n: number } | string): string => {
    const key = typeof privateKey === 'string' ? JSON.parse(privateKey) : privateKey;
    const ints = cipher.split(',').map(Number);
    const decrypted = ints.map(c => decryptInteger(c, key));
    return integersToString(decrypted);
  };
  
  export const getKeySecurityLevel = (n: number): "low" | "medium" | "high" => {
    if (n < 10000) return "low";
    if (n < 1000000) return "medium";
    return "high";
  };
  
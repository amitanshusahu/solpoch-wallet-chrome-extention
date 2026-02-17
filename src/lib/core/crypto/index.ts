const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptMnemonic(
  mnemonic: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));

  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const mnemonicBuffer = encoder.encode(mnemonic);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    key,
    mnemonicBuffer
  );

  return JSON.stringify({
    salt: arrayBufferToBase64(salt),
    nonce: arrayBufferToBase64(nonce),
    ciphertext: arrayBufferToBase64(ciphertext),
  });
}

export async function decryptMnemonic(
  encryptedMnemonics: string,
  password: string
): Promise<string> {
  const payload = JSON.parse(encryptedMnemonics);

  const salt = base64ToArrayBuffer(payload.salt);
  const nonce = base64ToArrayBuffer(payload.nonce);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce.buffer as ArrayBuffer,
      },
      key,
      ciphertext.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error("Incorrect password or corrupted vault");
  }
}

export async function checkPassword(
  encryptedMnemonics: string,
  password: string
): Promise<boolean> {
  try {
    const decrypted = await decryptMnemonic(encryptedMnemonics, password);
    return !!decrypted;
  } catch {
    return false;
  }
}
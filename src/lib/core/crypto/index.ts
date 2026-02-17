import sodium from "libsodium-wrappers";

const SALT_BYTES = 16;

export async function encryptMnemonic(
  mnemonic: string,
  password: string
): Promise<string> {
  await sodium.ready;

  const salt = sodium.randombytes_buf(SALT_BYTES);

  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const ciphertext = sodium.crypto_secretbox_easy(
    mnemonic,
    nonce,
    key
  );

  return JSON.stringify({
    salt: sodium.to_base64(salt),
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext),
  });
}


export async function decryptMnemonic(
  encryptedMnemonics: string,
  password: string
): Promise<string> {
  await sodium.ready;

  const payload = JSON.parse(encryptedMnemonics);

  const salt = sodium.from_base64(payload.salt);
  const nonce = sodium.from_base64(payload.nonce);
  const ciphertext = sodium.from_base64(payload.ciphertext);

  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  const decrypted = sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    key
  );

  if (!decrypted) {
    throw new Error("Incorrect password or corrupted vault");
  }

  return sodium.to_string(decrypted);
}

export async function checkPassword(encryptedMnemonics: string, password: string): Promise<boolean> {
  const decrypted = await decryptMnemonic(encryptedMnemonics, password);

  if (!decrypted) {
    return false;
  }

  return true;
}
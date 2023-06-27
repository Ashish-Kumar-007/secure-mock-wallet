import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";

const privateKey = secp256k1.utils.randomPrivateKey();
const publicKey = secp256k1.getPublicKey(privateKey);

// Step 1: Slice off the first byte
const slicedPublicKey = publicKey.slice(1);

// Step 2: Take the keccak hash of the sliced public key
const hashedPublicKey = keccak256(slicedPublicKey);

// Step 3: Take the last 20 bytes of the keccak hash
const ethereumAddress = toHex(hashedPublicKey.slice(-20));

console.log("PRIVATE KEY: ", privateKey);
console.log(`PUBLIC KEY: 0x${ethereumAddress}`);

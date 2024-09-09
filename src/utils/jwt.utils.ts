import jwt from "jsonwebtoken";
import config from "config";
import { any } from "zod";
const crypto = require('crypto');

const privateKey = config.get("privateKey") as string;

export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256"
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, privateKey);

    return { valid: true, expired: false, decoded };
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === "jwt expired",
      decoded: null,
    };
  }
}

export function generateJWT() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  const data = {
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs1' }),
    publicKey: publicKey.export({ format: 'pem', type: 'pkcs1' }),
  };

  return data;
}

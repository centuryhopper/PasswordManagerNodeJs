
// Credits to PedroTech's youtube video: https://www.youtube.com/watch?v=aPZSWFZWOzI

const cryptoVar = require("crypto");

// SECRET_STRING must be EXACTLY characters 32 characters long
import { SECRET_STRING } from "./secrets"


interface encryptionObj
{
  iv: string, password: string
}

const encrypt = (password : string) : encryptionObj => {
  // Identifier to your encryption
  const iv : Buffer = Buffer.from(cryptoVar.randomBytes(16));
  const cipher = cryptoVar.createCipheriv("aes-256-ctr", Buffer.from(SECRET_STRING), iv);

  const encryptedPassword : Buffer = Buffer.concat([
    cipher.update(password),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    password: encryptedPassword.toString("hex"),
  };
};

const decrypt = (encryption: encryptionObj) : string => {
  const decipher = cryptoVar.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(SECRET_STRING),
    Buffer.from(encryption.iv, "hex")
  );

  const decryptedPassword = Buffer.concat([
    decipher.update(Buffer.from(encryption.password, "hex")),
    decipher.final(),
  ]);

  return decryptedPassword.toString();
};

module.exports = { encrypt, decrypt };

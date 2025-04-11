const jwt = require("jsonwebtoken");

async function generateJWT(payload) {
  let token = await jwt.sign(payload, "asdad");
  return token;
}

async function verifyJWT(token) {
  try {
    let data = await jwt.verify(token, "asdad");
    return data;
  } catch (err) {
    return false;
  }
}

async function decodeJWT(token) {
  let decoded = await jwt.decode(token);
  return decoded;
}

module.exports = { generateJWT, verifyJWT, decodeJWT };

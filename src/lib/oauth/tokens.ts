import { env } from '@lib/env';
import { createRemoteJWKSet, jwtVerify, SignJWT, exportJWK, generateKeyPair, importJWK, JWK, JWTPayload } from 'jose';
import * as path from 'path';

export async function getJWK() {
  const key_path = env.CAT_JWK_PATH ?? './keys';

  const privFile = Bun.file(path.join(key_path, './oauth_jwk.priv'));
  const pubFile = Bun.file(path.join(key_path, './oauth_jwk.pub'));

  let privKey: JWK | null = null;
  let pubKey: JWK | null = null;

  if (await privFile.exists() && await pubFile.exists()) {
    privKey = JSON.parse(await privFile.text());
    pubKey = JSON.parse(await pubFile.text());
  }

  if (!privKey || !pubKey) {
    const keyPair = await generateKeyPair(env.JWK_ALG, {
      crv: 'P-256'
    });

    const kid = crypto.randomUUID();

    privKey = await exportJWK(keyPair.privateKey);
    privKey.kid = kid;
    privKey.alg = env.JWK_ALG;

    pubKey = await exportJWK(keyPair.publicKey);
    pubKey.kid = kid;
    pubKey.alg = env.JWK_ALG;
    pubKey.use = "sig";
    

    await privFile.write(JSON.stringify(privKey));
    await pubFile.write(JSON.stringify(pubKey));
  }

  return {
    privKey,
    pubKey
  }
}

export async function getCryptoKeyFromJwk(jwk: JWK) {
  return await importJWK(jwk, env.JWK_ALG);
}

export const JWKs = createRemoteJWKSet(
  new URL('/.well-known/jwks.json', env.CAT_URL)
);

interface AccessTokenPayload extends JWTPayload {
  sub: string,
  authId: string
}

export async function generateAccessToken(data: AccessTokenPayload) {
  const privJwk = (await getJWK()).privKey;

  const token = await new SignJWT(data)
    .setProtectedHeader({
      alg: env.JWK_ALG,
      kid: privJwk.kid
    })
    .setIssuedAt()
    .setIssuer(env.CAT_URL)
    .setExpirationTime('30 mins') // this should never change
    .sign(privJwk)

  return token;
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKs);
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}
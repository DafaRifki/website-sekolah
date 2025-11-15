import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { JwtPayload } from "../types/auth.types";

// Fix: Add proper type assertion and validation
export const generateTokens = (payload: Omit<JwtPayload, "iat" | "exp">) => {
  // Strict validation of ENV variables
  const jwtSecret = ENV.JWT_SECRET;
  const jwtRefreshSecret = ENV.JWT_REFRESH_SECRET;
  const jwtExpiresIn = ENV.JWT_EXPIRES_IN;
  const jwtRefreshExpiresIn = ENV.JWT_REFRESH_EXPIRES_IN;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }

  // Use explicit string casting and proper options object
  const accessToken = jwt.sign(
    payload as object,
    jwtSecret as jwt.Secret,
    {
      expiresIn: jwtExpiresIn as string | number,
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    payload as object,
    jwtRefreshSecret as jwt.Secret,
    {
      expiresIn: jwtRefreshExpiresIn as string | number,
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const jwtSecret = ENV.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as JwtPayload;
    return decoded;
  } catch (error: any) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const jwtRefreshSecret = ENV.JWT_REFRESH_SECRET;

  if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtRefreshSecret as jwt.Secret
    ) as JwtPayload;
    return decoded;
  } catch (error: any) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Alternative simpler version (backup)
export const generateTokensSimple = (payload: Record<string, any>) => {
  const secret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.JWT_REFRESH_SECRET!;

  const accessToken = jwt.sign(payload, secret, { expiresIn: "24h" });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

export const ENV = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL: process.env.DATABASE_URL as string,

  // JWT - dengan assertion bahwa mereka sudah ada
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",

  // Optional
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
} as const;

// Type untuk environment
export type Environment = typeof ENV;

// Helper function untuk development
export const isDevelopment = () => ENV.NODE_ENV === "development";
export const isProduction = () => ENV.NODE_ENV === "production";
export const isTest = () => ENV.NODE_ENV === "test";

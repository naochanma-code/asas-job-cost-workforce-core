import type { PoolConfig } from "pg";
import { X509Certificate } from "node:crypto";

export function databasePoolOptions(
  url: string,
  env: Record<string, string | undefined> = process.env,
): PoolConfig {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw Error();
  } catch {
    throw Error("Invalid database connection configuration");
  }
  const tls = env.NODE_ENV === "production" || Boolean(env.DATABASE_SSL_CA);
  if (tls) {
    // pg connection-string SSL options replace the explicit ssl object.
    // Reject them instead of allowing an accidental certificate-check bypass.
    if (
      [...parsed.searchParams.keys()].some((k) =>
        k.toLowerCase().startsWith("ssl"),
      )
    )
      throw Error(
        "Database URL SSL parameters are not allowed with verified TLS",
      );
    if (env.NODE_TLS_REJECT_UNAUTHORIZED === "0")
      throw Error("TLS certificate verification must remain enabled");
    if (env.DATABASE_SSL_CA) {
      try {
        if (env.DATABASE_SSL_CA.includes("PRIVATE KEY")) throw Error();
        new X509Certificate(env.DATABASE_SSL_CA);
      } catch {
        throw Error("Invalid database public CA certificate");
      }
    }
  }
  return {
    connectionString: url,
    max: 10,
    ...(tls
      ? {
          ssl: {
            rejectUnauthorized: true,
            ...(env.DATABASE_SSL_CA ? { ca: env.DATABASE_SSL_CA } : {}),
          },
        }
      : {}),
  };
}

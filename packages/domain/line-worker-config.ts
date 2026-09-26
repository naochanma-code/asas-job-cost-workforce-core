export function lineWorkerConfigured(
  env: Record<string, string | undefined>,
): boolean {
  try {
    const origin = new URL(env.WEB_ORIGIN || "");
    const list = (value: string | undefined, pattern: RegExp) => {
      const ids = (value || "").split(",").map((id) => id.trim());
      return ids.length > 0 && ids.every((id) => pattern.test(id));
    };
    return (
      env.LINE_ENABLED === "true" &&
      env.LINE_ENROLLMENT_ENABLED !== "true" &&
      !!env.LINE_CHANNEL_ACCESS_TOKEN?.trim() &&
      !!env.DATABASE_URL?.trim() &&
      origin.protocol === "https:" &&
      !origin.username &&
      !origin.password &&
      !origin.search &&
      !origin.hash &&
      origin.pathname === "/" &&
      list(env.LINE_TEST_USER_IDS, /^U[0-9a-f]{32}$/) &&
      list(env.LINE_TEST_GROUP_IDS, /^C[0-9a-f]{32}$/) &&
      list(
        env.LINE_TEST_PROJECT_IDS,
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i,
      ) &&
      Buffer.from(env.LINE_PAYLOAD_KEY || "", "base64").length === 32
    );
  } catch {
    return false;
  }
}

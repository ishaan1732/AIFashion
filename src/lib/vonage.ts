import { Vonage } from "@vonage/server-sdk";

// Helper to initialize Vonage server SDK safely with environment variables
export function getVonageClient(): Vonage | null {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const applicationId = process.env.VONAGE_APPLICATION_ID;
  const privateKey = process.env.VONAGE_PRIVATE_KEY;

  if (applicationId && privateKey) {
    try {
      return new Vonage({
        applicationId,
        privateKey,
      });
    } catch (err) {
      console.warn("Failed to initialize Vonage with privateKey:", err);
    }
  }

  if (apiKey && apiSecret) {
    try {
      return new Vonage({
        apiKey,
        apiSecret,
      });
    } catch (err) {
      console.warn("Failed to initialize Vonage with apiKey/secret:", err);
    }
  }

  return null;
}

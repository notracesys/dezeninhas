'use server';

/**
 * Verifies the secret code against the environment variable.
 * This function runs only on the server, so the secret code is never exposed to the client.
 * @param code The code entered by the user.
 * @returns A boolean indicating if the code is correct.
 */
export async function verifySecretCode(code: string): Promise<boolean> {
  const serverSecret = process.env.ADMIN_SECRET_CODE;

  if (!serverSecret) {
    console.error('ADMIN_SECRET_CODE environment variable is not set.');
    // In a production environment, you should fail securely.
    // For development, you might have a default, but it's better to require it.
    return false;
  }

  return code === serverSecret;
}

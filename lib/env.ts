/**
 * Environment variable validation and initialization
 * Runs at server startup to ensure all required vars are configured
 */

const REQUIRED_ENV_VARS = ['GITHUB_TOKEN', 'MISTRAL_API_KEY'];
const OPTIONAL_ENV_VARS = ['MISTRAL_MODEL'];

export function validateEnvironment(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please configure these in .env.local`
    );
  }

  // Warn about unconfigured AI providers in development
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.MISTRAL_API_KEY) {
      console.warn(
        'Warning: MISTRAL_API_KEY not configured. ' +
        'Configure MISTRAL_API_KEY for the app to work.'
      );
    }
  }
}

export function getEnvironment() {
  return {
    githubToken: process.env.GITHUB_TOKEN,
    mistralApiKey: process.env.MISTRAL_API_KEY,
    mistralModel: process.env.MISTRAL_MODEL ?? 'mistral-large-latest',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}

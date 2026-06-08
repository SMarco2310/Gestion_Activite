import * as Sentry from '@sentry/node'

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.warn('[Sentry] SENTRY_DSN not set — error tracking disabled')
    return
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.expressIntegration(),
    ],
  })
}

export { Sentry }

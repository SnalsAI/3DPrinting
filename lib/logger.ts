import { prisma } from './prisma';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type LogCategory =
  | 'API'
  | 'AUTH'
  | 'DATABASE'
  | 'PAYMENT'
  | 'EMAIL'
  | '3D_RENDER'
  | 'AI'
  | 'NOTIFICATION'
  | 'SYSTEM'
  | 'PRINT_JOB'
  | 'ORDER'
  | 'MODEL';

export interface LogContext {
  userId?: string;
  metadata?: Record<string, any>;
  error?: Error | string;
  stackTrace?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  endpoint?: string;
}

class Logger {
  private static instance: Logger;
  private isProduction = process.env.NODE_ENV === 'production';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: Error | string | undefined): {
    errorMessage?: string;
    stackTrace?: string;
  } {
    if (!error) return {};

    if (typeof error === 'string') {
      return { errorMessage: error };
    }

    return {
      errorMessage: error.message,
      stackTrace: error.stack,
    };
  }

  private async writeToDatabase(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    try {
      const { errorMessage, stackTrace } = this.formatError(context?.error);

      await prisma.debugLog.create({
        data: {
          level,
          category,
          action,
          message,
          userId: context?.userId,
          metadata: context?.metadata as any,
          error: errorMessage || context?.stackTrace,
          stackTrace: stackTrace || context?.stackTrace,
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          duration: context?.duration,
          endpoint: context?.endpoint,
        },
      });
    } catch (err) {
      // Fallback to console if database write fails
      console.error('[Logger] Failed to write to database:', err);
      console.log(`[${level}] [${category}] ${action}: ${message}`, context);
    }
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    // Console output for development
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${level}] [${category}] ${action}:`;

    switch (level) {
      case 'DEBUG':
        console.log(logPrefix, message, context);
        break;
      case 'INFO':
        console.info(logPrefix, message, context);
        break;
      case 'WARN':
        console.warn(logPrefix, message, context);
        break;
      case 'ERROR':
        console.error(logPrefix, message, context?.error || context);
        break;
    }

    // Write to database (non-blocking)
    this.writeToDatabase(level, category, action, message, context).catch(
      console.error
    );
  }

  debug(
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    this.log('DEBUG', category, action, message, context);
  }

  info(
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    this.log('INFO', category, action, message, context);
  }

  warn(
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    this.log('WARN', category, action, message, context);
  }

  error(
    category: LogCategory,
    action: string,
    message: string,
    context?: LogContext
  ) {
    this.log('ERROR', category, action, message, context);
  }

  // Specialized logging methods for common use cases
  apiRequest(
    method: string,
    endpoint: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.info('API', `${method} ${endpoint}`, 'API request received', {
      userId,
      endpoint,
      metadata,
    });
  }

  apiResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) {
    const level = statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'WARN' : 'INFO';
    this.log(
      level,
      'API',
      `${method} ${endpoint}`,
      `API response: ${statusCode}`,
      {
        userId,
        endpoint,
        duration,
        metadata: { statusCode },
      }
    );
  }

  apiError(
    method: string,
    endpoint: string,
    error: Error | string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.error('API', `${method} ${endpoint}`, 'API error occurred', {
      userId,
      endpoint,
      error,
      metadata,
    });
  }

  authEvent(action: string, message: string, userId?: string, metadata?: Record<string, any>) {
    this.info('AUTH', action, message, { userId, metadata });
  }

  authError(action: string, message: string, error?: Error | string, metadata?: Record<string, any>) {
    this.error('AUTH', action, message, { error, metadata });
  }

  databaseQuery(action: string, message: string, duration?: number, metadata?: Record<string, any>) {
    this.debug('DATABASE', action, message, { duration, metadata });
  }

  databaseError(action: string, message: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('DATABASE', action, message, { error, metadata });
  }

  paymentEvent(action: string, message: string, userId?: string, metadata?: Record<string, any>) {
    this.info('PAYMENT', action, message, { userId, metadata });
  }

  paymentError(action: string, message: string, error: Error | string, userId?: string, metadata?: Record<string, any>) {
    this.error('PAYMENT', action, message, { userId, error, metadata });
  }

  emailSent(to: string, subject: string, metadata?: Record<string, any>) {
    this.info('EMAIL', 'Send Email', `Email sent to ${to}: ${subject}`, { metadata });
  }

  emailError(to: string, subject: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('EMAIL', 'Send Email', `Failed to send email to ${to}: ${subject}`, { error, metadata });
  }

  aiRequest(action: string, message: string, duration?: number, metadata?: Record<string, any>) {
    this.info('AI', action, message, { duration, metadata });
  }

  aiError(action: string, message: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('AI', action, message, { error, metadata });
  }

  notificationSent(userId: string, type: string, message: string, metadata?: Record<string, any>) {
    this.info('NOTIFICATION', `Send ${type}`, message, { userId, metadata });
  }

  notificationError(userId: string, type: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('NOTIFICATION', `Send ${type}`, 'Failed to send notification', { userId, error, metadata });
  }

  orderEvent(orderId: string, action: string, message: string, userId?: string, metadata?: Record<string, any>) {
    this.info('ORDER', action, message, { userId, metadata: { ...metadata, orderId } });
  }

  orderError(orderId: string, action: string, message: string, error: Error | string, userId?: string, metadata?: Record<string, any>) {
    this.error('ORDER', action, message, { userId, error, metadata: { ...metadata, orderId } });
  }

  printJobEvent(jobId: string, action: string, message: string, metadata?: Record<string, any>) {
    this.info('PRINT_JOB', action, message, { metadata: { ...metadata, jobId } });
  }

  printJobError(jobId: string, action: string, message: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('PRINT_JOB', action, message, { error, metadata: { ...metadata, jobId } });
  }

  modelEvent(modelId: string, action: string, message: string, userId?: string, metadata?: Record<string, any>) {
    this.info('MODEL', action, message, { userId, metadata: { ...metadata, modelId } });
  }

  modelError(modelId: string, action: string, message: string, error: Error | string, userId?: string, metadata?: Record<string, any>) {
    this.error('MODEL', action, message, { userId, error, metadata: { ...metadata, modelId } });
  }

  systemEvent(action: string, message: string, metadata?: Record<string, any>) {
    this.info('SYSTEM', action, message, { metadata });
  }

  systemError(action: string, message: string, error: Error | string, metadata?: Record<string, any>) {
    this.error('SYSTEM', action, message, { error, metadata });
  }

  // Performance monitoring
  startTimer(label: string): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      return duration;
    };
  }
}

export const logger = Logger.getInstance();
export default logger;

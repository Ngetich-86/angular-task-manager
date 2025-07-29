// import { MiddlewareHandler } from "hono";

// export const logger: MiddlewareHandler = async (c, next) => {
//   const start = Date.now();
//   const method = c.req.method;
//   const url = c.req.url;
//   const path = new URL(url).pathname;
  
//   // Log request start
//   console.log(`\n📥 ${method} ${path} - Request started`);
  
//   try {
//     // Process the request
//     await next();
    
//     // Calculate response time
//     const end = Date.now();
//     const responseTime = end - start;
//     const status = c.res.status;
    
//     // Determine log level based on status code
//     let logLevel = "✅";
//     if (status >= 400 && status < 500) {
//       logLevel = "⚠️";
//     } else if (status >= 500) {
//       logLevel = "❌";
//     }
    
//     // Log response
//     console.log(`${logLevel} ${method} ${path} - ${status} (${responseTime}ms)`);
    
//     // Log additional info for errors
//     if (status >= 400) {
//       console.log(`   Error: ${c.res.statusText || "Unknown error"}`);
//     }
    
//   } catch (error) {
//     const end = Date.now();
//     const responseTime = end - start;
    
//     console.error(`❌ ${method} ${path} - Error (${responseTime}ms)`);
//     console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    
//     // Re-throw the error to maintain the error handling chain
//     throw error;
//   }
// };

// // Additional utility logger for application events
// export const appLogger = {
//   info: (message: string, data?: any) => {
//     console.log(`ℹ️  ${message}`, data ? data : "");
//   },
  
//   success: (message: string, data?: any) => {
//     console.log(`✅ ${message}`, data ? data : "");
//   },
  
//   warning: (message: string, data?: any) => {
//     console.log(`⚠️  ${message}`, data ? data : "");
//   },
  
//   error: (message: string, error?: any) => {
//     console.error(`❌ ${message}`, error ? error : "");
//   },
  
//   debug: (message: string, data?: any) => {
//     if (process.env.NODE_ENV === "development") {
//       console.log(`🐛 ${message}`, data ? data : "");
//     }
//   }
// };

import { MiddlewareHandler } from "hono";

// Helper function to stringify error data safely
const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...(typeof error === 'object' && error !== null ? error : {})
    }, null, 2);
  }
  return JSON.stringify(error, null, 2);
};

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  // Log request start (only in development or test env)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📥 ${method} ${path} - Request started`);
  }
  
  try {
    await next();
    
    const end = Date.now();
    const responseTime = end - start;
    const status = c.res.status;
    
    // Determine log level based on status code
    let logLevel = "✅";
    if (status >= 400 && status < 500) {
      logLevel = "⚠️";
    } else if (status >= 500) {
      logLevel = "❌";
    }
    
    // Format the log message
    const logMessage = `${logLevel} ${method} ${path} - ${status} (${responseTime}ms)`;
    
    // For non-2xx responses, include more context
    if (status >= 400) {
      const resClone = c.res.clone();
      let errorDetails = {};
      
      try {
        const body = await resClone.json().catch(() => ({}));
        errorDetails = {
          statusText: c.res.statusText,
          ...(body && typeof body === 'object' ? { body } : {})
        };
      } catch {
        errorDetails = { statusText: c.res.statusText };
      }
      
      console.log(logMessage);
      // console.log(`   Details:`, stringifyError(errorDetails));
    } else {
      console.log(logMessage);
    }
    
  } catch (error) {
    const end = Date.now();
    const responseTime = end - start;
    
    console.error(`❌ ${method} ${path} - Unhandled Error (${responseTime}ms)`);
    // console.error(`   Error:`, stringifyError(error));
    
    throw error;
  }
};

// Enhanced application logger
export const appLogger = {
  info: (message: string, data?: any) => {
    console.log(`ℹ️  ${message}`, data ? stringifyError(data) : "");
  },
  
  success: (message: string, data?: any) => {
    console.log(`✅ ${message}`, data ? stringifyError(data) : "");
  },
  
  warning: (message: string, data?: any) => {
    // console.warn(`⚠️  ${message}`, data ? stringifyError(data) : "");
  },
  
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`);
    if (error) {
      // console.error(`   Details:`, stringifyError(error));
    }
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.log(`🐛 ${message}`, data ? stringifyError(data) : "");
    }
  }
};















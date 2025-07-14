import { MiddlewareHandler } from "hono";

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const path = new URL(url).pathname;
  
  // Log request start
  console.log(`\n📥 ${method} ${path} - Request started`);
  
  try {
    // Process the request
    await next();
    
    // Calculate response time
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
    
    // Log response
    console.log(`${logLevel} ${method} ${path} - ${status} (${responseTime}ms)`);
    
    // Log additional info for errors
    if (status >= 400) {
      console.log(`   Error: ${c.res.statusText || "Unknown error"}`);
    }
    
  } catch (error) {
    const end = Date.now();
    const responseTime = end - start;
    
    console.error(`❌ ${method} ${path} - Error (${responseTime}ms)`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    
    // Re-throw the error to maintain the error handling chain
    throw error;
  }
};

// Additional utility logger for application events
export const appLogger = {
  info: (message: string, data?: any) => {
    console.log(`ℹ️  ${message}`, data ? data : "");
  },
  
  success: (message: string, data?: any) => {
    console.log(`✅ ${message}`, data ? data : "");
  },
  
  warning: (message: string, data?: any) => {
    console.log(`⚠️  ${message}`, data ? data : "");
  },
  
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error ? error : "");
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🐛 ${message}`, data ? data : "");
    }
  }
};



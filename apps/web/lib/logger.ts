export class Logger {
    error(data: Record<string, any>) {
      console.error('[Error]', JSON.stringify(data, null, 2));
    }
  
    warn(data: Record<string, any>) {
      console.warn('[Warning]', JSON.stringify(data, null, 2));
    }
  
    info(data: Record<string, any>) {
      console.info('[Info]', JSON.stringify(data, null, 2));
    }
  }
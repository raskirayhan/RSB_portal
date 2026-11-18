import app from './app.js';
import { ENV } from './config/env.js';
import { CronService } from './services/cronService.js';

// Initialize Automated Background Schedulers
CronService.init();

app.listen(ENV.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 RSB_portal Server running on port: ${ENV.PORT}`);
  console.log(`📡 API Base: http://localhost:${ENV.PORT}/api`);
  console.log(`🩺 Health: http://localhost:${ENV.PORT}/health`);
  console.log(`⚡ Max Devices Allowed per Student: ${ENV.MAX_ALLOWED_DEVICES}`);
  console.log(`======================================================\n`);
});

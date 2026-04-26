import app from "./app";
import { appEnv } from "./config/env";

// start server
const server = app.listen(appEnv.port, () => {
  console.log(`Server running on port ${appEnv.port}`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${appEnv.port} is already in use`);
  } else {
    console.error('Server error:', error);
  }
});

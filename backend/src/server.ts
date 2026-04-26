import app from "./app";
import { appEnv } from "./config/env";

// start server
app.listen(appEnv.port, () => {
  console.log(`Server running on port ${appEnv.port}`);
});

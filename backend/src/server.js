import 'dotenv/config';

import app from './app';

app.listen(process.env.PORT, () => {
  console.log(`Backend Run: PORT ${process.env.PORT} 🚚  🚚 !`);
});

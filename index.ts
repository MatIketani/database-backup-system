import mysqldump from "mysqldump";
import * as dotenv from "dotenv";
import nc from "node-cron";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_IP = process.env.DB_IP as string;
const DATABASE_PORT = process.env.DB_PORT as string;
const DATABASE = process.env.DB_NAME as string;
const DATABASE_USER = process.env.DB_USER as string;
const DATABASE_PASSWORD = process.env.DB_PW as string;

function getFormattedDate(): string {
  const D = new Date();

  return `${D.getDate()}-${D.getMonth()}-${D.getFullYear()}`;
}

async function runDatabaseBackup(): Promise<void> {
  await mysqldump({
    connection: {
      host: DATABASE_IP,
      user: DATABASE_USER,
      port: parseInt(DATABASE_PORT),
      password: DATABASE_PASSWORD,
      database: DATABASE,
    },
    dumpToFile: `../backup/${getFormattedDate()}.sql`,
  });
}

nc.schedule(
  "00 00 12 * * *",
  () => {
    runDatabaseBackup()
      .then(() => {
        console.log(
          `[DATABASE-BACKUP] Backup from day ${getFormattedDate()} has been done successfully.`,
        );
      })
      .catch((err) => {
        console.log(
          `[DATABASE-BACKUP] Backup from day ${getFormattedDate()} failed: ${
            err.message
          }`,
        );
      });
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  },
);

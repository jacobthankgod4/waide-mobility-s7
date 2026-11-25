/* Start a real PostgreSQL server for the console.

   embedded-postgres downloads and runs the actual PostgreSQL binaries, so this
   is a real server with a real TCP port and real SQL — not an in-memory
   imitation. The data directory persists under .tools/pgdata, which is ignored
   by git.

   Usage: node scripts/start-postgres.mjs   (keeps running)
*/

import EmbeddedPostgres from 'embedded-postgres'

const DATA_DIR = './.tools/pgdata'
const PORT = 5433

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: 'postgres',
  password: 'postgres',
  port: PORT,
  persistent: true,
})

async function main() {
  process.stdout.write('initialising cluster in ' + DATA_DIR + '…\n')
  await pg.initialise()
  await pg.start()
  process.stdout.write('postgres listening on 127.0.0.1:' + PORT + '\n')

  try {
    await pg.createDatabase('waide')
    process.stdout.write('created database waide\n')
  } catch (error) {
    process.stdout.write('database waide already present\n')
  }

  process.stdout.write('READY postgres://postgres:postgres@127.0.0.1:' + PORT + '/waide\n')

  const shutdown = async () => {
    try { await pg.stop() } catch (error) { /* already stopped */ }
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  process.stderr.write('postgres failed: ' + error.message + '\n')
  process.exit(1)
})

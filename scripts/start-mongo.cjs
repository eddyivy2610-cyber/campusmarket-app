const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 27017,
      dbName: 'campushive',
    },
  });

  const uri = mongod.getUri();
  console.log(`[MongoMemoryServer] MongoDB listening on ${uri}`);

  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await mongod.stop();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('[MongoMemoryServer] Error starting in-memory mongo:', err);
  process.exit(1);
});

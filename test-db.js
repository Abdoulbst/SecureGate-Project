const { PrismaClient } = require('@prisma/client');

async function test() {
  const url = 'postgresql://postgres:Abdulbst311%40SecureGate@db.tcuwkimbtarmspdibhdl.supabase.co:5432/postgres';
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    const r = await client.$queryRawUnsafe('SELECT 1 as test');
    console.log('Direct connection OK:', r);
  } catch (e) {
    console.error('Direct connection FAIL:', e.message);
    process.exit(1);
  }
  await client.$disconnect();
  console.log('Connection works!');
  process.exit(0);
}

test();

import prisma from '../src/lib/prisma/client';

async function main() {
  try {
    const count = await prisma.event.count();
    console.log('Total events in database:', count);
    
    if (count > 0) {
      const events = await prisma.event.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          eventCode: true,
          year: true,
          status: true,
          unitId: true,
        }
      });
      console.log('\nFirst 5 events:', JSON.stringify(events, null, 2));
    } else {
      console.log('\n⚠️  No events found in database. You may need to import data.');
    }
    
    // Check units
    const unitCount = await prisma.unit.count();
    console.log('\nTotal units:', unitCount);
    
    if (unitCount > 0) {
      const units = await prisma.unit.findMany({
        select: {
          id: true,
          code: true,
          name: true,
        }
      });
      console.log('Units:', JSON.stringify(units, null, 2));
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

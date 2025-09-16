const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  try {
    // Create test admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'ADMIN',
      },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create test team members
    const teamMember1 = await prisma.user.upsert({
      where: { email: 'developer@test.com' },
      update: {},
      create: {
        email: 'developer@test.com',
        name: 'John Developer',
        role: 'TEAM_MEMBER',
      },
    });

    const teamMember2 = await prisma.user.upsert({
      where: { email: 'analyst@test.com' },
      update: {},
      create: {
        email: 'analyst@test.com',
        name: 'Jane Analyst',
        role: 'TEAM_MEMBER',
      },
    });

    console.log('✅ Created team member users');

    // Create team member profiles
    await prisma.teamMember.upsert({
      where: { userId: teamMember1.id },
      update: {},
      create: {
        userId: teamMember1.id,
        position: 'Senior Blockchain Developer',
        department: 'BLOCKCHAIN_INTEGRATION',
        specializations: ['SMART_CONTRACTS', 'DEFI_PROTOCOLS', 'SECURITY_AUDITING'],
        hourlyRate: 75.0,
        maxHoursPerWeek: 40,
        currentWorkload: 20,
        isActive: true,
      },
    });

    await prisma.teamMember.upsert({
      where: { userId: teamMember2.id },
      update: {},
      create: {
        userId: teamMember2.id,
        position: 'Senior Research Analyst',
        department: 'RESEARCH',
        specializations: ['MARKET_ANALYSIS', 'INVESTMENT_ANALYSIS', 'REGULATORY_COMPLIANCE'],
        hourlyRate: 65.0,
        maxHoursPerWeek: 40,
        currentWorkload: 15,
        isActive: true,
      },
    });

    console.log('✅ Created team member profiles');

    // Create test client
    const client = await prisma.user.upsert({
      where: { email: 'client@test.com' },
      update: {},
      create: {
        email: 'client@test.com',
        name: 'Test Client',
        role: 'USER',
      },
    });

    console.log('✅ Created client user');

    // Create test reports
    await prisma.report.create({
      data: {
        userId: client.id,
        title: 'DeFi Protocol Security Analysis',
        description: 'Comprehensive security analysis of our new DeFi protocol',
        type: 'DUE_DILIGENCE',
        priority: 'HIGH',
        complexity: 'COMPLEX',
        estimatedHours: 24,
        status: 'PENDING',
      },
    });

    await prisma.report.create({
      data: {
        userId: client.id,
        title: 'Market Research: Layer 2 Solutions',
        description: 'Research on current Layer 2 scaling solutions',
        type: 'MARKET_RESEARCH',
        priority: 'MEDIUM',
        complexity: 'MEDIUM',
        estimatedHours: 16,
        status: 'PENDING',
      },
    });

    console.log('✅ Created test reports');

    // Create test sessions
    await prisma.session.create({
      data: {
        userId: client.id,
        consultationType: 'STRATEGIC_ADVISORY',
        description: 'Strategic consultation for tokenomics design',
        priority: 'HIGH',
        estimatedHours: 3,
        status: 'PENDING',
      },
    });

    await prisma.session.create({
      data: {
        userId: client.id,
        consultationType: 'TOKEN_LAUNCH',
        description: 'Consultation for upcoming token launch strategy',
        priority: 'URGENT',
        estimatedHours: 4,
        status: 'PENDING',
      },
    });

    console.log('✅ Created test sessions');

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
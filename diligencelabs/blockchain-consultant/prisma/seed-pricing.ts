import { PrismaClient, ConsultationType } from '@prisma/client'

const prisma = new PrismaClient()

const consultationPricing = [
  {
    consultationType: ConsultationType.STRATEGIC_ADVISORY,
    basePricePerHour: 300,
    description: 'Navigate complex blockchain landscapes with expert guidance on technology decisions, regulatory compliance, and market positioning strategies.',
  },
  {
    consultationType: ConsultationType.DUE_DILIGENCE,
    basePricePerHour: 400,
    description: 'Comprehensive analysis of technical architecture, team capabilities, tokenomics, and market potential for investment decisions.',
  },
  {
    consultationType: ConsultationType.BLOCKCHAIN_INTEGRATION_ADVISORY,
    basePricePerHour: 350,
    description: 'Strategic guidance on blockchain deployment choices and technical solution providers for seamless integration.',
  },
  {
    consultationType: ConsultationType.TOKEN_LAUNCH,
    basePricePerHour: 450,
    description: 'End-to-end guidance for successful token launches including regulatory compliance, marketing strategy, and technical implementation.',
  },
]

async function seedPricing() {
  console.log('🌱 Seeding consultation pricing...')

  for (const pricing of consultationPricing) {
    await prisma.consultationPricing.upsert({
      where: { consultationType: pricing.consultationType },
      update: {
        basePricePerHour: pricing.basePricePerHour,
        description: pricing.description,
      },
      create: pricing,
    })
  }

  console.log('✅ Consultation pricing seeded successfully')
}

seedPricing()
  .catch((e) => {
    console.error('❌ Error seeding pricing:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
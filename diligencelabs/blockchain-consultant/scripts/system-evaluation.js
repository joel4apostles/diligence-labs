const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class SystemEvaluator {
  constructor() {
    this.results = {
      database: { passed: 0, failed: 0, issues: [] },
      relationships: { passed: 0, failed: 0, issues: [] },
      performance: { queries: [], slowQueries: [], recommendations: [] },
      dataIntegrity: { passed: 0, failed: 0, issues: [] },
      overall: { score: 0, recommendations: [] }
    }
  }

  async runEvaluation() {
    console.log('🔍 COMPREHENSIVE SYSTEM EVALUATION')
    console.log('=====================================\n')

    try {
      await this.testDatabaseConnectivity()
      await this.testDatabaseSchema()
      await this.testRelationships()
      await this.testDataIntegrity()
      await this.testPerformance()
      await this.generateReport()
    } catch (error) {
      console.error('💥 System evaluation failed:', error)
    } finally {
      await prisma.$disconnect()
    }
  }

  async testDatabaseConnectivity() {
    console.log('1️⃣ Testing Database Connectivity...')
    
    try {
      await prisma.$queryRaw`SELECT 1`
      this.results.database.passed++
      console.log('   ✅ Database connection established')
    } catch (error) {
      this.results.database.failed++
      this.results.database.issues.push('Database connection failed: ' + error.message)
      console.log('   ❌ Database connection failed:', error.message)
    }
  }

  async testDatabaseSchema() {
    console.log('\n2️⃣ Testing Database Schema Integrity...')
    
    const tables = [
      { name: 'User', client: 'user' },
      { name: 'ExpertProfile', client: 'expertProfile' },
      { name: 'Project', client: 'project' },
      { name: 'ProjectAssignment', client: 'projectAssignment' },
      { name: 'ProjectEvaluation', client: 'projectEvaluation' },
      { name: 'ExpertAchievement', client: 'expertAchievement' },
      { name: 'UserReputation', client: 'userReputation' },
      { name: 'RewardDistribution', client: 'rewardDistribution' },
      { name: 'ExpertPayout', client: 'expertPayout' },
      { name: 'UserAchievement', client: 'userAchievement' }
    ]

    for (const table of tables) {
      try {
        const count = await prisma[table.client].count()
        this.results.database.passed++
        console.log(`   ✅ ${table.name} table: ${count} records`)
      } catch (error) {
        this.results.database.failed++
        this.results.database.issues.push(`${table.name} table error: ${error.message}`)
        console.log(`   ❌ ${table.name} table error:`, error.message)
      }
    }
  }

  async testRelationships() {
    console.log('\n3️⃣ Testing Database Relationships...')

    // Test User -> ExpertProfile relationship
    try {
      const usersWithExperts = await prisma.user.findMany({
        include: {
          expertProfile: true
        },
        take: 5
      })
      
      const expertsCount = usersWithExperts.filter(u => u.expertProfile).length
      console.log(`   ✅ User -> ExpertProfile: ${expertsCount}/${usersWithExperts.length} users have expert profiles`)
      this.results.relationships.passed++
    } catch (error) {
      this.results.relationships.failed++
      this.results.relationships.issues.push('User -> ExpertProfile relationship failed')
      console.log('   ❌ User -> ExpertProfile relationship failed:', error.message)
    }

    // Test Project -> Assignment -> Expert relationship
    try {
      const projectsWithAssignments = await prisma.project.findMany({
        include: {
          assignments: {
            include: {
              expert: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        take: 5
      })

      const assignedProjects = projectsWithAssignments.filter(p => p.assignments.length > 0)
      console.log(`   ✅ Project -> Assignment -> Expert: ${assignedProjects.length} projects have assignments`)
      this.results.relationships.passed++
    } catch (error) {
      this.results.relationships.failed++
      this.results.relationships.issues.push('Project relationships failed')
      console.log('   ❌ Project relationships failed:', error.message)
    }

    // Test Expert -> Evaluations relationship
    try {
      const expertsWithEvaluations = await prisma.expertProfile.findMany({
        include: {
          evaluations: {
            include: {
              project: true
            }
          }
        },
        take: 5
      })

      const expertsWithEvals = expertsWithEvaluations.filter(e => e.evaluations.length > 0)
      console.log(`   ✅ Expert -> Evaluations: ${expertsWithEvals.length} experts have evaluations`)
      this.results.relationships.passed++
    } catch (error) {
      this.results.relationships.failed++
      this.results.relationships.issues.push('Expert -> Evaluations relationship failed')
      console.log('   ❌ Expert -> Evaluations relationship failed:', error.message)
    }
  }

  async testDataIntegrity() {
    console.log('\n4️⃣ Testing Data Integrity...')

    // Test orphaned assignments (assignments without valid expert or project)
    try {
      const orphanedAssignments = await prisma.$queryRaw`
        SELECT pa.id, pa.projectId, pa.expertId
        FROM project_assignments pa
        LEFT JOIN projects p ON pa.projectId = p.id
        LEFT JOIN expert_profiles ep ON pa.expertId = ep.id
        WHERE p.id IS NULL OR ep.id IS NULL
      `

      if (orphanedAssignments.length === 0) {
        console.log('   ✅ No orphaned assignments found')
        this.results.dataIntegrity.passed++
      } else {
        console.log(`   ⚠️  ${orphanedAssignments.length} orphaned assignments found`)
        this.results.dataIntegrity.issues.push(`${orphanedAssignments.length} orphaned assignments`)
      }
    } catch (error) {
      this.results.dataIntegrity.failed++
      this.results.dataIntegrity.issues.push('Orphaned assignments check failed')
      console.log('   ❌ Orphaned assignments check failed:', error.message)
    }

    // Test reputation consistency
    try {
      const users = await prisma.user.findMany({
        include: {
          expertProfile: true
        }
      })

      let inconsistentReputation = 0
      for (const user of users) {
        if (user.expertProfile && user.reputationPoints !== user.expertProfile.reputationPoints) {
          inconsistentReputation++
        }
      }

      if (inconsistentReputation === 0) {
        console.log('   ✅ Reputation consistency maintained')
        this.results.dataIntegrity.passed++
      } else {
        console.log(`   ⚠️  ${inconsistentReputation} users have inconsistent reputation`)
        this.results.dataIntegrity.issues.push(`${inconsistentReputation} users with inconsistent reputation`)
      }
    } catch (error) {
      this.results.dataIntegrity.failed++
      this.results.dataIntegrity.issues.push('Reputation consistency check failed')
      console.log('   ❌ Reputation consistency check failed:', error.message)
    }

    // Test project assignment limits
    try {
      const projectsOverLimit = await prisma.project.findMany({
        include: {
          assignments: true
        }
      })

      const overLimitProjects = projectsOverLimit.filter(p => p.assignments.length > 3)
      
      if (overLimitProjects.length === 0) {
        console.log('   ✅ All projects within assignment limits (≤3 experts)')
        this.results.dataIntegrity.passed++
      } else {
        console.log(`   ⚠️  ${overLimitProjects.length} projects exceed assignment limits`)
        this.results.dataIntegrity.issues.push(`${overLimitProjects.length} projects over assignment limit`)
      }
    } catch (error) {
      this.results.dataIntegrity.failed++
      this.results.dataIntegrity.issues.push('Assignment limits check failed')
      console.log('   ❌ Assignment limits check failed:', error.message)
    }
  }

  async testPerformance() {
    console.log('\n5️⃣ Testing Performance...')

    // Test complex queries and measure performance
    const queries = [
      {
        name: 'Expert Dashboard - Available Projects',
        query: async () => {
          const start = Date.now()
          await prisma.project.findMany({
            where: {
              status: {
                in: ['EXPERT_ASSIGNMENT', 'EVALUATION_IN_PROGRESS']
              }
            },
            include: {
              submitter: {
                select: {
                  id: true, name: true, email: true, image: true
                }
              },
              assignments: {
                include: {
                  expert: {
                    include: {
                      user: { select: { name: true, image: true } }
                    }
                  }
                }
              },
              evaluations: {
                include: {
                  expert: {
                    include: {
                      user: { select: { name: true, image: true } }
                    }
                  }
                }
              },
              _count: {
                select: { assignments: true, evaluations: true }
              }
            },
            orderBy: [
              { priorityLevel: 'desc' },
              { createdAt: 'desc' }
            ],
            take: 10
          })
          return Date.now() - start
        }
      },
      {
        name: 'Expert Assignments with Details',
        query: async () => {
          const start = Date.now()
          await prisma.projectAssignment.findMany({
            include: {
              project: {
                include: {
                  submitter: {
                    select: { name: true, email: true, image: true }
                  },
                  assignments: {
                    include: {
                      expert: {
                        include: {
                          user: { select: { name: true, image: true } }
                        }
                      }
                    }
                  },
                  evaluations: true,
                  _count: {
                    select: { assignments: true, evaluations: true }
                  }
                }
              }
            },
            orderBy: [
              { status: 'asc' },
              { acceptedAt: 'desc' }
            ],
            take: 10
          })
          return Date.now() - start
        }
      },
      {
        name: 'Admin Expert Applications',
        query: async () => {
          const start = Date.now()
          await prisma.expertProfile.findMany({
            include: {
              user: {
                select: {
                  id: true, name: true, email: true, image: true, createdAt: true
                }
              },
              evaluations: {
                take: 5,
                orderBy: { submittedAt: 'desc' },
                include: {
                  project: {
                    select: { name: true, category: true }
                  }
                }
              },
              achievements: {
                take: 3,
                orderBy: { awardedAt: 'desc' }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          })
          return Date.now() - start
        }
      }
    ]

    for (const { name, query } of queries) {
      try {
        const duration = await query()
        this.results.performance.queries.push({ name, duration })
        
        if (duration > 1000) {
          this.results.performance.slowQueries.push({ name, duration })
          console.log(`   ⚠️  ${name}: ${duration}ms (SLOW)`)
        } else if (duration > 500) {
          console.log(`   🟡 ${name}: ${duration}ms (MODERATE)`)
        } else {
          console.log(`   ✅ ${name}: ${duration}ms (FAST)`)
        }
      } catch (error) {
        console.log(`   ❌ ${name}: FAILED - ${error.message}`)
        this.results.performance.queries.push({ name, duration: null, error: error.message })
      }
    }
  }

  generateReport() {
    console.log('\n📊 SYSTEM EVALUATION REPORT')
    console.log('============================\n')

    // Calculate overall score
    const totalTests = this.results.database.passed + this.results.database.failed +
                      this.results.relationships.passed + this.results.relationships.failed +
                      this.results.dataIntegrity.passed + this.results.dataIntegrity.failed

    const passedTests = this.results.database.passed + 
                       this.results.relationships.passed + 
                       this.results.dataIntegrity.passed

    this.results.overall.score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

    console.log(`📈 Overall System Health: ${this.results.overall.score}%`)
    console.log(`✅ Passed Tests: ${passedTests}`)
    console.log(`❌ Failed Tests: ${totalTests - passedTests}`)

    // Database Health
    console.log('\n🗄️ Database Health:')
    console.log(`   Passed: ${this.results.database.passed}, Failed: ${this.results.database.failed}`)
    if (this.results.database.issues.length > 0) {
      console.log('   Issues:')
      this.results.database.issues.forEach(issue => console.log(`   - ${issue}`))
    }

    // Relationships Health
    console.log('\n🔗 Relationships Health:')
    console.log(`   Passed: ${this.results.relationships.passed}, Failed: ${this.results.relationships.failed}`)
    if (this.results.relationships.issues.length > 0) {
      console.log('   Issues:')
      this.results.relationships.issues.forEach(issue => console.log(`   - ${issue}`))
    }

    // Data Integrity
    console.log('\n🛡️ Data Integrity:')
    console.log(`   Passed: ${this.results.dataIntegrity.passed}, Failed: ${this.results.dataIntegrity.failed}`)
    if (this.results.dataIntegrity.issues.length > 0) {
      console.log('   Issues:')
      this.results.dataIntegrity.issues.forEach(issue => console.log(`   - ${issue}`))
    }

    // Performance Analysis
    console.log('\n⚡ Performance Analysis:')
    const avgDuration = this.results.performance.queries
      .filter(q => q.duration !== null)
      .reduce((sum, q) => sum + q.duration, 0) / 
      this.results.performance.queries.filter(q => q.duration !== null).length

    console.log(`   Average Query Time: ${Math.round(avgDuration)}ms`)
    console.log(`   Slow Queries (>1s): ${this.results.performance.slowQueries.length}`)

    if (this.results.performance.slowQueries.length > 0) {
      console.log('   Slow Queries:')
      this.results.performance.slowQueries.forEach(q => 
        console.log(`   - ${q.name}: ${q.duration}ms`)
      )
    }

    // Recommendations
    console.log('\n💡 SENIOR ENGINEER RECOMMENDATIONS:')
    console.log('===================================')

    if (this.results.overall.score >= 90) {
      console.log('🟢 EXCELLENT: System is performing very well!')
    } else if (this.results.overall.score >= 75) {
      console.log('🟡 GOOD: System is stable with minor improvements needed')
    } else if (this.results.overall.score >= 60) {
      console.log('🟠 FAIR: System needs attention and optimization')
    } else {
      console.log('🔴 POOR: System requires immediate attention')
    }

    // Performance recommendations
    if (avgDuration > 500) {
      console.log('\n📈 Performance Optimizations Needed:')
      console.log('   1. Add database indexes for frequently queried fields')
      console.log('   2. Implement query result caching for complex joins')
      console.log('   3. Consider pagination for large data sets')
      console.log('   4. Optimize N+1 query patterns')
    }

    // Data integrity recommendations
    if (this.results.dataIntegrity.issues.length > 0) {
      console.log('\n🛡️ Data Integrity Improvements:')
      console.log('   1. Implement database constraints and foreign key validations')
      console.log('   2. Add data consistency checks in business logic')
      console.log('   3. Create automated data cleanup jobs')
      console.log('   4. Implement transaction handling for multi-table operations')
    }

    // Architecture recommendations
    console.log('\n🏗️ Architecture Improvements:')
    console.log('   1. Implement proper error handling and retry mechanisms')
    console.log('   2. Add comprehensive logging and monitoring')
    console.log('   3. Implement rate limiting for API endpoints')
    console.log('   4. Add input validation and sanitization')
    console.log('   5. Consider implementing caching layer (Redis)')
    console.log('   6. Add database connection pooling')
    console.log('   7. Implement proper transaction management')

    console.log('\n🎯 Next Steps:')
    console.log('   1. Fix any failed tests identified above')
    console.log('   2. Implement recommended performance optimizations')
    console.log('   3. Add comprehensive error handling')
    console.log('   4. Set up monitoring and alerting')
    console.log('   5. Create automated testing suite')
    console.log('   6. Implement proper logging strategy')
  }
}

async function runSystemEvaluation() {
  const evaluator = new SystemEvaluator()
  await evaluator.runEvaluation()
}

runSystemEvaluation().catch(console.error)
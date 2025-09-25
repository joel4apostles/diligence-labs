/*
  Warnings:

  - You are about to drop the column `specializations` on the `team_members` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "team_member_specializations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamMemberId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_member_specializations_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "team_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submitterId" TEXT NOT NULL,
    "foundingTeam" TEXT,
    "teamSize" INTEGER,
    "keyPersonnel" TEXT,
    "blockchain" TEXT,
    "technologyStack" TEXT,
    "smartContract" TEXT,
    "repository" TEXT,
    "whitepaper" TEXT,
    "fundingRaised" REAL,
    "currentTraction" TEXT,
    "userBase" INTEGER,
    "monthlyRevenue" REAL,
    "evaluationDeadline" DATETIME,
    "priorityLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "evaluationBudget" REAL,
    "twitterHandle" TEXT,
    "linkedinProfile" TEXT,
    "discordServer" TEXT,
    "telegramGroup" TEXT,
    "overallScore" REAL,
    "teamScore" REAL,
    "pmfScore" REAL,
    "infrastructureScore" REAL,
    "statusScore" REAL,
    "competitiveScore" REAL,
    "riskScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "evaluationStartedAt" DATETIME,
    "evaluationCompletedAt" DATETIME,
    CONSTRAINT "projects_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expert_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "twitterHandle" TEXT,
    "company" TEXT,
    "position" TEXT,
    "yearsExperience" INTEGER,
    "bio" TEXT,
    "primaryExpertise" TEXT,
    "secondaryExpertise" TEXT,
    "reputationPoints" INTEGER NOT NULL DEFAULT 0,
    "expertTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "totalEvaluations" INTEGER NOT NULL DEFAULT 0,
    "accuracyRate" REAL NOT NULL DEFAULT 0.0,
    "averageRating" REAL NOT NULL DEFAULT 0.0,
    "totalRewards" REAL NOT NULL DEFAULT 0.0,
    "currentStake" REAL NOT NULL DEFAULT 0.0,
    "stakedTokens" REAL NOT NULL DEFAULT 0.0,
    "monthlyEvaluations" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "penaltyCount" INTEGER NOT NULL DEFAULT 0,
    "slashedAmount" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verifiedAt" DATETIME,
    CONSTRAINT "expert_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "teamScore" REAL,
    "teamComments" TEXT,
    "pmfScore" REAL,
    "pmfComments" TEXT,
    "infrastructureScore" REAL,
    "infrastructureComments" TEXT,
    "statusScore" REAL,
    "statusComments" TEXT,
    "competitiveScore" REAL,
    "competitiveComments" TEXT,
    "riskScore" REAL,
    "riskComments" TEXT,
    "overallScore" REAL,
    "overallComments" TEXT,
    "recommendation" TEXT,
    "confidenceLevel" REAL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "timeSpent" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "baseReward" REAL,
    "qualityBonus" REAL,
    "consensusBonus" REAL,
    "totalReward" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    CONSTRAINT "project_evaluations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_evaluations_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "expert_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL DEFAULT 'PRIMARY',
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "estimatedHours" INTEGER,
    "deadline" DATETIME,
    "specialization" TEXT,
    "stakeRequired" REAL,
    "stakeAmount" REAL,
    "stakeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "project_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_assignments_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "expert_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expert_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expertId" TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "criteria" TEXT,
    "progress" TEXT,
    "badgeImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expert_achievements_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "expert_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reward_distributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "totalFee" REAL NOT NULL,
    "platformFee" REAL NOT NULL,
    "expertsPool" REAL NOT NULL,
    "distributionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reward_distributions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expert_payouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rewardDistributionId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "payoutType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionHash" TEXT,
    "payoutDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expert_payouts_rewardDistributionId_fkey" FOREIGN KEY ("rewardDistributionId") REFERENCES "reward_distributions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "expert_payouts_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "expert_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planType" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "featureValue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_reputations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badgesEarned" TEXT,
    "projectsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0.0,
    "completionRate" REAL NOT NULL DEFAULT 0.0,
    "tierProgress" REAL NOT NULL DEFAULT 0.0,
    "nextTierPoints" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_reputations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userReputationId" TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "badgeImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_userReputationId_fkey" FOREIGN KEY ("userReputationId") REFERENCES "user_reputations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT NOT NULL,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" REAL NOT NULL DEFAULT 0.0,
    "averageGasUsed" REAL NOT NULL DEFAULT 0.0,
    "firstTransactionDate" DATETIME,
    "lastTransactionDate" DATETIME,
    "transactionScore" REAL NOT NULL DEFAULT 0.0,
    "riskScore" REAL NOT NULL DEFAULT 0.0,
    "activityScore" REAL NOT NULL DEFAULT 0.0,
    "signatureProof" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wallet_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "profileUrl" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT NOT NULL,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "accountAge" INTEGER NOT NULL DEFAULT 0,
    "verificationProof" TEXT,
    "verifiedAt" DATETIME,
    "influenceScore" REAL NOT NULL DEFAULT 0.0,
    "engagementScore" REAL NOT NULL DEFAULT 0.0,
    "credibilityScore" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "social_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletConnectionId" TEXT,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "uniqueContracts" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" REAL NOT NULL DEFAULT 0.0,
    "averageValue" REAL NOT NULL DEFAULT 0.0,
    "daysSinceFirst" INTEGER NOT NULL DEFAULT 0,
    "transactionFrequency" REAL NOT NULL DEFAULT 0.0,
    "consistencyScore" REAL NOT NULL DEFAULT 0.0,
    "highRiskTransactions" INTEGER NOT NULL DEFAULT 0,
    "suspiciousPatterns" INTEGER NOT NULL DEFAULT 0,
    "riskScore" REAL NOT NULL DEFAULT 0.0,
    "defiInteractions" INTEGER NOT NULL DEFAULT 0,
    "nftTransactions" INTEGER NOT NULL DEFAULT 0,
    "stakingActivity" INTEGER NOT NULL DEFAULT 0,
    "daoParticipation" INTEGER NOT NULL DEFAULT 0,
    "reputationMultiplier" REAL NOT NULL DEFAULT 1.0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL,
    CONSTRAINT "transaction_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_scores_walletConnectionId_fkey" FOREIGN KEY ("walletConnectionId") REFERENCES "wallet_connections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reputation_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "previousPoints" INTEGER NOT NULL,
    "newPoints" INTEGER NOT NULL,
    "pointsChanged" INTEGER NOT NULL,
    "changeReason" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDescription" TEXT,
    "relatedEntityId" TEXT,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "multiplier" REAL NOT NULL DEFAULT 1.0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "verificationBonus" INTEGER NOT NULL DEFAULT 0,
    "connectionBonus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reputation_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "platform_engagements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "maxLoginStreak" INTEGER NOT NULL DEFAULT 0,
    "totalLogins" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" REAL NOT NULL DEFAULT 0.0,
    "projectsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "evaluationsCompleted" INTEGER NOT NULL DEFAULT 0,
    "commentsPosted" INTEGER NOT NULL DEFAULT 0,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0.0,
    "positiveReviews" INTEGER NOT NULL DEFAULT 0,
    "communityKarma" INTEGER NOT NULL DEFAULT 0,
    "featuresUsed" TEXT,
    "advancedFeatures" INTEGER NOT NULL DEFAULT 0,
    "apiUsage" INTEGER NOT NULL DEFAULT 0,
    "firstLogin" DATETIME,
    "lastLogin" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "platform_engagements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reputation_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "requiredPoints" INTEGER,
    "requiredLevel" INTEGER,
    "requiredConnections" TEXT,
    "requiredActions" TEXT,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "awardReason" TEXT,
    "relatedEvent" TEXT,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "reputation_badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hourlyRate" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxHoursPerWeek" INTEGER NOT NULL DEFAULT 40,
    "currentWorkload" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_team_members" ("createdAt", "currentWorkload", "department", "hourlyRate", "id", "isActive", "maxHoursPerWeek", "position", "updatedAt", "userId") SELECT "createdAt", "currentWorkload", "department", "hourlyRate", "id", "isActive", "maxHoursPerWeek", "position", "updatedAt", "userId" FROM "team_members";
DROP TABLE "team_members";
ALTER TABLE "new_team_members" RENAME TO "team_members";
CREATE UNIQUE INDEX "team_members_userId_key" ON "team_members"("userId");
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");
CREATE INDEX "team_members_department_idx" ON "team_members"("department");
CREATE INDEX "team_members_isActive_idx" ON "team_members"("isActive");
CREATE INDEX "team_members_isActive_department_idx" ON "team_members"("isActive", "department");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "googleId" TEXT,
    "githubId" TEXT,
    "twitterId" TEXT,
    "walletAddress" TEXT,
    "walletConnected" BOOLEAN NOT NULL DEFAULT false,
    "walletVerified" BOOLEAN NOT NULL DEFAULT false,
    "twitterConnected" BOOLEAN NOT NULL DEFAULT false,
    "twitterVerified" BOOLEAN NOT NULL DEFAULT false,
    "twitterHandle" TEXT,
    "twitterFollowers" INTEGER NOT NULL DEFAULT 0,
    "linkedinConnected" BOOLEAN NOT NULL DEFAULT false,
    "linkedinVerified" BOOLEAN NOT NULL DEFAULT false,
    "linkedinUrl" TEXT,
    "githubConnected" BOOLEAN NOT NULL DEFAULT false,
    "githubVerified" BOOLEAN NOT NULL DEFAULT false,
    "githubUsername" TEXT,
    "githubFollowers" INTEGER NOT NULL DEFAULT 0,
    "githubRepos" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpiry" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLogin" DATETIME,
    "accountLockedUntil" DATETIME,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "accountStatusReason" TEXT,
    "statusChangedAt" DATETIME,
    "statusChangedBy" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" DATETIME,
    "freeConsultationUsed" BOOLEAN NOT NULL DEFAULT false,
    "freeConsultationDate" DATETIME,
    "stripeCustomerId" TEXT,
    "reputationPoints" INTEGER NOT NULL DEFAULT 0,
    "submitterTier" TEXT NOT NULL DEFAULT 'BASIC',
    "totalProjectsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "successfulProjects" INTEGER NOT NULL DEFAULT 0,
    "averageProjectScore" REAL NOT NULL DEFAULT 0.0,
    "monthlyProjectLimit" INTEGER NOT NULL DEFAULT 1,
    "monthlyProjectsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("accountLockedUntil", "accountStatus", "accountStatusReason", "createdAt", "email", "emailVerificationExpiry", "emailVerificationToken", "emailVerified", "failedLoginAttempts", "freeConsultationDate", "freeConsultationUsed", "githubId", "googleId", "id", "image", "lastFailedLogin", "name", "password", "passwordResetExpiry", "passwordResetToken", "role", "statusChangedAt", "statusChangedBy", "stripeCustomerId", "twitterId", "updatedAt", "walletAddress") SELECT "accountLockedUntil", "accountStatus", "accountStatusReason", "createdAt", "email", "emailVerificationExpiry", "emailVerificationToken", "emailVerified", "failedLoginAttempts", "freeConsultationDate", "freeConsultationUsed", "githubId", "googleId", "id", "image", "lastFailedLogin", "name", "password", "passwordResetExpiry", "passwordResetToken", "role", "statusChangedAt", "statusChangedBy", "stripeCustomerId", "twitterId", "updatedAt", "walletAddress" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");
CREATE UNIQUE INDEX "users_twitterId_key" ON "users"("twitterId");
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_accountStatus_idx" ON "users"("accountStatus");
CREATE INDEX "users_failedLoginAttempts_idx" ON "users"("failedLoginAttempts");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "users_role_accountStatus_idx" ON "users"("role", "accountStatus");
CREATE INDEX "users_failedLoginAttempts_lastFailedLogin_idx" ON "users"("failedLoginAttempts", "lastFailedLogin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "team_member_specializations_teamMemberId_idx" ON "team_member_specializations"("teamMemberId");

-- CreateIndex
CREATE INDEX "team_member_specializations_specialization_idx" ON "team_member_specializations"("specialization");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_specializations_teamMemberId_specialization_key" ON "team_member_specializations"("teamMemberId", "specialization");

-- CreateIndex
CREATE INDEX "projects_submitterId_idx" ON "projects"("submitterId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_category_idx" ON "projects"("category");

-- CreateIndex
CREATE INDEX "projects_priorityLevel_idx" ON "projects"("priorityLevel");

-- CreateIndex
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- CreateIndex
CREATE INDEX "projects_evaluationDeadline_idx" ON "projects"("evaluationDeadline");

-- CreateIndex
CREATE INDEX "projects_status_category_idx" ON "projects"("status", "category");

-- CreateIndex
CREATE INDEX "projects_status_createdAt_idx" ON "projects"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "expert_profiles_userId_key" ON "expert_profiles"("userId");

-- CreateIndex
CREATE INDEX "expert_profiles_userId_idx" ON "expert_profiles"("userId");

-- CreateIndex
CREATE INDEX "expert_profiles_verificationStatus_idx" ON "expert_profiles"("verificationStatus");

-- CreateIndex
CREATE INDEX "expert_profiles_expertTier_idx" ON "expert_profiles"("expertTier");

-- CreateIndex
CREATE INDEX "expert_profiles_reputationPoints_idx" ON "expert_profiles"("reputationPoints");

-- CreateIndex
CREATE INDEX "expert_profiles_totalEvaluations_idx" ON "expert_profiles"("totalEvaluations");

-- CreateIndex
CREATE INDEX "expert_profiles_accuracyRate_idx" ON "expert_profiles"("accuracyRate");

-- CreateIndex
CREATE INDEX "expert_profiles_verificationStatus_expertTier_idx" ON "expert_profiles"("verificationStatus", "expertTier");

-- CreateIndex
CREATE INDEX "expert_profiles_reputationPoints_expertTier_idx" ON "expert_profiles"("reputationPoints", "expertTier");

-- CreateIndex
CREATE INDEX "project_evaluations_projectId_idx" ON "project_evaluations"("projectId");

-- CreateIndex
CREATE INDEX "project_evaluations_expertId_idx" ON "project_evaluations"("expertId");

-- CreateIndex
CREATE INDEX "project_evaluations_status_idx" ON "project_evaluations"("status");

-- CreateIndex
CREATE INDEX "project_evaluations_submittedAt_idx" ON "project_evaluations"("submittedAt");

-- CreateIndex
CREATE INDEX "project_evaluations_overallScore_idx" ON "project_evaluations"("overallScore");

-- CreateIndex
CREATE INDEX "project_evaluations_status_expertId_idx" ON "project_evaluations"("status", "expertId");

-- CreateIndex
CREATE INDEX "project_evaluations_status_projectId_idx" ON "project_evaluations"("status", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_evaluations_projectId_expertId_key" ON "project_evaluations"("projectId", "expertId");

-- CreateIndex
CREATE INDEX "project_assignments_projectId_idx" ON "project_assignments"("projectId");

-- CreateIndex
CREATE INDEX "project_assignments_expertId_idx" ON "project_assignments"("expertId");

-- CreateIndex
CREATE INDEX "project_assignments_status_idx" ON "project_assignments"("status");

-- CreateIndex
CREATE INDEX "project_assignments_assignmentType_idx" ON "project_assignments"("assignmentType");

-- CreateIndex
CREATE INDEX "project_assignments_deadline_idx" ON "project_assignments"("deadline");

-- CreateIndex
CREATE INDEX "project_assignments_status_expertId_idx" ON "project_assignments"("status", "expertId");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignments_projectId_expertId_key" ON "project_assignments"("projectId", "expertId");

-- CreateIndex
CREATE INDEX "expert_achievements_expertId_idx" ON "expert_achievements"("expertId");

-- CreateIndex
CREATE INDEX "expert_achievements_achievementType_idx" ON "expert_achievements"("achievementType");

-- CreateIndex
CREATE INDEX "expert_achievements_awardedAt_idx" ON "expert_achievements"("awardedAt");

-- CreateIndex
CREATE INDEX "expert_achievements_expertId_achievementType_idx" ON "expert_achievements"("expertId", "achievementType");

-- CreateIndex
CREATE INDEX "reward_distributions_projectId_idx" ON "reward_distributions"("projectId");

-- CreateIndex
CREATE INDEX "reward_distributions_status_idx" ON "reward_distributions"("status");

-- CreateIndex
CREATE INDEX "reward_distributions_distributionDate_idx" ON "reward_distributions"("distributionDate");

-- CreateIndex
CREATE INDEX "expert_payouts_rewardDistributionId_idx" ON "expert_payouts"("rewardDistributionId");

-- CreateIndex
CREATE INDEX "expert_payouts_expertId_idx" ON "expert_payouts"("expertId");

-- CreateIndex
CREATE INDEX "expert_payouts_status_idx" ON "expert_payouts"("status");

-- CreateIndex
CREATE INDEX "expert_payouts_payoutDate_idx" ON "expert_payouts"("payoutDate");

-- CreateIndex
CREATE INDEX "subscription_features_planType_idx" ON "subscription_features"("planType");

-- CreateIndex
CREATE INDEX "subscription_features_isActive_idx" ON "subscription_features"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_features_planType_featureName_key" ON "subscription_features"("planType", "featureName");

-- CreateIndex
CREATE UNIQUE INDEX "user_reputations_userId_key" ON "user_reputations"("userId");

-- CreateIndex
CREATE INDEX "user_reputations_userId_idx" ON "user_reputations"("userId");

-- CreateIndex
CREATE INDEX "user_reputations_totalPoints_idx" ON "user_reputations"("totalPoints");

-- CreateIndex
CREATE INDEX "user_reputations_level_idx" ON "user_reputations"("level");

-- CreateIndex
CREATE INDEX "user_achievements_userReputationId_idx" ON "user_achievements"("userReputationId");

-- CreateIndex
CREATE INDEX "user_achievements_achievementType_idx" ON "user_achievements"("achievementType");

-- CreateIndex
CREATE INDEX "user_achievements_awardedAt_idx" ON "user_achievements"("awardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_connections_walletAddress_key" ON "wallet_connections"("walletAddress");

-- CreateIndex
CREATE INDEX "wallet_connections_userId_idx" ON "wallet_connections"("userId");

-- CreateIndex
CREATE INDEX "wallet_connections_walletAddress_idx" ON "wallet_connections"("walletAddress");

-- CreateIndex
CREATE INDEX "wallet_connections_blockchain_idx" ON "wallet_connections"("blockchain");

-- CreateIndex
CREATE INDEX "wallet_connections_isVerified_idx" ON "wallet_connections"("isVerified");

-- CreateIndex
CREATE INDEX "wallet_connections_transactionScore_idx" ON "wallet_connections"("transactionScore");

-- CreateIndex
CREATE INDEX "social_connections_userId_idx" ON "social_connections"("userId");

-- CreateIndex
CREATE INDEX "social_connections_platform_idx" ON "social_connections"("platform");

-- CreateIndex
CREATE INDEX "social_connections_platformId_idx" ON "social_connections"("platformId");

-- CreateIndex
CREATE INDEX "social_connections_isVerified_idx" ON "social_connections"("isVerified");

-- CreateIndex
CREATE INDEX "social_connections_influenceScore_idx" ON "social_connections"("influenceScore");

-- CreateIndex
CREATE UNIQUE INDEX "social_connections_userId_platform_key" ON "social_connections"("userId", "platform");

-- CreateIndex
CREATE INDEX "transaction_scores_userId_idx" ON "transaction_scores"("userId");

-- CreateIndex
CREATE INDEX "transaction_scores_walletConnectionId_idx" ON "transaction_scores"("walletConnectionId");

-- CreateIndex
CREATE INDEX "transaction_scores_totalVolume_idx" ON "transaction_scores"("totalVolume");

-- CreateIndex
CREATE INDEX "transaction_scores_riskScore_idx" ON "transaction_scores"("riskScore");

-- CreateIndex
CREATE INDEX "transaction_scores_reputationMultiplier_idx" ON "transaction_scores"("reputationMultiplier");

-- CreateIndex
CREATE INDEX "reputation_history_userId_idx" ON "reputation_history"("userId");

-- CreateIndex
CREATE INDEX "reputation_history_changeReason_idx" ON "reputation_history"("changeReason");

-- CreateIndex
CREATE INDEX "reputation_history_eventType_idx" ON "reputation_history"("eventType");

-- CreateIndex
CREATE INDEX "reputation_history_createdAt_idx" ON "reputation_history"("createdAt");

-- CreateIndex
CREATE INDEX "platform_engagements_userId_idx" ON "platform_engagements"("userId");

-- CreateIndex
CREATE INDEX "platform_engagements_loginStreak_idx" ON "platform_engagements"("loginStreak");

-- CreateIndex
CREATE INDEX "platform_engagements_totalLogins_idx" ON "platform_engagements"("totalLogins");

-- CreateIndex
CREATE INDEX "platform_engagements_averageRating_idx" ON "platform_engagements"("averageRating");

-- CreateIndex
CREATE UNIQUE INDEX "reputation_badges_name_key" ON "reputation_badges"("name");

-- CreateIndex
CREATE INDEX "reputation_badges_category_idx" ON "reputation_badges"("category");

-- CreateIndex
CREATE INDEX "reputation_badges_rarity_idx" ON "reputation_badges"("rarity");

-- CreateIndex
CREATE INDEX "reputation_badges_isActive_idx" ON "reputation_badges"("isActive");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_awardedAt_idx" ON "user_badges"("awardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

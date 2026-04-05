-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'submitted', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('lead', 'trial', 'active', 'churned');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "apiKeyPrefix" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'Starter',
    "monthlyVolumeUsd" TEXT NOT NULL DEFAULT '0',
    "status" "CustomerStatus" NOT NULL DEFAULT 'lead',
    "source" TEXT NOT NULL DEFAULT 'pricing',
    "walletPublicKey" TEXT,
    "notes" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "sourceAccount" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "memo" TEXT,
    "network" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'submitted',
    "operationCount" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEvent" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "kind" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "network" TEXT,
    "txHash" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformEarning" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexCursor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cursor" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndexCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_publicKey_key" ON "Agent"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_apiKeyPrefix_key" ON "Agent"("apiKeyPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_walletPublicKey_key" ON "Customer"("walletPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_agentId_key" ON "Customer"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "AgentEvent_agentId_createdAt_idx" ON "AgentEvent"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentEvent_kind_createdAt_idx" ON "AgentEvent"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEarning_txHash_key" ON "PlatformEarning"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "IndexCursor_name_key" ON "IndexCursor"("name");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEvent" ADD CONSTRAINT "AgentEvent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

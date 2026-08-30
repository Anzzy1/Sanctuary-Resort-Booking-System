-- Alter enum value: add "verifying" to PaymentStatus
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'verifying';

-- AlterTable: add GCash verification fields
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "referenceNumber" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "senderName" TEXT;

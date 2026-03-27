-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('zalo_personal', 'zalo_oa', 'facebook', 'gmail', 'phone');

-- CreateEnum
CREATE TYPE "JourneyState" AS ENUM ('searching', 'holding', 'ticketed', 'cancelled');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('agent', 'customer', 'system');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('processing', 'success', 'failed');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "MemberTier" AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('individual', 'business', 'agent');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('personal', 'group');

-- CreateEnum
CREATE TYPE "ConversationTag" AS ENUM ('other', 'business');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('oauth2', 'browser_session');

-- CreateEnum
CREATE TYPE "LinkAccountStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "account_customer" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "linked_account_id" TEXT NOT NULL,
    "name" TEXT,
    "golden_profile_id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_customers" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "account_customer_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "linked_account_id" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "external_id" TEXT,
    "type" "ConversationType" NOT NULL DEFAULT 'personal',
    "tag" "ConversationTag" NOT NULL DEFAULT 'other',
    "journey_state" "JourneyState",
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_customer_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_profiles" (
    "id" TEXT NOT NULL,
    "full_name" TEXT,
    "gender" "Gender",
    "date_of_birth" DATE,
    "primary_phone" VARCHAR(20),
    "primary_email" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "member_tier" "MemberTier",
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "customer_type" "CustomerType" NOT NULL DEFAULT 'individual',
    "elines_customer_id" VARCHAR(50),
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "journey_state" "JourneyState",
    "characteristics" TEXT,
    "staff_notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "golden_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_accounts" (
    "id" TEXT NOT NULL,
    "provider" "ChannelType" NOT NULL,
    "linked_by_user_id" TEXT NOT NULL,
    "provider_credentials_id" TEXT,
    "display_name" TEXT,
    "account_id" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "LinkAccountStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "link_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_type" "MessageSender" NOT NULL,
    "account_customer_id" TEXT,
    "user_id" TEXT,
    "content" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'processing',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "external_id" VARCHAR(255),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "file_type" VARCHAR(100),
    "file_url" TEXT,
    "thumbnail_url" TEXT,
    "file_mime_type" VARCHAR(100),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "key" VARCHAR(255),

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_credential" (
    "id" TEXT NOT NULL,
    "credential_type" "CredentialType" NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "credential_payload" JSONB,
    "link_account_id" TEXT NOT NULL,

    CONSTRAINT "provider_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "phone" TEXT,
    "role_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_customer_account_id_linked_account_id_key" ON "account_customer"("account_id", "linked_account_id");

-- CreateIndex
CREATE INDEX "last_activity_at" ON "conversations"("last_activity_at" DESC);

-- CreateIndex
CREATE INDEX "linked_account_id" ON "conversations"("linked_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_profiles_full_name_primary_phone_primary_email_key" ON "golden_profiles"("full_name", "primary_phone", "primary_email");

-- CreateIndex
CREATE UNIQUE INDEX "link_accounts_account_id_provider_key" ON "link_accounts"("account_id", "provider");

-- CreateIndex
CREATE INDEX "conversation_id" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_latest_message" ON "messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "conversation_unread" ON "messages"("conversation_id", "is_read");

-- CreateIndex
CREATE INDEX "message_user_id" ON "messages"("user_id");

-- CreateIndex
CREATE INDEX "message_account_customer_id" ON "messages"("account_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_credential_link_account_id_key" ON "provider_credential"("link_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- AddForeignKey
ALTER TABLE "account_customer" ADD CONSTRAINT "account_customer_linked_account_id_fkey" FOREIGN KEY ("linked_account_id") REFERENCES "link_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_customer" ADD CONSTRAINT "account_customer_golden_profile_id_fkey" FOREIGN KEY ("golden_profile_id") REFERENCES "golden_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_customers" ADD CONSTRAINT "conversation_customers_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_customers" ADD CONSTRAINT "conversation_customers_account_customer_id_fkey" FOREIGN KEY ("account_customer_id") REFERENCES "account_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_linked_account_id_fkey" FOREIGN KEY ("linked_account_id") REFERENCES "link_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_account_customer_id_fkey" FOREIGN KEY ("account_customer_id") REFERENCES "account_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_accounts" ADD CONSTRAINT "link_accounts_linked_by_user_id_fkey" FOREIGN KEY ("linked_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_account_customer_id_fkey" FOREIGN KEY ("account_customer_id") REFERENCES "account_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_credential" ADD CONSTRAINT "provider_credential_link_account_id_fkey" FOREIGN KEY ("link_account_id") REFERENCES "link_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('zalo_personal', 'zalo_oa', 'facebook', 'gmail', 'phone');

-- CreateEnum
CREATE TYPE "JourneyState" AS ENUM ('searching', 'holding', 'ticketed', 'cancelled', 'completed');

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
CREATE TYPE "LinkAccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('pending', 'processing', 'closed');

-- CreateEnum
CREATE TYPE "ProcessingSessionStatus" AS ENUM ('pending', 'processing', 'completed');

-- CreateEnum
CREATE TYPE "SessionAssigneeStatus" AS ENUM ('processing', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "account_customer" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "linked_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "golden_profile_id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_activity_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "years_of_experience" INTEGER NOT NULL,
    "max_concurrent_conversations" INTEGER NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_processing_sessions" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "title" TEXT,
    "note" TEXT,
    "rating" INTEGER,
    "status" "ProcessingSessionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_processing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_session_assignees" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assign_by_user_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "status" "SessionAssigneeStatus" NOT NULL DEFAULT 'processing',
    "note" TEXT,

    CONSTRAINT "conversation_session_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_customers" (
    "conversation_id" TEXT NOT NULL,
    "account_customer_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "linked_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "external_id" TEXT,
    "type" "ConversationType" NOT NULL DEFAULT 'personal',
    "tag" "ConversationTag" NOT NULL DEFAULT 'other',
    "journey_state" "JourneyState",
    "status" "ConversationStatus" NOT NULL DEFAULT 'pending',
    "count_unread_messages" INTEGER NOT NULL DEFAULT 0,
    "is_unread" BOOLEAN NOT NULL DEFAULT false,
    "last_activity_at" TIMESTAMP(3) NOT NULL,
    "last_viewed_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_profiles" (
    "id" TEXT NOT NULL,
    "linked_account_id" TEXT NOT NULL,
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golden_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_accounts" (
    "id" TEXT NOT NULL,
    "provider" "ChannelType" NOT NULL,
    "display_name" TEXT,
    "account_id" TEXT,
    "avatar_url" TEXT,
    "status" "LinkAccountStatus" NOT NULL DEFAULT 'active',
    "credentials" JSON NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_type" "MessageSender" NOT NULL,
    "account_customer_id" TEXT,
    "content" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'processing',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "external_id" VARCHAR(255),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
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
    "key" VARCHAR(255),

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "user_id" TEXT NOT NULL,
    "hashToken" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "suggested_messages" (
    "id" TEXT NOT NULL,
    "tag" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "images" TEXT[],
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggested_messages_pkey" PRIMARY KEY ("id")
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
    "agent_level_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "count_processing_sessions" INTEGER NOT NULL DEFAULT 0,
    "is_ready_processing" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_customer_account_id_linked_account_id_key" ON "account_customer"("account_id", "linked_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_levels_code_key" ON "agent_levels"("code");

-- CreateIndex
CREATE INDEX "idx_processing_session_conversation" ON "conversation_processing_sessions"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_session_assignee_user" ON "conversation_session_assignees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_session_assignees_session_id_user_id_key" ON "conversation_session_assignees"("session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_customers_conversation_id_account_customer_id_key" ON "conversation_customers"("conversation_id", "account_customer_id");

-- CreateIndex
CREATE INDEX "last_activity_at" ON "conversations"("last_activity_at" DESC);

-- CreateIndex
CREATE INDEX "linked_account_id" ON "conversations"("linked_account_id");

-- CreateIndex
CREATE INDEX "last_viewed_at" ON "conversations"("last_viewed_at" DESC);

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
CREATE INDEX "message_account_customer_id" ON "messages"("account_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_hashToken_key" ON "refresh_tokens"("hashToken");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "suggested_messages_tag_idx" ON "suggested_messages"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- AddForeignKey
ALTER TABLE "account_customer" ADD CONSTRAINT "account_customer_linked_account_id_fkey" FOREIGN KEY ("linked_account_id") REFERENCES "link_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_customer" ADD CONSTRAINT "account_customer_golden_profile_id_fkey" FOREIGN KEY ("golden_profile_id") REFERENCES "golden_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_levels" ADD CONSTRAINT "agent_levels_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_processing_sessions" ADD CONSTRAINT "conversation_processing_sessions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_session_assignees" ADD CONSTRAINT "conversation_session_assignees_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_processing_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_session_assignees" ADD CONSTRAINT "conversation_session_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_session_assignees" ADD CONSTRAINT "conversation_session_assignees_assign_by_user_id_fkey" FOREIGN KEY ("assign_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_customers" ADD CONSTRAINT "conversation_customers_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_customers" ADD CONSTRAINT "conversation_customers_account_customer_id_fkey" FOREIGN KEY ("account_customer_id") REFERENCES "account_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_linked_account_id_fkey" FOREIGN KEY ("linked_account_id") REFERENCES "link_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golden_profiles" ADD CONSTRAINT "golden_profiles_linked_account_id_fkey" FOREIGN KEY ("linked_account_id") REFERENCES "link_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_accounts" ADD CONSTRAINT "link_accounts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_account_customer_id_fkey" FOREIGN KEY ("account_customer_id") REFERENCES "account_customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggested_messages" ADD CONSTRAINT "suggested_messages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_agent_level_id_fkey" FOREIGN KEY ("agent_level_id") REFERENCES "agent_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

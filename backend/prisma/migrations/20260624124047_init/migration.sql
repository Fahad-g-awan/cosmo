-- CreateEnum
CREATE TYPE "PatientCreationSource" AS ENUM ('ADMIN', 'SELF_SIGNUP', 'MANAGER', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "CLINIC_TYPE" AS ENUM ('PARENT', 'NODE');

-- CreateEnum
CREATE TYPE "CLINIC_STATUS" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "SPECIALIST_CLINIC_ASSOCIATION" AS ENUM ('FULL_TIME', 'FREELANCE');

-- CreateEnum
CREATE TYPE "SPECIALIST_CLINIC_LINK_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WORKING_TYPES" AS ENUM ('FULL_TIME', 'FREELANCE');

-- CreateEnum
CREATE TYPE "SPECIALIST_STATUS" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "PatientRelationSource" AS ENUM ('CLINIC_CREATE', 'SPECIALIST_FULLTIME_CREATE', 'SPECIALIST_FREELANCE_CREATE', 'APPOINTMENT');

-- CreateEnum
CREATE TYPE "CLINIC_TREATMENT_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CLINIC_SPECIALIST_TREATMENT_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TREATMENT_RESULT_OWNER" AS ENUM ('ADMIN', 'CLINIC');

-- CreateEnum
CREATE TYPE "REVIEW_STATUS" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "REVIEW_TARGET_TYPE" AS ENUM ('CLINIC', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "REVIEW_REPLY_AUTHOR_ROLE" AS ENUM ('CLINIC', 'SPECIALIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "BLOG_STATUS" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('CONTACT_US_PAGE', 'SUBSCRIPTION', 'REGISTER_DOCTOR_FORM', 'REGISTER_CLINIC_FORM', 'FACEBOOK_AD', 'GOOGLE_AD', 'ORGANIC_SEARCH', 'PARTNER_REFERRAL', 'NEWSLETTER_CAMPAIGN');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('CONTACT', 'DOCTOR', 'CLINIC', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'PENDING_REVIEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('ACTIVE', 'BLOCKED', 'UNCONFIRMED', 'PENDING');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'MANAGER', 'SPECIALIST', 'PATIENT');

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "USER_STATUS" NOT NULL DEFAULT 'UNCONFIRMED',
    "defaultPasswordUsed" BOOLEAN NOT NULL DEFAULT false,
    "passwordSet" BOOLEAN NOT NULL DEFAULT false,
    "linkedProviders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "perms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "role" "ROLE",
    "entityId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "image" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "completeAddress" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "image" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "completeAddress" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "entityType" TEXT NOT NULL,
    "creationSource" "PatientCreationSource" NOT NULL DEFAULT 'SELF_SIGNUP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "clinicAge" TEXT,
    "clinicType" "CLINIC_TYPE" NOT NULL,
    "logo" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "htmlAbout" JSONB,
    "overview" TEXT,
    "instagramId" TEXT,
    "website" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "completeAddress" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "status" "CLINIC_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "available" BOOLEAN NOT NULL DEFAULT false,
    "faqs" JSONB,
    "tags" JSONB,
    "workingHours" JSONB,
    "certificates" JSONB,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "parentClinicId" TEXT,
    "leadId" TEXT,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClinicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicManager" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "image" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "completeAddress" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClinicManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicManagerLink" (
    "clinicId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicManagerLink_pkey" PRIMARY KEY ("clinicId","managerId")
);

-- CreateTable
CREATE TABLE "ClinicCategoryLink" (
    "clinicId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicCategoryLink_pkey" PRIMARY KEY ("clinicId","categoryId")
);

-- CreateTable
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "image" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "totalExperience" INTEGER,
    "htmlAbout" JSONB,
    "overview" TEXT,
    "workingType" "WORKING_TYPES" DEFAULT 'FULL_TIME',
    "instagramId" TEXT,
    "website" TEXT,
    "faqs" JSONB,
    "tags" JSONB,
    "workingHours" JSONB,
    "certificates" JSONB,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "completeAddress" TEXT,
    "postalCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "status" "SPECIALIST_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "available" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "leadId" TEXT,

    CONSTRAINT "Specialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSpecialistLink" (
    "specialistId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "associationType" "SPECIALIST_CLINIC_ASSOCIATION" NOT NULL DEFAULT 'FREELANCE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "SPECIALIST_CLINIC_LINK_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicSpecialistLink_pkey" PRIMARY KEY ("clinicId","specialistId")
);

-- CreateTable
CREATE TABLE "PatientClinic" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "source" "PatientRelationSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientClinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientSpecialist" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "source" "PatientRelationSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientSpecialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TreatmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TreatmentBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "htmlDescription" JSONB,
    "overview" TEXT,
    "recoveryTime" TEXT,
    "anesthesia" TEXT,
    "faqs" JSONB,
    "tags" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicTreatment" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "status" "CLINIC_TREATMENT_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT,
    "image" TEXT,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "treatmentName" TEXT NOT NULL,
    "treatmentImage" TEXT,
    "treatmentOverview" TEXT,
    "avgPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClinicTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSpecialistTreatment" (
    "id" TEXT NOT NULL,
    "clinicTreatmentId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "treatmentName" TEXT NOT NULL,
    "treatmentImage" TEXT,
    "treatmentOverview" TEXT,
    "specialistExperience" TEXT NOT NULL DEFAULT '',
    "status" "CLINIC_SPECIALIST_TREATMENT_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "available" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClinicSpecialistTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTreatment" (
    "id" TEXT NOT NULL,
    "clinicTreatmentId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTreatmentBrand" (
    "subTreatmentId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "SubTreatmentBrand_pkey" PRIMARY KEY ("subTreatmentId","brandId")
);

-- CreateTable
CREATE TABLE "TreatmentResult" (
    "id" TEXT NOT NULL,
    "ownerType" "TREATMENT_RESULT_OWNER" NOT NULL DEFAULT 'CLINIC',
    "clinicTreatmentId" TEXT,
    "clinicId" TEXT,
    "treatmentId" TEXT,
    "categoryId" TEXT,
    "categoryName" TEXT,
    "beforeImage" TEXT NOT NULL,
    "afterImage" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TreatmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "targetEntityType" "REVIEW_TARGET_TYPE" NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "targetImage" TEXT,
    "targetCompleteAddress" TEXT,
    "authorId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorImage" TEXT,
    "authorCompleteAddress" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "REVIEW_STATUS" NOT NULL DEFAULT 'PENDING',
    "entityType" TEXT NOT NULL,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "targetEntityType" "REVIEW_TARGET_TYPE" NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "targetImage" TEXT,
    "targetCompleteAddress" TEXT,
    "authorId" TEXT NOT NULL,
    "authorRole" "REVIEW_REPLY_AUTHOR_ROLE" NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorImage" TEXT,
    "authorCompleteAddress" TEXT,
    "comment" TEXT NOT NULL,
    "status" "REVIEW_STATUS" NOT NULL,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "image" TEXT,
    "content" JSONB,
    "status" "BLOG_STATUS" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "entityType" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "completeAddress" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "registrationNumber" TEXT,
    "companyName" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitySearchStat" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "searchClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntitySearchStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_cognitoSub_key" ON "Identity"("cognitoSub");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_email_key" ON "Identity"("email");

-- CreateIndex
CREATE INDEX "Identity_email_idx" ON "Identity"("email");

-- CreateIndex
CREATE INDEX "Identity_role_entityId_idx" ON "Identity"("role", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_identityId_key" ON "Admin"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_identityId_key" ON "Patient"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_email_key" ON "Clinic"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_leadId_key" ON "Clinic"("leadId");

-- CreateIndex
CREATE INDEX "Clinic_email_name_idx" ON "Clinic"("email", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicCategory_name_key" ON "ClinicCategory"("name");

-- CreateIndex
CREATE INDEX "ClinicCategory_name_published_idx" ON "ClinicCategory"("name", "published");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicManager_identityId_key" ON "ClinicManager"("identityId");

-- CreateIndex
CREATE INDEX "ClinicManagerLink_managerId_idx" ON "ClinicManagerLink"("managerId");

-- CreateIndex
CREATE INDEX "ClinicCategoryLink_categoryId_clinicId_idx" ON "ClinicCategoryLink"("categoryId", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_identityId_key" ON "Specialist"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_leadId_key" ON "Specialist"("leadId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistLink_specialistId_clinicId_idx" ON "ClinicSpecialistLink"("specialistId", "clinicId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistLink_specialistId_isPrimary_idx" ON "ClinicSpecialistLink"("specialistId", "isPrimary");

-- CreateIndex
CREATE INDEX "ClinicSpecialistLink_clinicId_associationType_idx" ON "ClinicSpecialistLink"("clinicId", "associationType");

-- CreateIndex
CREATE INDEX "PatientClinic_clinicId_idx" ON "PatientClinic"("clinicId");

-- CreateIndex
CREATE INDEX "PatientClinic_patientId_idx" ON "PatientClinic"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientClinic_patientId_clinicId_key" ON "PatientClinic"("patientId", "clinicId");

-- CreateIndex
CREATE INDEX "PatientSpecialist_specialistId_idx" ON "PatientSpecialist"("specialistId");

-- CreateIndex
CREATE INDEX "PatientSpecialist_patientId_idx" ON "PatientSpecialist"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSpecialist_patientId_specialistId_key" ON "PatientSpecialist"("patientId", "specialistId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentCategory_name_key" ON "TreatmentCategory"("name");

-- CreateIndex
CREATE INDEX "TreatmentCategory_name_published_idx" ON "TreatmentCategory"("name", "published");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentBrand_name_key" ON "TreatmentBrand"("name");

-- CreateIndex
CREATE INDEX "TreatmentBrand_name_published_idx" ON "TreatmentBrand"("name", "published");

-- CreateIndex
CREATE INDEX "Treatment_categoryId_published_idx" ON "Treatment"("categoryId", "published");

-- CreateIndex
CREATE INDEX "Treatment_name_idx" ON "Treatment"("name");

-- CreateIndex
CREATE INDEX "Treatment_authorId_idx" ON "Treatment"("authorId");

-- CreateIndex
CREATE INDEX "ClinicTreatment_clinicId_status_idx" ON "ClinicTreatment"("clinicId", "status");

-- CreateIndex
CREATE INDEX "ClinicTreatment_treatmentId_idx" ON "ClinicTreatment"("treatmentId");

-- CreateIndex
CREATE INDEX "ClinicTreatment_categoryId_idx" ON "ClinicTreatment"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicTreatment_clinicId_treatmentId_key" ON "ClinicTreatment"("clinicId", "treatmentId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_clinicId_idx" ON "ClinicSpecialistTreatment"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_clinicId_status_idx" ON "ClinicSpecialistTreatment"("clinicId", "status");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_specialistId_idx" ON "ClinicSpecialistTreatment"("specialistId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_specialistId_status_idx" ON "ClinicSpecialistTreatment"("specialistId", "status");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_clinicTreatmentId_idx" ON "ClinicSpecialistTreatment"("clinicTreatmentId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_treatmentId_idx" ON "ClinicSpecialistTreatment"("treatmentId");

-- CreateIndex
CREATE INDEX "ClinicSpecialistTreatment_categoryId_idx" ON "ClinicSpecialistTreatment"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicSpecialistTreatment_specialistId_clinicTreatmentId_key" ON "ClinicSpecialistTreatment"("specialistId", "clinicTreatmentId");

-- CreateIndex
CREATE INDEX "SubTreatment_clinicTreatmentId_idx" ON "SubTreatment"("clinicTreatmentId");

-- CreateIndex
CREATE INDEX "SubTreatment_clinicId_idx" ON "SubTreatment"("clinicId");

-- CreateIndex
CREATE INDEX "SubTreatment_treatmentId_idx" ON "SubTreatment"("treatmentId");

-- CreateIndex
CREATE INDEX "TreatmentResult_clinicTreatmentId_idx" ON "TreatmentResult"("clinicTreatmentId");

-- CreateIndex
CREATE INDEX "TreatmentResult_clinicId_idx" ON "TreatmentResult"("clinicId");

-- CreateIndex
CREATE INDEX "TreatmentResult_treatmentId_idx" ON "TreatmentResult"("treatmentId");

-- CreateIndex
CREATE INDEX "Review_targetEntityType_targetEntityId_idx" ON "Review"("targetEntityType", "targetEntityId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReply_targetEntityType_targetEntityId_idx" ON "ReviewReply"("targetEntityType", "targetEntityId");

-- CreateIndex
CREATE INDEX "ReviewReply_authorRole_authorId_idx" ON "ReviewReply"("authorRole", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE INDEX "BlogCategory_name_published_idx" ON "BlogCategory"("name", "published");

-- CreateIndex
CREATE INDEX "Blog_categoryId_idx" ON "Blog"("categoryId");

-- CreateIndex
CREATE INDEX "Blog_status_publishedAt_idx" ON "Blog"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Blog_createdAt_idx" ON "Blog"("createdAt");

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- CreateIndex
CREATE INDEX "Lead_type_idx" ON "Lead"("type");

-- CreateIndex
CREATE INDEX "EntitySearchStat_targetEntityType_searchClicks_idx" ON "EntitySearchStat"("targetEntityType", "searchClicks");

-- CreateIndex
CREATE UNIQUE INDEX "EntitySearchStat_targetEntityType_targetEntityId_key" ON "EntitySearchStat"("targetEntityType", "targetEntityId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_parentClinicId_fkey" FOREIGN KEY ("parentClinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicManager" ADD CONSTRAINT "ClinicManager_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicManagerLink" ADD CONSTRAINT "ClinicManagerLink_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicManagerLink" ADD CONSTRAINT "ClinicManagerLink_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ClinicManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicCategoryLink" ADD CONSTRAINT "ClinicCategoryLink_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicCategoryLink" ADD CONSTRAINT "ClinicCategoryLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ClinicCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistLink" ADD CONSTRAINT "ClinicSpecialistLink_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistLink" ADD CONSTRAINT "ClinicSpecialistLink_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientClinic" ADD CONSTRAINT "PatientClinic_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientClinic" ADD CONSTRAINT "PatientClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSpecialist" ADD CONSTRAINT "PatientSpecialist_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSpecialist" ADD CONSTRAINT "PatientSpecialist_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TreatmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicTreatment" ADD CONSTRAINT "ClinicTreatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicTreatment" ADD CONSTRAINT "ClinicTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistTreatment" ADD CONSTRAINT "ClinicSpecialistTreatment_clinicTreatmentId_fkey" FOREIGN KEY ("clinicTreatmentId") REFERENCES "ClinicTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistTreatment" ADD CONSTRAINT "ClinicSpecialistTreatment_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistTreatment" ADD CONSTRAINT "ClinicSpecialistTreatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSpecialistTreatment" ADD CONSTRAINT "ClinicSpecialistTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTreatment" ADD CONSTRAINT "SubTreatment_clinicTreatmentId_fkey" FOREIGN KEY ("clinicTreatmentId") REFERENCES "ClinicTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTreatmentBrand" ADD CONSTRAINT "SubTreatmentBrand_subTreatmentId_fkey" FOREIGN KEY ("subTreatmentId") REFERENCES "SubTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTreatmentBrand" ADD CONSTRAINT "SubTreatmentBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TreatmentBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentResult" ADD CONSTRAINT "TreatmentResult_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentResult" ADD CONSTRAINT "TreatmentResult_clinicTreatmentId_fkey" FOREIGN KEY ("clinicTreatmentId") REFERENCES "ClinicTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

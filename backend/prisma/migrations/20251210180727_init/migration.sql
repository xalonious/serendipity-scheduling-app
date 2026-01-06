-- CreateTable
CREATE TABLE `TrainingSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `slot` ENUM('T0000', 'T0300', 'T0600', 'T0800', 'T1000', 'T1200', 'T1500', 'T1700', 'T2000', 'T2200') NOT NULL,
    `userId` VARCHAR(191) NULL,
    `claimedAt` DATETIME(3) NULL,

    UNIQUE INDEX `TrainingSlot_date_slot_key`(`date`, `slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `rewardRobux` INTEGER NULL,
    `claimedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShiftSlot_startTime_endTime_idx`(`startTime`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricalShift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `hostUserId` VARCHAR(191) NOT NULL,
    `bucket` INTEGER NOT NULL,
    `durationMins` INTEGER NOT NULL,
    `rewardRobux` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistoricalShift_startTime_idx`(`startTime`),
    INDEX `HistoricalShift_bucket_idx`(`bucket`),
    INDEX `HistoricalShift_hostUserId_startTime_idx`(`hostUserId`, `startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

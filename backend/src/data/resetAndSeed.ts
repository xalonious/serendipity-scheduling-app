import { prisma } from "./index";
import { TrainingSlotEnum } from "@prisma/client";
import { toDate } from "date-fns-tz";

async function main() {
  await prisma.$connect();
  await prisma.trainingSlot.deleteMany();    
  const eastern = "America/New_York";                                      

  const now      = new Date();                 
  const dow      = now.getDay();               
  const backMon  = dow === 0 ? 6 : dow - 1;
  const monLocal = new Date(now);
  monLocal.setDate(now.getDate() - backMon);
  monLocal.setHours(0, 0, 0, 0);               

  const trainingTimes: { slot: TrainingSlotEnum; hour: number }[] = [
    { slot: TrainingSlotEnum.T0000, hour: 0  },
    { slot: TrainingSlotEnum.T0300, hour: 3  },
    { slot: TrainingSlotEnum.T0600, hour: 6  },
    { slot: TrainingSlotEnum.T0800, hour: 8  },
    { slot: TrainingSlotEnum.T1000, hour: 10 },
    { slot: TrainingSlotEnum.T1200, hour: 12 },
    { slot: TrainingSlotEnum.T1500, hour: 15 },
    { slot: TrainingSlotEnum.T1700, hour: 17 },
    { slot: TrainingSlotEnum.T2000, hour: 20 },
    { slot: TrainingSlotEnum.T2200, hour: 22 },
  ];

  for (let d = 0; d < 7; d++) {
    const dayLocal = new Date(monLocal);
    dayLocal.setDate(monLocal.getDate() + d);  

    const YYYY = dayLocal.getFullYear();
    const MM   = String(dayLocal.getMonth() + 1).padStart(2, "0");
    const DD   = String(dayLocal.getDate())     .padStart(2, "0");

    for (const { slot, hour } of trainingTimes) {
      const HH = String(hour).padStart(2, "0");
      const easternIso = `${YYYY}-${MM}-${DD}T${HH}:00:00`;

      const utcDate = toDate(easternIso, { timeZone: eastern });

      await prisma.trainingSlot.upsert({
        where:  { date_slot: { date: utcDate, slot } },
        update: {},
        create: { date: utcDate, slot },
      });
    }
  }

  console.log("✅ Seeded local-week slots, each at its Eastern wall time");
}

main()
  .catch(e => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

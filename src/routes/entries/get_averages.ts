import { getRepository } from "typeorm";
import { Entry } from "../../entities/entry";

interface EntryAverages {
  distance: number;
  duration: number;
  speed: number;
}

export async function getAverages(userId: number | string): Promise<EntryAverages> {
  const {
    distance,
    duration
  }: { distance: number; duration: number } = await getRepository(Entry)
    .createQueryBuilder("entry")
    .select("AVG(entry.distance) AS distance")
    .addSelect("AVG(entry.duration) AS duration")
    .where('entry."userId" = :userId', { userId })
    .andWhere("entry.date > NOW()::date - 7")
    .getRawOne();

  return {
    distance,
    duration,
    speed: distance / 1000 / (duration / 3600)
  };
}

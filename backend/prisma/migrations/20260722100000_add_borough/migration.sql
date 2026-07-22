-- CreateEnum
CREATE TYPE "Borough" AS ENUM ('BARKING_AND_DAGENHAM', 'BARNET', 'BEXLEY', 'BRENT', 'BROMLEY', 'CAMDEN', 'CITY_OF_LONDON', 'CROYDON', 'EALING', 'ENFIELD', 'GREENWICH', 'HACKNEY', 'HAMMERSMITH_AND_FULHAM', 'HARINGEY', 'HARROW', 'HAVERING', 'HILLINGDON', 'HOUNSLOW', 'ISLINGTON', 'KENSINGTON_AND_CHELSEA', 'KINGSTON_UPON_THAMES', 'LAMBETH', 'LEWISHAM', 'MERTON', 'NEWHAM', 'REDBRIDGE', 'RICHMOND_UPON_THAMES', 'SOUTHWARK', 'SUTTON', 'TOWER_HAMLETS', 'WALTHAM_FOREST', 'WANDSWORTH', 'WESTMINSTER');

-- AlterTable: User.city (free text) -> User.borough (required enum)
ALTER TABLE "User" ADD COLUMN     "borough" "Borough";

UPDATE "User" SET "borough" = CASE
    WHEN "city" ILIKE 'ealing' THEN 'EALING'
    WHEN "city" ILIKE 'clapham' THEN 'LAMBETH'
    ELSE 'WESTMINSTER'
END::"Borough";

ALTER TABLE "User" ALTER COLUMN "borough" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "city";

-- AlterTable: Post.area (free text) -> Post.borough (optional enum)
ALTER TABLE "Post" ADD COLUMN     "borough" "Borough";

UPDATE "Post" SET "borough" = CASE
    WHEN "area" ILIKE 'shoreditch' THEN 'HACKNEY'
    WHEN "area" ILIKE 'camden' THEN 'CAMDEN'
    WHEN "area" ILIKE 'fulham' THEN 'HAMMERSMITH_AND_FULHAM'
    WHEN "area" ILIKE 'hyde park' THEN 'WESTMINSTER'
    WHEN "area" ILIKE E'regent\'s park' THEN 'CAMDEN'
    ELSE NULL
END::"Borough";

ALTER TABLE "Post" DROP COLUMN "area";

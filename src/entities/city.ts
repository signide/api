import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("cities")
export class City {
  @PrimaryColumn()
  id: number;

  @Column("text")
  name: string;

  @Column({
    type: "varchar",
    length: 2
  })
  countryCode: string;

  @Column("double precision")
  longitude: number;

  @Column("double precision")
  latitude: number;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";
import { City } from "./city";

@Entity("entries")
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  distance: number;

  @Column()
  duration: number;

  @ManyToOne(type => User)
  user: User;

  @ManyToOne(type => City)
  city: City;

  @Column("double precision")
  windSpeed: number;

  @Column("double precision")
  temp: number;

  @Column("double precision")
  humidity: number;

  @Column("text")
  weatherDescription: string;
}

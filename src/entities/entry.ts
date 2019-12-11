import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
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

  @Column({ name: "wind_speed", type: "double precision" })
  windSpeed: number;

  @Column("double precision")
  temp: number;

  @Column("double precision")
  humidity: number;

  @Column({ name: "weather_description", type: "text" })
  weatherDescription: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

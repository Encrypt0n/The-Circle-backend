import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { TruYouAccount } from "./TruYouAccount";
import { LogAction } from "../LogAction";

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number
  @Column({nullable: false})
  action: LogAction 
  @Column()
  timestamp: string
  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => TruYouAccount, truYouAccount => truYouAccount.logs)
  truYouAccount: TruYouAccount
}
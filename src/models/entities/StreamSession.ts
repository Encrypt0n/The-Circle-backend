import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { TruYouAccount } from "./TruYouAccount";

@Entity()
export class StreamSession {
  @PrimaryGeneratedColumn()
  id: number
  @Column({nullable: true})
  filePath: string
  @Column({ name: 'truYouAccountId' })
  truYouAccountId: number
  @Column({ name: 'truYouAccountName' })
  truYouAccountName: string
  @Column({ default: false })
  isFinished: boolean
  @Column( {nullable: false} )
  createdAt: Date
  @Column( {nullable: true} )
  finishedAt: Date

  @ManyToOne(() => TruYouAccount, truYouAccount => truYouAccount.streamSessions)
  @JoinColumn({ name: 'truYouAccountId'})
  truYouAccount: TruYouAccount
}
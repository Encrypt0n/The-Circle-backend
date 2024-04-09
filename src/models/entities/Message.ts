import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { TruYouAccount } from "./TruYouAccount";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number
  @Column({nullable: false})
  messageText: string
  @Column()
  timestamp: string
  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => TruYouAccount, truYouAccount => truYouAccount.messages)
  sender: TruYouAccount

  @ManyToOne(() => TruYouAccount, truYouAccount => truYouAccount.messages)
  @JoinColumn()
  receiver: TruYouAccount
}

export class MessagePayload extends Message {
  signature: string
  serverSignature?: string
}
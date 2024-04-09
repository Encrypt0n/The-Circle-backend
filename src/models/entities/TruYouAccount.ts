import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Log } from "./Log";
import { Message } from "./Message";
import { StreamSession } from "./StreamSession";

@Entity()
export class TruYouAccount {
  @PrimaryGeneratedColumn()
  id: number
  @Column({nullable: false})
  name: string
  @Column({type: "text", nullable: false})
  publicKey: string
  @Column({default: false})
  isLive: boolean
  @Column({default: 0})
  satoshi: number
  @Column({ default: 0 })
  viewerCount: number
  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => Log, log => log.truYouAccount)
  logs: Log[]

  @OneToMany(() => Message, message => message.sender)
  messages: Message[]

  @OneToMany(() => StreamSession, streamSession => streamSession.truYouAccount)
  streamSessions: StreamSession[]

  @ManyToMany(() => TruYouAccount, (truYouAccount) => truYouAccount.followers)
  following: TruYouAccount[];

  @ManyToMany(() => TruYouAccount, (truYouAccount) => truYouAccount.following)
  @JoinTable({
    name: 'follower',
    joinColumn: {
      name: "transparantPersonId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
        name: "viewerId",
        referencedColumnName: "id"
    }
  })
  followers: TruYouAccount[]
}
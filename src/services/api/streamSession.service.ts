import { Result } from "../../models/Result";
import { StreamSession } from "../../models/entities/StreamSession";
import { TruYouAccount } from "../../models/entities/TruYouAccount";
import { streamSessionRepository } from "../../utils/datasources/mysql.datasource";

const repository = streamSessionRepository;
module.exports = {
    async postStreamSession(body: StreamSession): Promise<Result> {
        try {
            let streamSession = repository.create(body);
            streamSession.createdAt = new Date(Date.now())
            streamSession.finishedAt = null;
            streamSession = await repository.save(streamSession);
            
            return Promise.resolve({
                status: 200,
                data: streamSession
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllStreamSessions(): Promise<Result> {
        try {
            const streamSessions = await repository.find();

            return Promise.resolve({
                status: 200,
                data: streamSessions
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllStreamSessionForTruYouAccount(requestedId: number): Promise<Result> {
        try {
            const streamSessions = await repository
                .createQueryBuilder('stream_session')
                .where('stream_session.truYouAccountId = :id', {id: requestedId})
                .getMany();

            return Promise.resolve({
                status: 200,
                data: streamSessions
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getLiveStreamSessionForTruYouAccount(requestedId: number): Promise<Result> {
        try {
            const streamSessions = await repository
                .createQueryBuilder('stream_session')
                .where('stream_session.truYouAccountId = :id', {id: requestedId})
                .andWhere('stream_session.isFinished = false')
                .getOne();

            return Promise.resolve({
                status: 200,
                data: streamSessions
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getLiveStreamSessionForTruYouAccountByName(truYouAccountName: string): Promise<Result> {
        try {
            const streamSessions = await repository
                .createQueryBuilder('stream_session')
                .where('stream_session.truYouAccountName = :name', {name: truYouAccountName})
                .andWhere('stream_session.isFinished = false')
                .getOne();

            return Promise.resolve({
                status: 200,
                data: streamSessions
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async finishStreamSession(truYouAccountName: string, fileLocation: string): Promise<Result> {
        let satoshi;
        let finishedAt = new Date(Date.now());
        const result = await this.getLiveStreamSessionForTruYouAccountByName(truYouAccountName);
        let streamSession;
        if (result.data) streamSession = result.data;

        try {
            await repository
                .createQueryBuilder('stream_session')
                .update(StreamSession)
                .set({ 
                    filePath: fileLocation,
                    isFinished: true,
                    finishedAt: finishedAt
                })
                .where('truYouAccountName = :name', { name: truYouAccountName })
                .execute()
                .then(() => {
                    // Seconds is for demo purposes. Change 1000 to (1000 * 60 * 60) for production
                    let secondsStreamed = Math.floor((finishedAt.getTime() - streamSession.createdAt.getTime()) / 1000);
                    let roundedSecondsStreamed = Math.round(secondsStreamed / 5) * 5;
                    satoshi = this.calculateTransparencyReward(roundedSecondsStreamed / 5);
                });

                // Update TruYou Account (not in truYouAccount Service because of circular dependency)
                try {
                    await repository
                      .createQueryBuilder("tru_you_account")
                      .update(TruYouAccount)
                      .set({ satoshi: () => "satoshi + " + satoshi})
                      .where("name = :name", { name: truYouAccountName })
                      .execute()
                      .then((response) => {
                        return response[0];
                      });
                  } catch (error) {
                    return Promise.reject(error);
                  }

            return Promise.resolve({
                status: 200,
                data: streamSession
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    calculateTransparencyReward(intervals: number): number {
        let reward = 1; // Initial reward of 1 Satoshi per hour (per 5 seconds for demo)
        let totalReward = 0;
      
        for (let i = 1; i <= intervals; i++) {
          totalReward += reward;
          reward *= 2;
        }
      
        return totalReward;
      }
}
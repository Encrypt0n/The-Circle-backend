import { DigitalSignature } from "../../models/DigitalSignature";
import { LogAction } from "../../models/LogAction";
import { Result } from "../../models/Result";
import { Log } from "../../models/entities/Log";
import { logRepository } from "../../utils/datasources/mysql.datasource";

const repository = logRepository;

module.exports = {
    async postLog(body: DigitalSignature<Log>): Promise<Result> {
        // Verify paramaters
        if(!body.payload.action) return Promise.resolve({
            status: 400,
            error: 'No Log action defined in body'
        });

        // Check if log action is a defined and known action in the server
        switch (body.payload.action) {
            case LogAction.COMMENT:
            case LogAction.FOLLOW:
            case LogAction.STREAM_LEAVE:
            case LogAction.STREAM_START:
            case LogAction.STREAM_STOP:
            case LogAction.STREAM_WATCH:
            case LogAction.UNFOLLOW:
                try {
                    let log = repository.create(body.payload);
                    log = await repository.save(log);
                    return Promise.resolve({
                        status: 200,
                        data: log
                    });
                } catch (error) {
                    return Promise.reject(error);
                }
            default: 
                return Promise.resolve({
                    status: 400,
                    error: 'Log action is unknown in the server.'
                });
        }
    },

    async getAllLogs(): Promise<Result> {
        try {
            const logs = await repository.find();

            return Promise.resolve({
                status: 200,
                data: logs
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllLogsForTruYouAccount(requestedId: number): Promise<Result> {
        // Verify parameters
        if (typeof requestedId !== 'number') return Promise.resolve({
            status: 400,
            error: 'wrong data type for ID'
        });
        
        try {
            const logs = await repository
                .createQueryBuilder('log')
                .where('log.truYouAccountId = :id', {id: requestedId})
                .getMany();

            return Promise.resolve({
                status: 200,
                data: logs
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
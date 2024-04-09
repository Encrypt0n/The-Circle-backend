import { LogAction } from "../../models/LogAction";
import { Result } from "../../models/Result";
import type { Message } from "../../models/entities/Message";
import { messageRepository } from "../../utils/datasources/mysql.datasource";
import { DigitalSignature } from "../../models/DigitalSignature";
import type { Log } from "../../models/entities/Log";

const repository = messageRepository;
const logService = require('./log.service');

module.exports = {
    async postMessage(body: Message): Promise<Result> {
        // Verify parameters
        if (!body.messageText) return Promise.resolve({
            status: 400,
            error: 'No Message text defined in body'
        });


        try {
            let message = repository.create(body);
            message = await repository.save(message);

            let logObj: DigitalSignature<Log> = {
                payload: {
                    id: message.id,
                    action: LogAction.COMMENT,
                    truYouAccount: message.sender,
                    timestamp: message.timestamp,
                    createdAt: message.createdAt,
                },
                signature: '',
                username: message.sender.name,
                timestamp: new Date(message.timestamp)
            };

            let log = await logService.postLog(logObj);
            const data = {
                message: message,
                log: log
            };

            return Promise.resolve({
                status: 200,
                data: data
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllMessages(): Promise<Result> {
        try {
            const messages = await repository.find();

            return Promise.resolve({
                status: 200,
                data: messages
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllMessagesForReceiver(receiverId: number): Promise<Result> {
        try {
            const messages = await repository
                .createQueryBuilder('message')
                .where('message.receiverId = :id', { id: receiverId })
                .getMany();

            return Promise.resolve({
                status: 200,
                data: messages
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllMessagesForSender(senderId: number): Promise<Result> {
        try {
            const messages = await repository
                .createQueryBuilder('message')
                .where('message.senderId = :id', { id: senderId })
                .getMany();

            return Promise.resolve({
                status: 200,
                data: messages
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getAllMessagesForReceiverFromSender(receiverId: number, senderId: number): Promise<Result> {
        try {
            const messages = await repository
                .createQueryBuilder('message')
                .where('message.receiverId = :receiverId AND message.senderId = :senderId', {
                    receiverId: receiverId,
                    senderId: senderId
                })
                .getMany();

            return Promise.resolve({
                status: 200,
                data: messages
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    async getLatestMessages(receiver: string, limit: number, offset: number): Promise<Result> {
        try {
            const messages = await repository
                .createQueryBuilder('message')
                .where('message.receiver = :receiver', {
                    receiver: receiver,
                })
                .leftJoinAndSelect('message.sender', 'sender')
                .orderBy('message.timestamp', 'ASC')
                .skip(offset)
                .take(limit)
                .getMany();
            return Promise.resolve({
                status: 200,
                data: messages
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
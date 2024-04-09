import { DataSource, Repository } from "typeorm"
import * as dotenv from "dotenv"
import { Log } from "../../models/entities/Log";
import { Message } from "../../models/entities/Message";
import { StreamSession } from "../../models/entities/StreamSession";
import { TruYouAccount } from "../../models/entities/TruYouAccount";

dotenv.config();

export const mySqlDataSource = new DataSource({
    type: "mysql",
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    username: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    entities: ["src/models/entities/*.ts"],
    logging: false,
    synchronize: false,
});

// Initialize the data source to open the connection
mySqlDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

// Initialize repositories using the mySql data source
export const logRepository: Repository<Log> = mySqlDataSource.getRepository(Log);
export const messageRepository: Repository<Message> = mySqlDataSource.getRepository(Message);
export const streamSessionRepository: Repository<StreamSession> = mySqlDataSource.getRepository(StreamSession);
export const truYouAccountRepository: Repository<TruYouAccount> = mySqlDataSource.getRepository(TruYouAccount);
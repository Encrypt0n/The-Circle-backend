import { Result } from "../../models/Result";
import { StreamSession } from "../../models/entities/StreamSession";
import { TruYouAccount } from "../../models/entities/TruYouAccount";
import { truYouAccountRepository } from "../../utils/datasources/mysql.datasource";

const fs = require("fs");
const repository = truYouAccountRepository;
const streamSessionService = require("./streamSession.service");

module.exports = {
  async postTruYouAccount(body: TruYouAccount): Promise<Result> {
    try {
      // Insert the TruYou Account
      let truYouAccount = repository.create(body);
      truYouAccount = await repository.save(truYouAccount);

      // Create the result with the server public key
      const publicKeyServer = fs.readFileSync(
        process.env.KEYS_DIRECTORY + "public_key",
        "utf8"
      );
      const data = {
        truYouAccount: truYouAccount,
        publicKeyServer: publicKeyServer,
      };

      return Promise.resolve({
        status: 200,
        data: data,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getAllTruYouAccounts(): Promise<Result> {
    try {
      const truYouAccounts = await repository.find();

      return Promise.resolve({
        status: 200,
        data: truYouAccounts,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getAllLiveTruYouAccounts(): Promise<Result> {
    try {
      const liveTruYouAccounts = await repository
        .createQueryBuilder("tru_you_account")
        .where("tru_you_account.isLive = true")
        .getMany();

      return Promise.resolve({
        status: 200,
        data: liveTruYouAccounts,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async updateSatoshi(truYouAccountName: string, amountToBeAdded: number): Promise<Result> {
    // Verify parameters
    if (typeof amountToBeAdded !== "number")
      return Promise.resolve({
        status: 400,
        error: "Wrong data type for amount to update with",
      });

    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .update(TruYouAccount)
        .set({ satoshi: () => "satoshi + " + amountToBeAdded})
        .where("name = :name", { name: truYouAccountName })
        .execute()
        .then((response) => {
          return response[0];
        });
  
      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getTruYouAccountByID(requestedId: number): Promise<Result> {
    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .leftJoinAndSelect("tru_you_account.followers", "followers")
        .leftJoinAndSelect("tru_you_account.following", "following")
        .where("tru_you_account.id = :id", { id: requestedId })
        .getOne();

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getTruYouAccountByIDWithoutFollowersAndFollowing(
    requestedId: number
  ): Promise<Result> {
    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .where("tru_you_account.id = :id", { id: requestedId })
        .getOne();

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getPublicKeyOfTruYouAccountByID(requestedId: number): Promise<String> {
    try {
      const result = await repository
        .createQueryBuilder("tru_you_account")
        .where("tru_you_account.id = :id", { id: requestedId })
        .getOne();
      return Promise.resolve(result.publicKey);
    } catch (error) {
      return Promise.reject("No user found");
    }
  },

  async postFollower(
    transparantPersonName: string,
    body: TruYouAccount
  ): Promise<Result> {
    try {
      let result: Result = await this.getTruYouAccountByName(
        transparantPersonName
      );
      let transparantPerson = result.data;
      transparantPerson.followers.push(body);
      transparantPerson = await repository.save(transparantPerson);

      return Promise.resolve({
        status: 200,
        data: transparantPerson,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async updateIsLive(
    name: string,
    isLive: boolean,
    firebaseStoragelocation?: string
  ): Promise<Result> {
    try {
      let truYouAccount: TruYouAccount;

      if (isLive) {
        await repository
          .createQueryBuilder("tru_you_account")
          .update(TruYouAccount)
          .set({ isLive: isLive })
          .where("name = :name", { name: name })
          .execute();

        const result: Result = await this.getTruYouAccountByName(name);
        truYouAccount = result.data;

        let streamSession = new StreamSession();
        streamSession.truYouAccountName = name;
        streamSession.truYouAccount = truYouAccount;

        await streamSessionService.postStreamSession(streamSession);
      } else {
        await repository
          .createQueryBuilder("tru_you_account")
          .update(TruYouAccount)
          .set({
            isLive: isLive,
            viewerCount: 0,
          })
          .where("name = :name", { name: name })
          .execute();

        const result: Result = await this.getTruYouAccountByName(name);
        truYouAccount = result.data;

        // File Location in Stream Session
        await streamSessionService.finishStreamSession(
          name,
          firebaseStoragelocation
        );
      }

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async deleteFollower(
    transparantPersonName: string,
    body: TruYouAccount
  ): Promise<Result> {
    try {
      let result: Result = await this.getTruYouAccountByName(
        transparantPersonName
      );
      let transparantPerson = result.data;
      transparantPerson.followers = transparantPerson.followers.filter(
        (truYouAccount) => {
          return truYouAccount.id !== body.id;
        }
      );
      await repository.save(transparantPerson);

      return Promise.resolve({
        status: 200,
        data: transparantPerson,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async updateViewerCount(
    name: string,
    amountToUpdateWith: number
  ): Promise<Result> {
    // Verify parameters
    if (typeof amountToUpdateWith !== "number")
      return Promise.resolve({
        status: 400,
        error: "Wrong data type for amount to update with",
      });

    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .update(TruYouAccount)
        .set({ viewerCount: () => "viewerCount + " + amountToUpdateWith })
        .where("name = :name", { name: name })
        .execute()
        .then((response) => {
          return response[0];
        });

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async resetViewerCount(name: string): Promise<Result> {
    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .update(TruYouAccount)
        .set({ viewerCount: 0 })
        .where("name = :name", { name: name })
        .execute()
        .then((response) => {
          return response[0];
        });

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getLiveTruYouAccountByID(requestedId: number): Promise<Result> {
    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .where("tru_you_account.id = :id", { id: requestedId })
        .andWhere("tru_you_account.isLive = true")
        .getOne();
      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getTruYouAccountByName(requestedName: string): Promise<Result> {
    try {
      const truYouAccount = await repository
        .createQueryBuilder("tru_you_account")
        .leftJoinAndSelect("tru_you_account.followers", "followers")
        .leftJoinAndSelect("tru_you_account.following", "following")
        .where("tru_you_account.name = :name", { name: requestedName })
        .getOne();

      return Promise.resolve({
        status: 200,
        data: truYouAccount,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

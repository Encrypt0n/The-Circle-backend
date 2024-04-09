const service = require("../services/api/truYouAccount.service")

export async function login(req) {
    const {username} = req.body
    if (!username) {
        return Promise.reject("No username found")
    }

    return await service.getTruYouAccountByName(username)
}
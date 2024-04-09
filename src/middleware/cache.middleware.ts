export const cacheMiddleware = async function (req, res, next, cache) {
    if (!req.session) {
        req.session = cache
    }
    next()
}

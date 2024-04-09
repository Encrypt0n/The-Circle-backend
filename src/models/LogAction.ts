enum LogAction {
    STREAM_START = "User started streaming",
    STREAM_STOP = "User stopped streaming",
    STREAM_WATCH = "User started watching a stream",
    STREAM_LEAVE = "User stopped watching a stream",
    COMMENT = "User commented on stream",
    FOLLOW = "User followed streamer",
    UNFOLLOW = "User unfollowed streamer"
}

export { LogAction }
export interface DigitalSignature<DATA> {
    payload: DATA
    username: string,
    timestamp: Date,
    signature: string,
}
class Transfer {
    constructor(id, senderId, recipientEmail, recipientId, points, status, token, expiresAt, confirmedAt, createdAt, updatedAt) {
        this.id = id;
        this.senderId = senderId;
        this.recipientEmail = recipientEmail;
        this.recipientId = recipientId;
        this.points = points;
        this.status = status;
        this.token = token;
        this.expiresAt = expiresAt;
        this.confirmedAt = confirmedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            senderId: this.senderId,
            recipientEmail: this.recipientEmail,
            recipientId: this.recipientId,
            points: this.points,
            status: this.status,
            token: this.token,
            expiresAt: this.expiresAt,
            confirmedAt: this.confirmedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Transfer;
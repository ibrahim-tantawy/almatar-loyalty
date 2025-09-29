class User {
    constructor(id, name, email, password, pointsBalance, status, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.pointsBalance = pointsBalance;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            pointsBalance: this.pointsBalance,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;
//user role model
module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define("user_role", {
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    })
    return UserRole
}
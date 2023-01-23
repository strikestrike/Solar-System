//customer model
module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define("customer", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            isEmail: true, //checks for email format
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            isPhone: true, //checks for email format
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    })
    return Customer
}
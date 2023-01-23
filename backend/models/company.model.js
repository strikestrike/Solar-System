//company model
module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define("company", {
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
        company_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    })
    return Company
}
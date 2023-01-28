//company model
module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define("company", {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        birthday: {
            type: DataTypes.DATEONLY,
        },
        avatar: {
            type: DataTypes.STRING,
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
    });

    Company.associate = function (models) {
        Company.hasMany(models.Converter, { foreignKey: 'company_id', as: 'converters' })
        Company.hasOne(models.UserRole, { foreignKey: 'user_id', as: 'role' })
    };

    return Company
}
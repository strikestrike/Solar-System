//customer model
module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define("customer", {
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
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    });

    Customer.associate = function (models) {
        Company.hasMany(models.Converter, { foreignKey: 'customer_id', as: 'converters' })
        Customer.hasOne(models.UserRole, { foreignKey: 'user_id', as: 'role' })
    };

    return Customer
}
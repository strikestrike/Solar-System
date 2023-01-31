//user model
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
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
        additional: {
            type: DataTypes.TEXT,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true
    });

    User.associate = function (models) {
        User.hasMany(models.Converter, { foreignKey: 'user_id', as: 'converters' })
        User.hasOne(models.Company, { foreignKey: 'user_id', as: 'company' })
    };

    return User
}
//company model
module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define("Company", {
        photo: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
        },
        admin: {
            type: DataTypes.INTEGER,
        },
    }, {
        timestamps: true,
        underscored: true
    });

    Company.associate = function (models) {
        Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' })
        Company.hasMany(models.Converter, { foreignKey: 'company_id', as: 'converters' })
    };

    return Company
}
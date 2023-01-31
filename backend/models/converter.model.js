//converter model
module.exports = (sequelize, DataTypes) => {
    const Converter = sequelize.define("Converter", {
        photo: {
            type: DataTypes.STRING,
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
        },
        serial_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
    }, {
        timestamps: true,
        underscored: true
    });

    Converter.associate = function (models) {
        Converter.hasMany(models.Ticket, { foreignKey: 'converter_id', as: 'tickets' });
        Converter.hasMany(models.Event, { foreignKey: 'converter_id', as: 'events' });
        Converter.hasOne(models.Throughput, { foreignKey: 'converter_id', as: 'throughput' });
        Converter.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Converter.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    };

    return Converter
}
//converter model
module.exports = (sequelize, DataTypes) => {
    const Converter = sequelize.define("converter", {
        brand: {
            type: DataTypes.STRING,
            allowNull: false
        },
        photo: {
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
            allowNull: false
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    });

    Converter.associate = function (models) {
        Converter.hasMany(models.Ticket, { foreignKey: 'converter_id', as: 'tickets' })
        Converter.hasMany(models.Event, { foreignKey: 'converter_id', as: 'events' })
        Converter.hasOne(models.Throughput, { foreignKey: 'converter_id', as: 'role' })
    };

    return Converter
}
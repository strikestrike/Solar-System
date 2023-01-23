//converter model
module.exports = (sequelize, DataTypes) => {
    const Converter = sequelize.define("converter", {
        brand: {
            type: DataTypes.STRING,
            allowNull: false
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
    })
    return Converter
}
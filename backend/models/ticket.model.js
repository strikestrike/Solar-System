//ticket model
module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("ticket", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        converter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'converters',
                key: 'id'
            }
        }
    }, {
        timestamps: true,
        underscored: true
    });

    Ticket.associate = function (models) {
        Ticket.belongsTo(models.Converter, { foreignKey: 'converter_id', as: 'company' });
    };

    return Ticket
}
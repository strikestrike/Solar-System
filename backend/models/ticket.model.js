//ticket model
module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("ticket", {
        ticket_no: {
            type: DataTypes.STRING,
            allowNull: false
        },
        problem: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        level: {
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
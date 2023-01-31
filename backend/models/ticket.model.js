//ticket model
const { Sequelize, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("ticket", {
        ticket_no: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
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

    Ticket.beforeCreate((ticket, options) => {
        console.log(new Date());
        return Ticket.findAll({
            where: {
                created_at: {
                    [Op.lt]: new Date(),
                    [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
                },
                converter_id: ticket.converter_id,
            },
            order: [['id', 'DESC']],
            limit: 1,
        }).then(lastTicket => {
            if (lastTicket.length > 0) {
                ticket.ticket_no = lastTicket[0].ticket_no + 1;
            }
        });
    });

    return Ticket
}
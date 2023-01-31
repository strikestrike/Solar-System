//event model
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("event", {
        converter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'converters',
                key: 'id'
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    });

    Event.associate = function (models) {
        Event.belongsTo(models.Converter, { foreignKey: 'converter_id', as: 'converter' });
    };

    return Event
}
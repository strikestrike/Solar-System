//event model
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("event", {
        converter_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.TEXT,
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
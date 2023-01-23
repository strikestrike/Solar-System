//event model
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("event", {
        converter_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_data: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    })
    return Event
}
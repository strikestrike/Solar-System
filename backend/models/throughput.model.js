//throughput model
module.exports = (sequelize, DataTypes) => {
    const Throughput = sequelize.define("throughput", {
        converter_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expected_throughput: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true
    })
    return Throughput
}
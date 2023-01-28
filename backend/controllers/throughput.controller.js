const db = require('../models/model');

const Op = db.Sequelize.Op;
const Throughput = db.throughputs;

exports.createThroughput = async (req, res) => {
    const { converter_id, expected_throughput } = req.body;

    // Create a Throughput
    const throughput = {
        converter_id: req.body.converter_id,
        expected_throughput: req.body.expected_throughput,
    };

    // Save Throughput in the database
    Throughput.create(throughput)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Throughput."
            });
        });
}

exports.getThroughputs = async (req, res) => {
    const search = req.query.q;
    var condition = search ? { expected_throughput: { [Op.iLike]: `%${search}%` } } : null;

    Throughput.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving throughputs."
            });
        });
}

exports.getThroughputById = async (req, res) => {
    const id = req.params.id;

    Throughput.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Throughput with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Throughput with id=" + id
            });
        });
}

exports.updateThroughput = async (req, res) => {
    const id = req.params.id;

    Throughput.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Throughput was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Throughput with id=${id}. Maybe Throughput was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Throughput with id=" + id
            });
        });
}

exports.deleteThroughput = async (req, res) => {
    const id = req.params.id;

    Throughput.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Throughput was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Throughput with id=${id}. Maybe Throughput was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Throughput with id=" + id
            });
        });
}
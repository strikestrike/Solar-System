const db = require('../models/model');
const { check, validationResult } = require('express-validator');

const Op = db.Sequelize.Op;
const Ticket = db.Ticket;

exports.createTicket = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { problem, level, converter_id } = req.body;

    const ticket = { problem, level, converter_id };

    // Save Ticket in the database
    Ticket.create(ticket)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Ticket."
            });
        });
}

exports.getTickets = async (req, res) => {
    var conditions = [];
    const search = req.query.q;
    if (search) {
        conditions.push({
            [Op.or]: [
                { problem: { [Op.iLike]: `%${search}%` } },
                { level: { [Op.iLike]: `%${search}%` } }
            ]
        });
    }

    if (req.params.converterId) {
        conditions.push({ converter_id: req.params.converterId });
    }

    Ticket.findAll({ where: { [Op.and]: conditions } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tickets."
            });
        });
}

exports.getTicketById = async (req, res) => {
    const id = req.params.id;

    Ticket.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Ticket with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Ticket with id=" + id
            });
        });
}

exports.updateTicket = async (req, res) => {
    const id = req.params.id;

    Ticket.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Ticket was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Ticket with id=${id}. Maybe Ticket was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Ticket with id=" + id
            });
        });
}

exports.deleteTicket = async (req, res) => {
    const id = req.params.id;

    Ticket.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Ticket was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Ticket with id=${id}. Maybe Ticket was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Ticket with id=" + id
            });
        });
}

exports.ticketValidations = [
    check('problem', 'Problem is required').not().isEmpty(),
    check('level', 'Level is required').not().isEmpty(),
    check('converter_id', 'Converter id is required').not().isEmpty(),
];
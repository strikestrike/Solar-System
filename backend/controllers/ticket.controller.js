const db = require('../models/model');

const Op = db.Sequelize.Op;
const Ticket = db.tickets;

exports.createTicket = async (req, res) => {
    // Create a Ticket
    const ticket = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        converter_id: req.body.converter_id,
        customer_id: req.body.customer_id,
        company_id: req.body.company_id,
    };

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
    const search = req.query.q;
    var condition = search ? {
        [Op.and]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ]
    } : null;

    Ticket.findAll({ where: condition })
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
const db = require('../models/model');

const Op = db.Sequelize.Op;
const Event = db.events;

exports.createEvent = async (req, res) => {

    // Create a Event
    const event = {
        converter_id: req.body.converter_id,
        event_type: req.body.event_type,
        event_data: req.body.event_data,
    };

    // Save Event in the database
    Event.create(event)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Event."
            });
        });
}

exports.getEvents = async (req, res) => {
    const search = req.query.q;
    var condition = search ? { event_data: { [Op.iLike]: `%${search}%` } } : null;

    Event.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving events."
            });
        });
}

exports.getEventById = async (req, res) => {
    const id = req.params.id;

    Event.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Event with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Event with id=" + id
            });
        });
}

exports.updateEvent = async (req, res) => {
    const id = req.params.id;

    Event.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Event was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Event with id=${id}. Maybe Event was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Event with id=" + id
            });
        });
}

exports.deleteEvent = async (req, res) => {
    const id = req.params.id;

    Event.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Event was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Event with id=${id}. Maybe Event was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Event with id=" + id
            });
        });
}
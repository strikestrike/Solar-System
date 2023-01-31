const db = require('../models/model');
const { check, validationResult } = require('express-validator');

const Op = db.Sequelize.Op;
const Event = db.Event;

exports.createEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Create a Event
    const event = {
        converter_id: req.body.converter_id,
        level: req.body.level,
        message: req.body.message,
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
    var conditions = [];
    const search = req.query.q;
    if (search) {
        conditions.push({ message: { [Op.iLike]: `%${search}%` } });
    }

    if (req.params.converterId) {
        conditions.push({ converter_id: req.params.converterId });
    }

    Event.findAll({ where: { [Op.and]: conditions } })
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

exports.eventValidations = [
    check('converter_id', 'Converter id is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('level', 'Level is required').not().isEmpty(),
];
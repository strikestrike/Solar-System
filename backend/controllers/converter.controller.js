const db = require('../models/model');
const { check, validationResult } = require('express-validator');

const Op = db.Sequelize.Op;
const Converter = db.Converter;
// const Throughput = db.Throughput;

exports.createConverter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, serial_number, status, expected_throughput, company_id, user_id } = req.body;

    const converteryExists = await Converter.findOne({ where: { name: name, serial_number: serial_number } });
    if (converteryExists) {
        return res.status(400).json({ error: "Converter already exists" });
    }

    // Create a converter
    const converter = {
        name,
        description,
        photo: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
        serial_number,
        status,
        expected_throughput,
        company_id,
        user_id,
    };

    // Save Converter in the database
    Converter.create(converter)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Converter."
            });
        });
}

exports.getConverters = (req, res) => {
    var conditions = [];
    const search = req.query.q;
    if (search) {
        conditions.push({
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { serial_number: { [Op.iLike]: `%${search}%` } }
            ]
        });
    }

    if (req.params.userId) {
        conditions.push({ user_id: req.params.userId });
    }

    if (req.params.companyId) {
        conditions.push({ company_id: req.params.companyId });
    }

    if (req.query.filter_flag && req.query.filter_flag == 1) {
        conditions.push({ user_id: null });
    }

    Converter.findAll({
        where: { [Op.and]: conditions },
        // include: [
        //     {
        //         association: 'throughputs',
        //         attributes: ['expected_throughput'],
        //         order: [['created_at', 'DESC']],
        //         limit: 1,
        //         required: true,
        //         duplicating: false,
        //     },
        // ],
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving converters."
            });
        });
}

exports.getConverterById = (req, res) => {
    const id = req.params.id;

    Converter.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Converter with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Converter with id=" + id
            });
        });
}

exports.updateConverter = (req, res) => {
    const id = req.params.id;

    if (req.file) {
        req.body.photo = "/uploads/" + req.file.filename;
    }

    Converter.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Converter was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Converter with id=${id}. Maybe Converter was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Converter with id=" + id
            });
        });
}

exports.deleteConverter = (req, res) => {
    const id = req.params.id;

    Converter.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Converter was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Converter with id=${id}. Maybe Converter was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Converter with id=" + id
            });
        });
}


exports.converterValidations = [
    check('name', 'Name is required').not().isEmpty(),
    check('serial_number', 'Serial number is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
    check('expected_throughput', 'Expected throughput is required').not().isEmpty(),
    check('company_id', 'Company id is required').not().isEmpty(),
];
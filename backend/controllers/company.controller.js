const db = require('../models/model');
const { check, validationResult } = require('express-validator');

const Op = db.Sequelize.Op;
const Company = db.Company;
const User = db.User;
const Converter = db.Converter;

exports.createCompany = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, admin, converters } = req.body;

    const companyExists = await Company.findOne({ where: { name: name } });
    if (companyExists) {
        return res.status(400).json({ error: "Company already exists" });
    }

    const adminUser = await User.findOne({ where: { email: admin } });
    if (!adminUser) {
        return res.status(400).json({ error: "No user exists for the admin" });
    }

    // Create a company
    const company = {
        photo: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
        name,
        description,
        admin: (adminUser ? adminUser.id : null),
    };

    // Save Company in the database
    Company.create(company)
        .then(async data => {
            adminUser.company_id = data.id;
            await adminUser.save();

            if (converters) {
                await Converter.update({ company_id: data.id }, {
                    where: {
                        id: {
                            [Op.in]: converters.split(',').filter(Boolean)
                        }
                    }
                });
            }
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Company."
            });
        });
}

exports.getCompanies = async (req, res) => {
    const search = req.query.q;
    var condition = search ? {
        [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ]
    } : null;

    Company.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving companies."
            });
        });
}

exports.getCompanyById = async (req, res) => {
    const id = req.params.id;
    console.log(id);

    Company.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Company with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Company with id=" + id
            });
        });
}

exports.updateCompany = async (req, res) => {
    const id = req.params.id;

    if (req.file) {
        req.body.photo = "/uploads/" + req.file.filename;
    }

    if (!req.body.admin) {
        req.body.admin = null;
    }

    Company.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Company was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Company with id=${id}. Maybe Company was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Company with id=" + id
            });
        });
}

exports.deleteCompany = async (req, res) => {
    const id = req.params.id;

    Company.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Company was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Company with id=${id}. Maybe Company was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Company with id=" + id
            });
        });
}

exports.companyValidations = [
    check('name', 'name is required').not().isEmpty()
];
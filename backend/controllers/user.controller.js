const db = require('../models/model');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const Op = db.Sequelize.Op;
const User = db.User;

exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }

    const { first_name, last_name, address, birthday, email, phone, password } = req.body;

    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
        return res.status(400).send({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    User.create({
        first_name,
        last_name,
        address,
        birthday,
        avatar: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
        email,
        phone,
        password: hashedPassword,
        company_id: 0,
        role: constant.ROLE_CUSTOMER
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        });
}

exports.getUsers = async (req, res) => {
    var conditions = [];
    const search = req.query.q;
    if (search) {
        conditions.push({
            [Op.or]: [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { address: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
            ]
        });
    }

    if (req.params.companyId) {
        conditions.push({ company_id: req.params.companyId });
    }

    User.findAll({ where: { [Op.and]: conditions } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
}

exports.getUserById = async (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find User with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Company with id=" + id
            });
        });
}

exports.updateUser = async (req, res) => {
    const id = req.params.id;

    if (req.file) {
        req.body.photo = "/uploads/" + req.file.filename;
    }

    User.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating User with id=" + id
            });
        });
}

exports.deleteUser = async (req, res) => {
    const id = req.params.id;

    User.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with id=" + id
            });
        });
}

exports.userValidations = [
    check('first_name').not().isEmpty().withMessage('first_name is required'),
    check('email').isEmail().withMessage('email is not valid'),
    check('password').not().isEmpty().withMessage('password is required'),
    // check('role').not().isEmpty().withMessage('role is required'),
];
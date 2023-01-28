const db = require('../models/model');
const bcrypt = require('bcrypt');

const Op = db.Sequelize.Op;
const Customer = db.customers;

exports.createCustomer = async (req, res) => {
    const { name, email, phone, password, company_id } = req.body;
    const customerExists = await Customer.findOne({ where: { email: email } });
    if (customerExists) {
        return res.status(400).json({ error: "Customer already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a Customer
    const customer = {
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
        company_id: company_id,
    };

    // Save Customer in the database
    Customer.create(customer)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Customer."
            });
        });
}

exports.getCustomers = async (req, res) => {
    const search = req.query.q;
    var condition = search ? {
        [Op.and]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ]
    } : null;

    Customer.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving customers."
            });
        });
}

exports.getCustomerById = async (req, res) => {
    const id = req.params.id;

    Customer.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Customer with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Customer with id=" + id
            });
        });
}

exports.updateCustomer = async (req, res) => {
    const id = req.params.id;

    Customer.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Customer was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Customer with id=${id}. Maybe Customer was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Customer with id=" + id
            });
        });
}

exports.deleteCustomer = async (req, res) => {
    const id = req.params.id;

    Customer.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Customer was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Customer with id=${id}. Maybe Customer was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Customer with id=" + id
            });
        });
}
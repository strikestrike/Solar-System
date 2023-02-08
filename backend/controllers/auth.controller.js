const db = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = db.User;

exports.singin = async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ where: { email: req.body.email } });

        // If user not found, return error
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        // If passwords do not match, return error
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Sign the JWT token
        const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.secretKey, { expiresIn: '1h' });

        // Return the token and user information
        return res.json({ token, user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }

    try {
        const { first_name, last_name, address, email, phone, password } = req.body;

        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).send({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name,
            last_name,
            address,
            avatar: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
            email,
            phone,
            password: hashedPassword,
            role: constant.ROLE_CUSTOMER
        });

        const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.secretKey, { expiresIn: '1h' });

        return res.status(201).send({ token, user });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
}

exports.signupValidations = [
    check('first_name').not().isEmpty().withMessage('First name is required'),
    // check('email').isEmail().withMessage('Invalid email address'),
    // check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];


exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const updateFields = {};
        if (req.body.first_name) updateFields.first_name = req.body.first_name;
        if (req.body.last_name) updateFields.last_name = req.body.last_name;
        if (req.body.address) updateFields.address = req.body.address;
        if (req.body.birthday) updateFields.birthday = req.body.birthday;

        console.log('>>>>', req.body);


        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateFields.password = hashedPassword;
        }
        if (req.file) updateFields.avatar = "/uploads/" + req.file.filename;
        await user.update(updateFields);
        return res.status(200).json({ msg: 'User updated successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
}

exports.getProfile = async (req, res) => {
    const id = req.user.id;

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

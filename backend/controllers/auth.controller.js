const db = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Customer = db.customers;
const Company = db.companies;
const UserRole = db.user_role;

exports.singin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ where: { email: email } });
        const company = await Company.findOne({ where: { email: email } });
        if (!customer && !company) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        var user = customer || company;
        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const role = await UserRole.findOne({ where: { user_id: user.id } });
        const token = jwt.sign({ id: user.id, role: role.role, email: user.email }, process.env.secretKey, {
            expiresIn: 1 * 24 * 60 * 60 * 1000
        });

        user.setDataValue('role', role.role);
        user.setDataValue('token', token);

        res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        return res.status(200).json({ message: "Logged in successfully", user: user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
}


exports.singup = async (req, res) => {
    try {
        const { first_name, last_name, address, birthday, email, phone, password, role, company_id } = req.body;
        const userExists = await Customer.findOne({ where: { email: email } });
        const companyExists = await Company.findOne({ where: { email: email } });
        if (userExists || companyExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role === "customer") {
            const customer = await Customer.create({
                first_name,
                last_name,
                address,
                birthday,
                avatar: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
                email,
                phone,
                password: hashedPassword,
                company_id
            });
            const user_role = await UserRole.create({
                role,
                user_id: customer.id
            });
            const token = jwt.sign({ id: customer.id, role: customer.role, email: customer.email }, process.env.secretKey, {
                expiresIn: 1 * 24 * 60 * 60 * 1000
            });

            customer.setDataValue('role', user_role.role);
            customer.setDataValue('token', token);

            return res.status(201).json({ message: "Customer created successfully", user: customer });
        } else if (role === "company_admin") {
            const company = await Company.create({
                first_name,
                last_name,
                address,
                birthday,
                avatar: (req.file !== undefined ? "/uploads/" + req.file.filename : null),
                email,
                phone,
                password: hashedPassword,
                company_admin: true
            });
            const user_role = await UserRole.create({
                role,
                user_id: company.id
            });

            const token = jwt.sign({ id: company.id, role: company.role, email: company.email }, process.env.secretKey, {
                expiresIn: 1 * 24 * 60 * 60 * 1000
            });

            company.setDataValue('role', user_role.role);
            company.setDataValue('token', token);

            return res.status(201).json({ message: "Company admin created successfully", user: company });
        } else {
            return res.status(401).json({ error: "Invalid role" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
}


exports.updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, password, password_repeat } = req.body;
        var user = req.user;
        console.log(user);

        if (user.email != "email") {
            const userExists = await Customer.findOne({ where: { email: email } });
            const companyExists = await Company.findOne({ where: { email: email } });
            if (userExists || companyExists) {
                return res.status(400).json({ error: "User already exists" });
            }
        }

        if (user.role == "customer") {
            const customer = await Customer.findByPk(user.id);
            customer.first_name = first_name;
            customer.last_name = last_name;
            customer.email = email;
            customer.password = await bcrypt.hash(password, 10);
            customer.save();
        } else if (user.role == "company_admin") {
            const company = await Company.findByPk(user.id);
            company.first_name = first_name;
            company.last_name = last_name;
            company.email = email;
            company.password = await bcrypt.hash(password, 10);
            company.save();
        }

        user.email = email;
        user.first_name = first_name;
        user.last_name = last_name;

        return res.status(201).json({ message: "Profile updated successfully", user: user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
}
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
        const user = customer || company;
        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const role = await UserRole.findOne({ where: { user_id: user.id } });
        const token = jwt.sign({ id: user.id, role: role.role }, process.env.secretKey, {
            expiresIn: 1 * 24 * 60 * 60 * 1000
        });
        res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        return res.status(200).json({ message: "Logged in successfully", role: role.role });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
}


exports.singup = async (req, res) => {
    try {
        const { name, email, phone, password, role, company_id } = req.body;
        const userExists = await Customer.findOne({ where: { email: email } });
        const companyExists = await Company.findOne({ where: { email: email } });
        if (userExists || companyExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role === "customer") {
            const customer = await Customer.create({
                name,
                email,
                phone,
                password: hashedPassword,
                company_id
            });
            const user_role = await UserRole.create({
                role,
                user_id: customer.id
            });
            return res.status(201).json({ message: "Customer created successfully" });
        } else if (role === "company_admin") {
            const company = await Company.create({
                name,
                email,
                phone,
                password: hashedPassword,
                company_admin: true
            });
            const user_role = await UserRole.create({
                role,
                user_id: company.id
            });
            return res.status(201).json({ message: "Company admin created successfully" });
        } else {
            return res.status(401).json({ error: "Invalid role" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
}
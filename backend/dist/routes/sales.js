"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// Get all sales with domain details
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const [rows] = await database_1.default.query(`
      SELECT 
        s.id,
        d.name AS domainName,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS saleDate,
        s.selling_price AS sellingPrice,
        s.buyer,
        d.registrar,
        d.category
      FROM sales s
      JOIN domains d ON s.domain_id = d.id
    `);
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

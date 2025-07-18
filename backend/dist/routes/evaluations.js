"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const router = (0, express_1.Router)();
// Get all evaluations
router.get('/', async (req, res) => {
    try {
        const [rows] = await database_1.default.query(`
      SELECT 
        id,
        domain_id AS domainId,
        tool,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        estimated_value AS estimatedValue
      FROM evaluations
    `);
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Add new evaluation
router.post('/', async (req, res) => {
    const evaluation = req.body;
    try {
        const [result] = await database_1.default.query(`INSERT INTO evaluations (domain_id, tool, date, estimated_value)
       VALUES (?, ?, ?, ?)`, [
            parseInt(evaluation.domainId), // Convert to INT
            evaluation.tool,
            evaluation.date,
            evaluation.estimatedValue
        ]);
        const [rows] = await database_1.default.query(`
      SELECT 
        id,
        domain_id AS domainId,
        tool,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        estimated_value AS estimatedValue
      FROM evaluations
      WHERE id = ?
    `, [result.insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding evaluation' });
    }
});
// Delete evaluation
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const connection = await database_1.default.getConnection();
        await connection.beginTransaction();
        try {
            await connection.query('DELETE FROM evaluations WHERE id = ?', [id]);
            await connection.commit();
            res.status(204).send();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting evaluation' });
    }
});
exports.default = router;

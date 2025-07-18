"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
/**
 * Helpers
 */
const SELECT_COLUMNS = `
  id,
  name,
  registrar,
  category,
  DATE_FORMAT(purchase_date, '%Y-%m-%d')   AS purchaseDate,
  DATE_FORMAT(expiration_date, '%Y-%m-%d') AS expirationDate,
  status,
  purchase_price                           AS purchasePrice
`;
/**
 * Wrap an async route handler so we can simply `throw` and let the
 * Express error‑handling middleware catch it.
 */
const asyncRoute = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const router = (0, express_1.Router)();
// ────────────────────────────────────────────────────────────────────────────────
// GET /api/domains → list all domains
// ────────────────────────────────────────────────────────────────────────────────
router.get('/', asyncRoute(async (_req, res) => {
    const [rows] = await database_1.default.query(`SELECT ${SELECT_COLUMNS} FROM domains ORDER BY id DESC`);
    res.json(rows);
}));
// ────────────────────────────────────────────────────────────────────────────────
// POST /api/domains → add new domain (with optional sale record)
// ────────────────────────────────────────────────────────────────────────────────
router.post('/', asyncRoute(async (req, res) => {
    const domain = req.body;
    let conn;
    try {
        conn = await database_1.default.getConnection();
        await conn.beginTransaction();
        // 1️⃣ Insert domain
        const [result] = await conn.query(`INSERT INTO domains (name, registrar, category, purchase_date, expiration_date, status, purchase_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            domain.name,
            domain.registrar,
            domain.category,
            domain.purchaseDate,
            domain.expirationDate,
            domain.status,
            domain.purchasePrice ?? null,
        ]);
        const domainId = result.insertId;
        // 2️⃣ Optional sale record
        if (domain.status === 'vendu') {
            await conn.query(`INSERT INTO sales (domain_id, sale_date, selling_price, buyer)
         VALUES (?, ?, ?, ?)`, [domainId, domain.saleDate, domain.sellingPrice, domain.buyer]);
        }
        // 3️⃣ Fetch & commit
        const [rows] = await conn.query(`SELECT ${SELECT_COLUMNS} FROM domains WHERE id = ?`, [domainId]);
        await conn.commit();
        res.status(201).json(rows[0]);
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        conn?.release();
    }
}));
// ────────────────────────────────────────────────────────────────────────────────
// PUT /api/domains/:id → update domain & sale record
// ────────────────────────────────────────────────────────────────────────────────
router.put('/:id', asyncRoute(async (req, res) => {
    const domainId = Number(req.params.id);
    const domain = req.body;
    let conn;
    try {
        conn = await database_1.default.getConnection();
        await conn.beginTransaction();
        await conn.query(`UPDATE domains SET name = ?, registrar = ?, category = ?, purchase_date = ?, expiration_date = ?, status = ?, purchase_price = ?
       WHERE id = ?`, [domain.name, domain.registrar, domain.category, domain.purchaseDate, domain.expirationDate, domain.status, domain.purchasePrice ?? null, domainId]);
        if (domain.status === 'vendu') {
            await conn.query(`INSERT INTO sales (domain_id, sale_date, selling_price, buyer)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sale_date = VALUES(sale_date), selling_price = VALUES(selling_price), buyer = VALUES(buyer)`, [domainId, domain.saleDate, domain.sellingPrice, domain.buyer]);
        }
        else {
            await conn.query('DELETE FROM sales WHERE domain_id = ?', [domainId]);
        }
        await conn.commit();
        res.json({ ...domain, id: domainId });
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        conn?.release();
    }
}));
// ────────────────────────────────────────────────────────────────────────────────
// DELETE /api/domains/:id → cascade delete domain & its evaluations
// ────────────────────────────────────────────────────────────────────────────────
router.delete('/:id', asyncRoute(async (req, res) => {
    const domainId = Number(req.params.id);
    let conn;
    try {
        conn = await database_1.default.getConnection();
        await conn.beginTransaction();
        await conn.query('DELETE FROM evaluations WHERE domain_id = ?', [domainId]);
        await conn.query('DELETE FROM domains      WHERE id        = ?', [domainId]);
        await conn.commit();
        res.sendStatus(204);
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        conn?.release();
    }
}));
exports.default = router;

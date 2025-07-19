"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
/**
 * Small helper so we can write concise async route handlers.
 * Any uncaught error will be forwarded to the global error middleware.
 */
const asyncRoute = (fn) => (req, res, next) => fn(req, res, next).catch(next);
// ────────────────────────────────────────────────────────────────────────────────
// GET /api/settings  – fetch custom lists
// ────────────────────────────────────────────────────────────────────────────────
router.get('/', auth_1.authenticateToken, asyncRoute(async (_req, res) => {
    const [rows] = await database_1.default.query('SELECT setting_value AS settingValue FROM settings WHERE setting_key = ? LIMIT 1', ['customLists']);
    const payload = rows.length ? JSON.parse(rows[0].settingValue) : {};
    res.json(payload);
}));
// ────────────────────────────────────────────────────────────────────────────────
// PUT /api/settings  – upsert custom lists
// ────────────────────────────────────────────────────────────────────────────────
router.put('/', auth_1.authenticateToken, asyncRoute(async (req, res) => {
    const customLists = req.body;
    const settingValue = JSON.stringify(customLists);
    await database_1.default.query(`INSERT INTO settings (setting_key, setting_value)
       VALUES ('customLists', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`, [settingValue]);
    res.json(customLists); // 200 OK
}));
exports.default = router;

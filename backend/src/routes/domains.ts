import { Router } from 'express';
import mysql from 'mysql2/promise';
import pool from '../database';
import { Domain } from '../types/domainTypes';

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
` as const;

/**
 * Wrap an async route handler so we can simply `throw` and let the
 * Express error‑handling middleware catch it.
 */
const asyncRoute = (fn: (...args: any[]) => Promise<any>) =>
  (req: any, res: any, next: any) => fn(req, res, next).catch(next);

const router = Router();

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/domains → list all domains
// ────────────────────────────────────────────────────────────────────────────────
router.get('/', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(`SELECT ${SELECT_COLUMNS} FROM domains ORDER BY id DESC`);
  res.json(rows);
}));

// ────────────────────────────────────────────────────────────────────────────────
// POST /api/domains → add new domain (with optional sale record)
// ────────────────────────────────────────────────────────────────────────────────
router.post('/', asyncRoute(async (req, res) => {
  const domain: Omit<Domain, 'id'> = req.body;

  // Check if domain already exists
  const [existingDomains] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id FROM domains WHERE name = ?', 
    [domain.name]
  );
  
  if (existingDomains.length > 0) {
    return res.status(409).json({ 
      error: 'DUPLICATE_DOMAIN', 
      message: `Le domaine "${domain.name}" existe déjà dans votre portefeuille.` 
    });
  }

  let conn: mysql.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Insert domain
    const [result] = await conn.query<mysql.ResultSetHeader>(
      `INSERT INTO domains (name, registrar, category, purchase_date, expiration_date, status, purchase_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        domain.name,
        domain.registrar,
        domain.category,
        domain.purchaseDate,
        domain.expirationDate,
        domain.status,
        domain.purchasePrice ?? null,
      ],
    );
    const domainId = result.insertId;

    // 2️⃣ Optional sale record
    if (domain.status === 'vendu' && domain.saleDate && domain.sellingPrice) {
      await conn.query(
        `INSERT INTO sales (domain_id, sale_date, selling_price, buyer)
         VALUES (?, ?, ?, ?)`,
        [domainId, domain.saleDate, domain.sellingPrice, domain.buyer || null],
      );
    }

    // 3️⃣ Fetch & commit
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT ${SELECT_COLUMNS} FROM domains WHERE id = ?`,
      [domainId],
    );
    await conn.commit();

    res.status(201).json(rows[0]);
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    conn?.release();
  }
}));

// ────────────────────────────────────────────────────────────────────────────────
// PUT /api/domains/:id → update domain & sale record
// ────────────────────────────────────────────────────────────────────────────────
router.put('/:id', asyncRoute(async (req, res) => {
  const domainId = Number(req.params.id);
  const domain: Domain = req.body;

  let conn: mysql.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE domains SET name = ?, registrar = ?, category = ?, purchase_date = ?, expiration_date = ?, status = ?, purchase_price = ?
       WHERE id = ?`,
      [domain.name, domain.registrar, domain.category, domain.purchaseDate, domain.expirationDate, domain.status, domain.purchasePrice ?? null, domainId],
    );

    // Always delete existing sales records for this domain first
    await conn.query('DELETE FROM sales WHERE domain_id = ?', [domainId]);
    
    // Then insert new sale record if status is 'vendu'
    if (domain.status === 'vendu' && domain.saleDate && domain.sellingPrice) {
      await conn.query(
        `INSERT INTO sales (domain_id, sale_date, selling_price, buyer)
         VALUES (?, ?, ?, ?)`,
        [domainId, domain.saleDate, domain.sellingPrice, domain.buyer || null],
      );
    }

    await conn.commit();
    res.json({ ...domain, id: domainId });
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    conn?.release();
  }
}));

// ────────────────────────────────────────────────────────────────────────────────
// DELETE /api/domains/:id → cascade delete domain & its evaluations
// ────────────────────────────────────────────────────────────────────────────────
router.delete('/:id', asyncRoute(async (req, res) => {
  const domainId = Number(req.params.id);
  let conn: mysql.PoolConnection | undefined;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query('DELETE FROM evaluations WHERE domain_id = ?', [domainId]);
    await conn.query('DELETE FROM domains      WHERE id        = ?', [domainId]);

    await conn.commit();
    res.sendStatus(204);
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    conn?.release();
  }
}));

export default router;

import mysql from 'mysql2/promise'
import { config } from './config.js'

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: '+00:00',
  charset: 'utf8mb4_unicode_ci',
})

pool.on('connection', (connection) => {
  connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci')
})

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function queryOne(sql, params) {
  const rows = await query(sql, params)
  return rows[0] ?? null
}

export async function execute(sql, params) {
  const [result] = await pool.execute(sql, params)
  return result
}

export async function pingDatabase() {
  const row = await queryOne('SELECT 1 AS ok')
  return row?.ok === 1
}

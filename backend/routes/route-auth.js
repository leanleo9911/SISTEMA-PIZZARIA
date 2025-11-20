const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/database-connection');
const { authMiddleware, adminOnly } = require('../middlewares/auth-middleware');
const { logError } = require('../utils/logger');

// ===== LOGIN =====
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  // Validar entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, senha } = req.body;

  try {
    // Buscar usuário no banco
    const usuario = await db.getAsync('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email]);

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        role: usuario.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Retornar dados do usuário e token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    logError('Erro no login', error, { email: req.body.email });
    res.status(500).json({ error: 'Erro ao processar login. Tente novamente.' });
  }
});

// ===== REGISTRO (apenas admin pode criar novos usuários) =====
router.post('/register', 
  authMiddleware,  // Requer autenticação
  adminOnly,       // Apenas administradores
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'funcionario']).withMessage('Role inválida')
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, email, senha, role = 'funcionario' } = req.body;

  try {
    // Verificar se email já existe
    const usuarioExistente = await db.getAsync('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = bcrypt.hashSync(senha, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Inserir usuário
    const result = await db.runAsync(`
      INSERT INTO usuarios (nome, email, senha_hash, role)
      VALUES (?, ?, ?, ?)
    `, [nome, email, senhaHash, role]);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      usuario: {
        id: result.lastID,
        nome,
        email,
        role
      }
    });

  } catch (error) {
    logError('Erro ao registrar usuário', error, { email: req.body.email });
    res.status(500).json({ error: 'Erro ao criar usuário. Tente novamente.' });
  }
});

// ===== VERIFICAR TOKEN =====
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário atualizado
    const usuario = await db.getAsync('SELECT id, nome, email, role FROM usuarios WHERE id = ? AND ativo = 1', [decoded.id]);

    if (!usuario) {
      return res.status(401).json({ valid: false });
    }

    res.json({ 
      valid: true, 
      usuario 
    });

  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;

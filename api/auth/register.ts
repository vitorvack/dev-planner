import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '../_lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_planner_secret_jwt_key_change_in_prod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { name, email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const client = await clientPromise;
    const db = client.db('dev_planner');
    const usersCollection = db.collection('users');

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await usersCollection.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
      },
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}

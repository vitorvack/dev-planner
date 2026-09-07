import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '../lib/mongodb.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_planner_secret_jwt_key_change_in_prod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const client = await clientPromise;
    const db = client.db('dev_planner');
    const usersCollection = db.collection('users');

    const cleanEmail = email.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name || cleanEmail.split('@')[0],
        email: cleanEmail,
      },
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}

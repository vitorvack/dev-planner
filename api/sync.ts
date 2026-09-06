import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import clientPromise from './lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_planner_secret_jwt_key_change_in_prod';

function verifyToken(req: VercelRequest): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('dev_planner');
    const syncCollection = db.collection('user_data');

    // GET: Baixar dados do usuário
    if (req.method === 'GET') {
      const data = await syncCollection.findOne({ userId: decoded.userId });
      if (!data) {
        return res.status(200).json({ empty: true });
      }
      return res.status(200).json(data.payload);
    }

    // POST: Salvar dados do usuário na nuvem
    if (req.method === 'POST') {
      const payload = req.body;
      await syncCollection.updateOne(
        { userId: decoded.userId },
        { 
          $set: { 
            userId: decoded.userId,
            email: decoded.email,
            payload, 
            updatedAt: new Date().toISOString() 
          } 
        },
        { upsert: true }
      );
      return res.status(200).json({ success: true, syncedAt: new Date().toISOString() });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error: any) {
    console.error('Erro na sincronização:', error);
    return res.status(500).json({ error: 'Falha na sincronização com MongoDB.' });
  }
}

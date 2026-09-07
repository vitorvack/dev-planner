import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  // Em desenvolvimento local sem .env, não quebra a build
  console.warn('MONGODB_URI não foi definida nas variáveis de ambiente.');
}

if (process.env.NODE_ENV === 'development') {
  // No modo de desenvolvimento, use uma variável global para preservar a conexão
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise && uri) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise || Promise.reject('MONGODB_URI ausente');
} else {
  // Em produção (Vercel)
  if (uri) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  } else {
    clientPromise = Promise.reject('MONGODB_URI ausente');
  }
}

export default clientPromise;

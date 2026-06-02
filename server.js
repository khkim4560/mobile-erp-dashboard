import express from 'express';
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

// 1. JSON Server 설정 (API)
server.use('/api', middlewares);
server.use('/api', router);

// 2. Vue 빌드 파일 서비스 (Static)
server.use(express.static(path.join(__dirname, 'dist')));

// 3. 모든 경로를 index.html로 리다이렉트 (SPA 지원)
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

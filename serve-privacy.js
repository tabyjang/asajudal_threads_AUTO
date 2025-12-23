/**
 * 개인정보처리방침 페이지를 로컬에서 호스팅하는 간단한 서버
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PRIVACY_FILE = path.join(__dirname, 'privacy-policy.html');

const server = http.createServer((req, res) => {
    console.log(`${new Date().toLocaleString()} - 요청: ${req.url}`);

    // privacy-policy.html 서빙
    if (req.url === '/' || req.url === '/privacy-policy.html' || req.url === '/privacy') {
        fs.readFile(PRIVACY_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('서버 오류: 파일을 읽을 수 없습니다.');
                console.error(err);
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - 페이지를 찾을 수 없습니다.');
    }
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🌐 개인정보처리방침 서버 시작!');
    console.log('='.repeat(60));
    console.log('');
    console.log(`📍 로컬 URL: http://localhost:${PORT}`);
    console.log(`📍 네트워크 URL: http://localhost:${PORT}/privacy-policy.html`);
    console.log('');
    console.log('💡 Meta Developer 앱 설정에 입력할 URL:');
    console.log(`   http://localhost:${PORT}/privacy-policy.html`);
    console.log('');
    console.log('⚠️  주의: 이 URL은 로컬에서만 접근 가능합니다.');
    console.log('   공개 URL이 필요하면 GitHub Pages 사용을 권장합니다.');
    console.log('');
    console.log('🛑 서버 종료: Ctrl+C');
    console.log('='.repeat(60));
});

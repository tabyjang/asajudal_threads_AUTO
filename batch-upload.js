/**
 * Threads 일괄 업로드 스크립트 (CSV 파일 연동)
 * upload_list.csv 파일을 읽어서 순서대로 업로드합니다.
 */

require('dotenv').config({ override: true });
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const csv = require('csv-parse/sync'); // CSV 파싱 라이브러리가 없으면 단순 구현으로 대체

// 환경 변수
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const BASE_URL = `https://graph.threads.net/${process.env.GRAPH_API_VERSION || 'v1.0'}`;

// ==========================================
// ⚙️ 설정 (여기서 시간을 조절하세요)
// ==========================================
const CONFIG = {
    // 글 올리는 간격 (분 단위)
    // 예: 60 = 1시간마다, 30 = 30분마다
    INTERVAL_MINUTES: 60,

    // 한 번에 올릴 최대 개수
    // 예: 10 = 리스트에 100개가 있어도 10개만 올리고 멈춤
    MAX_POSTS: 10
};
// ==========================================

// 간단한 CSV 파서 (라이브러리 없이 처리)
function parseCSV(content) {
    const lines = content.split(/\r?\n/);
    const results = [];

    // 첫 줄(헤더) 건너뛰기
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 따옴표로 묶인 쉼표 처리 등 간단한 로직
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        if (parts && parts.length >= 1) {
            let text = parts[0].replace(/^"|"$/g, '').replace(/\\n/g, '\n');
            let imagePath = parts[1] ? parts[1].replace(/^"|"$/g, '').trim() : '';

            if (text) {
                results.push({ text, imagePath });
            }
        }
    }
    return results;
}

// 1. 임시 호스팅 업로드 (이미지 URL 변환)
async function uploadToTempHost(filePath) {
    if (!fs.existsSync(filePath)) return null;

    console.log(`📤 이미지 변환 중: ${path.basename(filePath)}`);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('userhash', '');
    formData.append('fileToUpload', fs.createReadStream(filePath));

    try {
        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: formData.getHeaders()
        });
        return response.data;
    } catch (error) {
        console.error(`❌ 이미지 업로드 실패: ${filePath}`);
        return null;
    }
}

// 2. 글(+이미지) 올리기
async function postToThreads(text, imageUrl) {
    try {
        const endpoint = `${BASE_URL}/${THREADS_USER_ID}/threads`;
        const payload = {
            access_token: ACCESS_TOKEN,
            text: text,
            media_type: imageUrl ? 'IMAGE' : 'TEXT'
        };

        if (imageUrl) {
            payload.image_url = imageUrl;
        }

        // 1. 컨테이너 생성
        console.log(`📝 컨테이너 생성 요청...`);
        const containerRes = await axios.post(endpoint, payload);
        const containerId = containerRes.data.id;

        // 2. 대기 (이미지 처리 시간)
        if (imageUrl) {
            process.stdout.write('⏳ 이미지 처리 대기 중...');
            await new Promise(r => setTimeout(r, 15000)); // 15초 대기
            console.log(' 완료');
        } else {
            await new Promise(r => setTimeout(r, 2000)); // 텍스트는 2초
        }

        // 3. 게시
        console.log(`🚀 게시물 발행 중...`);
        const publishRes = await axios.post(`${BASE_URL}/${THREADS_USER_ID}/threads_publish`, {
            creation_id: containerId,
            access_token: ACCESS_TOKEN
        });

        console.log(`✅ 발행 성공: ID ${publishRes.data.id}`);
        return true;

    } catch (error) {
        console.error('❌ 실패:', error.response?.data?.error?.message || error.message);
        return false;
    }
}

// 메인 실행
async function main() {
    const csvPath = path.join(__dirname, 'upload_list.csv');
    if (!fs.existsSync(csvPath)) {
        console.log('❌ upload_list.csv 파일이 없습니다.');
        return;
    }

    console.log('📂 CSV 파일 읽는 중...');
    const content = fs.readFileSync(csvPath, 'utf8');
    const posts = parseCSV(content);

    // 최대 개수만큼만 자르기
    const postLimit = Math.min(posts.length, CONFIG.MAX_POSTS);
    console.log(`총 ${posts.length}개 중 ${postLimit}개를 ${CONFIG.INTERVAL_MINUTES}분 간격으로 업로드합니다.\n`);

    for (let i = 0; i < postLimit; i++) {
        const post = posts[i];
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[${i + 1}/${postLimit}] ${currentTime} - 업로드 시작`);
        console.log(`💬 내용: ${post.text.substring(0, 20)}...`);

        let imageUrl = null;
        if (post.imagePath) {
            imageUrl = await uploadToTempHost(post.imagePath);
        }

        // 실제 전송
        const success = await postToThreads(post.text, imageUrl);

        // 마지막 글이 아니면 대기
        if (success && i < postLimit - 1) {
            const nextTime = new Date(Date.now() + CONFIG.INTERVAL_MINUTES * 60 * 1000).toLocaleTimeString();
            console.log(`\n💤 ${CONFIG.INTERVAL_MINUTES}분 대기 중... (다음 업로드 예정: ${nextTime})`);

            // 분 > 밀리초 변환
            await new Promise(r => setTimeout(r, CONFIG.INTERVAL_MINUTES * 60 * 1000));
        }
        console.log('-'.repeat(30));
    }
    console.log('🎉 모든 작업 완료!');
}

main();

/**
 * Threads API 기본 테스트 스크립트
 * 간단한 텍스트 게시물을 올립니다
 */

require('dotenv').config();
const axios = require('axios');

// 환경 변수 확인
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v18.0';

const BASE_URL = `https://graph.threads.net/${GRAPH_API_VERSION}`;

// 환경 변수 검증
function validateEnv() {
    if (!ACCESS_TOKEN || ACCESS_TOKEN === 'your_access_token_here') {
        console.error('❌ ERROR: ACCESS_TOKEN이 설정되지 않았습니다.');
        console.error('👉 .env 파일을 생성하고 ACCESS_TOKEN을 입력하세요.');
        process.exit(1);
    }

    if (!THREADS_USER_ID || THREADS_USER_ID === 'your_user_id_here') {
        console.error('❌ ERROR: THREADS_USER_ID가 설정되지 않았습니다.');
        console.error('👉 .env 파일에 THREADS_USER_ID를 입력하세요.');
        process.exit(1);
    }

    console.log('✅ 환경 변수 확인 완료');
    console.log(`📱 Threads User ID: ${THREADS_USER_ID}`);
    console.log(`🔑 Access Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
    console.log('');
}

// 1단계: 컨테이너 생성 (게시물 준비)
async function createThreadsContainer(text) {
    console.log('📝 1단계: Threads 게시물 컨테이너 생성 중...');

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads`,
            {
                media_type: 'TEXT',
                text: text,
                access_token: ACCESS_TOKEN
            }
        );

        const containerId = response.data.id;
        console.log(`✅ 컨테이너 생성 완료! ID: ${containerId}`);
        return containerId;

    } catch (error) {
        console.error('❌ 컨테이너 생성 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 2단계: 게시물 발행
async function publishThreadsPost(containerId) {
    console.log('📤 2단계: Threads 게시물 발행 중...');

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads_publish`,
            {
                creation_id: containerId,
                access_token: ACCESS_TOKEN
            }
        );

        const postId = response.data.id;
        console.log(`✅ 게시물 발행 완료! Post ID: ${postId}`);
        return postId;

    } catch (error) {
        console.error('❌ 게시물 발행 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 메인 함수
async function main() {
    console.log('🚀 Threads API 테스트 시작\n');
    console.log('='.repeat(50));

    // 환경 변수 검증
    validateEnv();

    // 테스트 메시지
    const testMessage = `안녕하세요! Threads API 테스트입니다 🎉\n\n현재 시간: ${new Date().toLocaleString('ko-KR')}`;

    console.log('📄 게시할 내용:');
    console.log(testMessage);
    console.log('');

    try {
        // 1단계: 컨테이너 생성
        const containerId = await createThreadsContainer(testMessage);

        // 잠시 대기 (API 처리 시간)
        console.log('⏳ 2초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2단계: 게시물 발행
        const postId = await publishThreadsPost(containerId);

        console.log('');
        console.log('='.repeat(50));
        console.log('✅ 모든 작업 완료!');
        console.log(`📱 Threads 앱에서 확인해보세요!`);
        console.log('='.repeat(50));

    } catch (error) {
        console.error('');
        console.error('='.repeat(50));
        console.error('❌ 오류가 발생했습니다');
        console.error('상세 내용:', error.message);
        console.error('='.repeat(50));
        console.error('');
        console.error('💡 문제 해결 방법:');
        console.error('1. ACCESS_TOKEN이 올바른지 확인');
        console.error('2. THREADS_USER_ID가 올바른지 확인');
        console.error('3. 토큰이 만료되지 않았는지 확인');
        console.error('4. META_DEVELOPER_SETUP.md 문서 참고');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { createThreadsContainer, publishThreadsPost };

/**
 * Threads API 이미지 업로드 테스트 스크립트
 * URL 또는 로컬 파일로 이미지를 포함한 게시물을 올립니다
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 환경 변수
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v18.0';

const BASE_URL = `https://graph.threads.net/${GRAPH_API_VERSION}`;

// 환경 변수 검증
function validateEnv() {
    if (!ACCESS_TOKEN || ACCESS_TOKEN === 'your_access_token_here') {
        console.error('❌ ERROR: ACCESS_TOKEN이 설정되지 않았습니다.');
        process.exit(1);
    }

    if (!THREADS_USER_ID || THREADS_USER_ID === 'your_user_id_here') {
        console.error('❌ ERROR: THREADS_USER_ID가 설정되지 않았습니다.');
        process.exit(1);
    }

    console.log('✅ 환경 변수 확인 완료\n');
}

// 이미지 URL로 컨테이너 생성
async function createImageContainer(imageUrl, caption) {
    console.log('🖼️  1단계: 이미지 컨테이너 생성 중...');
    console.log(`📷 이미지 URL: ${imageUrl}`);

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads`,
            {
                media_type: 'IMAGE',
                image_url: imageUrl,
                text: caption,
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

// 컨테이너 상태 확인
async function checkContainerStatus(containerId) {
    console.log('🔍 컨테이너 상태 확인 중...');

    try {
        const response = await axios.get(
            `${BASE_URL}/${containerId}`,
            {
                params: {
                    fields: 'status,error_message',
                    access_token: ACCESS_TOKEN
                }
            }
        );

        console.log(`📊 상태: ${response.data.status}`);
        return response.data;

    } catch (error) {
        console.error('❌ 상태 확인 실패:', error.response?.data || error.message);
        return null;
    }
}

// 게시물 발행
async function publishPost(containerId) {
    console.log('📤 2단계: 게시물 발행 중...');

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
    console.log('🚀 Threads 이미지 업로드 테스트 시작\n');
    console.log('='.repeat(50));

    validateEnv();

    // 명령줄 인자로 이미지 URL과 캡션 받기
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('📌 사용법:');
        console.log('  node upload-image.js <이미지_URL> [캡션]');
        console.log('');
        console.log('예시:');
        console.log('  node upload-image.js https://example.com/image.jpg "안녕하세요!"');
        console.log('');
        console.log('💡 테스트용 무료 이미지 URL:');
        console.log('  https://picsum.photos/800/600');
        console.log('');
        process.exit(0);
    }

    const imageUrl = args[0];
    const caption = args[1] || '이미지 테스트 게시물';

    console.log('📝 게시할 내용:');
    console.log(`  이미지: ${imageUrl}`);
    console.log(`  캡션: ${caption}`);
    console.log('');

    try {
        // 1단계: 이미지 컨테이너 생성
        const containerId = await createImageContainer(imageUrl, caption);

        // 컨테이너 처리 대기
        console.log('⏳ 이미지 처리 중... (최대 30초)');

        let status = null;
        let attempts = 0;
        const maxAttempts = 6;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
            status = await checkContainerStatus(containerId);

            if (status && status.status === 'FINISHED') {
                console.log('✅ 이미지 처리 완료!');
                break;
            } else if (status && status.status === 'ERROR') {
                console.error('❌ 이미지 처리 실패:', status.error_message);
                throw new Error(status.error_message);
            }

            attempts++;
            console.log(`⏳ 대기 중... (${attempts}/${maxAttempts})`);
        }

        if (!status || status.status !== 'FINISHED') {
            console.log('⚠️  상태 확인 없이 발행 시도...');
        }

        // 2단계: 게시물 발행
        const postId = await publishPost(containerId);

        console.log('');
        console.log('='.repeat(50));
        console.log('✅ 이미지 업로드 완료!');
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
        console.error('1. 이미지 URL이 공개적으로 접근 가능한지 확인');
        console.error('2. 이미지 형식이 지원되는지 확인 (JPG, PNG)');
        console.error('3. 이미지 크기가 적절한지 확인 (최대 8MB)');
        console.error('4. ACCESS_TOKEN과 THREADS_USER_ID 확인');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { createImageContainer, publishPost };

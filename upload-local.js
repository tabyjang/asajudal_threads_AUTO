/**
 * Threads API 로컬 이미지 업로드 스크립트
 * 1. 로컬 파일을 임시 이미지 서버(Catbox)에 업로드하여 URL을 얻습니다.
 * 2. 그 URL을 사용하여 Threads에 게시물을 올립니다.
 */

require('dotenv').config({ override: true });
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// 환경 변수
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v1.0';

const BASE_URL = `https://graph.threads.net/${GRAPH_API_VERSION}`;

// 1. 임시 호스팅에 이미지 업로드 (URL 획득용)
async function uploadToTempHost(filePath) {
    console.log('📤 1단계: 이미지를 인터넷 서버로 전송 중...');

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('userhash', ''); // 익명 업로드
    formData.append('fileToUpload', fs.createReadStream(filePath));

    try {
        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: formData.getHeaders()
        });

        const imageUrl = response.data;
        console.log(`✅ 이미지 변환 성공: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error('❌ 이미지 호스팅 업로드 실패:', error.message);
        throw new Error('로컬 이미지를 URL로 변환하는데 실패했습니다.');
    }
}

// 2. Threads 컨테이너 생성
async function createImageContainer(imageUrl, caption) {
    console.log('🖼️  2단계: Threads에 이미지 등록 중...');

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
        console.error('❌ Threads 컨테이너 생성 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 3. 컨테이너 상태 확인
async function checkContainerStatus(containerId) {
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
        return response.data;
    } catch (error) {
        return null;
    }
}

// 4. 게시물 발행
async function publishPost(containerId) {
    console.log('🚀 3단계: 최종 발행 중...');

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
        console.error('❌ 발행 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 메인 실행
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('사용법: node upload-local.js <파일경로> [캡션]');
        process.exit(1);
    }

    const localPath = args[0];
    const caption = args[1] || '로컬 이미지 업로드 테스트';

    if (!fs.existsSync(localPath)) {
        console.error(`❌ 파일을 찾을 수 없습니다: ${localPath}`);
        process.exit(1);
    }

    try {
        // 1. URL 변환
        const publicUrl = await uploadToTempHost(localPath);

        // 2. 컨테이너 생성
        const containerId = await createImageContainer(publicUrl, caption);

        // 3. 처리 대기
        console.log('⏳ 메타 서버가 이미지를 처리하는 중... (약 10-20초)');
        let attempts = 0;
        while (attempts < 10) {
            await new Promise(r => setTimeout(r, 3000));
            const status = await checkContainerStatus(containerId);

            if (status && status.status === 'FINISHED') break;
            if (status && status.status === 'ERROR') {
                throw new Error(`이미지 처리 오류: ${status.error_message}`);
            }
            process.stdout.write('.');
            attempts++;
        }
        console.log('');

        // 4. 발행
        await publishPost(containerId);

        console.log('\n🎉 모든 작업이 완료되었습니다! 앱에서 확인해보세요.');

    } catch (error) {
        console.error('\n❌ 실패:', error.message);
    }
}

main();

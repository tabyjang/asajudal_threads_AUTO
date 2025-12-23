/**
 * Threads API 공통 함수 라이브러리
 * 모든 스크립트에서 재사용 가능
 */

const axios = require('axios');

class ThreadsAPI {
    constructor(accessToken, userId, apiVersion = 'v18.0') {
        this.accessToken = accessToken;
        this.userId = userId;
        this.apiVersion = apiVersion;
        this.baseUrl = `https://graph.threads.net/${apiVersion}`;
    }

    /**
     * 환경 변수 검증
     */
    validate() {
        if (!this.accessToken || this.accessToken === 'your_access_token_here') {
            throw new Error('❌ ACCESS_TOKEN이 설정되지 않았습니다. .env 파일을 확인하세요.');
        }

        if (!this.userId || this.userId === 'your_user_id_here') {
            throw new Error('❌ THREADS_USER_ID가 설정되지 않았습니다. .env 파일을 확인하세요.');
        }

        console.log('✅ Threads API 인증 완료');
        console.log(`📱 User ID: ${this.userId}`);
        console.log(`🔑 Token: ${this.accessToken.substring(0, 20)}...`);
        return true;
    }

    /**
     * 텍스트 게시물 컨테이너 생성
     */
    async createTextContainer(text) {
        console.log('📝 텍스트 컨테이너 생성 중...');

        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.userId}/threads`,
                {
                    media_type: 'TEXT',
                    text: text,
                    access_token: this.accessToken
                }
            );

            const containerId = response.data.id;
            console.log(`✅ 컨테이너 생성: ${containerId}`);
            return containerId;

        } catch (error) {
            console.error('❌ 텍스트 컨테이너 생성 실패:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * 이미지 게시물 컨테이너 생성
     */
    async createImageContainer(imageUrl, text) {
        console.log('🖼️  이미지 컨테이너 생성 중...');

        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.userId}/threads`,
                {
                    media_type: 'IMAGE',
                    image_url: imageUrl,
                    text: text,
                    access_token: this.accessToken
                }
            );

            const containerId = response.data.id;
            console.log(`✅ 이미지 컨테이너 생성: ${containerId}`);
            return containerId;

        } catch (error) {
            console.error('❌ 이미지 컨테이너 생성 실패:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * 컨테이너 상태 확인
     */
    async checkContainerStatus(containerId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${containerId}`,
                {
                    params: {
                        fields: 'status,error_message',
                        access_token: this.accessToken
                    }
                }
            );

            return response.data;

        } catch (error) {
            console.error('컨테이너 상태 확인 실패:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * 게시물 발행
     */
    async publish(containerId) {
        console.log('📤 게시물 발행 중...');

        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.userId}/threads_publish`,
                {
                    creation_id: containerId,
                    access_token: this.accessToken
                }
            );

            const postId = response.data.id;
            console.log(`✅ 게시 완료! Post ID: ${postId}`);
            return postId;

        } catch (error) {
            console.error('❌ 게시물 발행 실패:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * 완전한 게시 프로세스 (컨테이너 생성 + 대기 + 발행)
     */
    async post(text, imageUrl = null, waitSeconds = 5) {
        console.log('\n' + '='.repeat(60));
        console.log('📢 게시 시작');
        console.log('='.repeat(60));

        try {
            // 1. 컨테이너 생성
            let containerId;
            if (imageUrl) {
                containerId = await this.createImageContainer(imageUrl, text);
            } else {
                containerId = await this.createTextContainer(text);
            }

            // 2. 대기 (API 처리 시간)
            console.log(`⏳ ${waitSeconds}초 대기 중...`);
            await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));

            // 3. 발행
            const postId = await this.publish(containerId);

            console.log('='.repeat(60));
            console.log('✅ 게시 완료!');
            console.log('='.repeat(60));

            return { containerId, postId };

        } catch (error) {
            console.error('\n❌ 게시 실패:', error.message);
            throw error;
        }
    }

    /**
     * 이미지 처리 완료 대기 (재시도 로직)
     */
    async waitForImageProcessing(containerId, maxRetries = 6, intervalSeconds = 5) {
        console.log('⏳ 이미지 처리 대기 중...');

        for (let i = 0; i < maxRetries; i++) {
            try {
                const status = await this.checkContainerStatus(containerId);

                if (status.status === 'FINISHED') {
                    console.log('✅ 이미지 처리 완료');
                    return true;
                } else if (status.status === 'ERROR') {
                    throw new Error(`이미지 처리 실패: ${status.error_message}`);
                }

                console.log(`대기 중... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));

            } catch (error) {
                if (i === maxRetries - 1) throw error;
            }
        }

        throw new Error('이미지 처리 시간 초과');
    }
}

module.exports = ThreadsAPI;

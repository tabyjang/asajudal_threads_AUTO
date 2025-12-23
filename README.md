# Threads 자동 업로드 프로그램

Threads API를 사용하여 게시물을 자동으로 업로드하는 프로그램입니다.

## 프로젝트 구조

```
auto_program_with_claude/
├── META_DEVELOPER_SETUP.md   # Meta Developer API 발급 가이드
├── test-threads.js            # 텍스트 게시 테스트
├── upload-image.js            # 이미지 업로드 테스트
├── package.json               # 프로젝트 설정
├── .env.example               # 환경 변수 예시
├── .env                       # 실제 환경 변수 (생성 필요)
└── README.md                  # 이 파일
```

---

## 빠른 시작 가이드

### 1단계: API 발급받기

**META_DEVELOPER_SETUP.md** 파일을 열어서 단계별로 따라하세요.

발급받아야 할 정보:
- `ACCESS_TOKEN`: Meta Developer에서 발급받는 토큰
- `THREADS_USER_ID`: 본인의 Threads 사용자 ID

### 2단계: 프로젝트 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성
copy .env.example .env

# 3. .env 파일을 열어서 발급받은 정보 입력
# ACCESS_TOKEN=여기에_발급받은_토큰_입력
# THREADS_USER_ID=여기에_사용자_ID_입력
```

### 3단계: 테스트 실행

#### 텍스트 게시 테스트

```bash
npm run test
```

또는

```bash
node test-threads.js
```

성공하면 Threads 앱에서 테스트 게시물을 확인할 수 있습니다!

#### 이미지 업로드 테스트

```bash
npm run upload

# 또는 직접 실행
node upload-image.js https://picsum.photos/800/600 "테스트 이미지입니다!"
```

---

## 상세 사용법

### 텍스트 게시하기

`test-threads.js` 파일을 수정하여 원하는 텍스트를 게시할 수 있습니다:

```javascript
// test-threads.js 파일에서 이 부분을 수정
const testMessage = `여기에 원하는 내용을 입력하세요!`;
```

### 이미지 업로드하기

```bash
node upload-image.js <이미지_URL> <캡션>
```

**예시:**
```bash
# 1. 랜덤 이미지 업로드
node upload-image.js https://picsum.photos/800/600 "안녕하세요!"

# 2. 특정 이미지 URL
node upload-image.js https://example.com/my-image.jpg "내 이미지"
```

**주의사항:**
- 이미지 URL은 공개적으로 접근 가능해야 합니다
- 지원 형식: JPG, PNG
- 최대 크기: 8MB

---

## 문제 해결

### "ACCESS_TOKEN이 설정되지 않았습니다"

`.env` 파일을 생성했는지 확인하세요:

```bash
copy .env.example .env
```

그리고 `.env` 파일을 열어서 실제 값을 입력하세요.

### "API 호출 실패"

1. ACCESS_TOKEN이 올바른지 확인
2. THREADS_USER_ID가 올바른지 확인
3. 토큰이 만료되지 않았는지 확인 (60일 후 만료)
4. META_DEVELOPER_SETUP.md의 권한 설정 확인

### "이미지 처리 실패"

1. 이미지 URL이 직접 접근 가능한지 확인 (브라우저에서 열어보기)
2. HTTPS URL인지 확인
3. 이미지 크기 확인 (너무 크면 실패)

---

## API 제한사항

- **Rate Limit**: 시간당 일정 요청 수 제한
- **이미지 크기**: 최대 8MB
- **비디오**: 지원하지만 추가 설정 필요
- **토큰 만료**: 60일마다 갱신 필요

---

## 다음 단계

이 테스트가 성공했다면:

1. **웹훅 서버 추가**: 외부에서 API 호출 받기
2. **n8n 워크플로우**: 노코드로 자동화 구축
3. **스케줄러**: 정해진 시간에 자동 게시
4. **이미지 처리**: 리사이징, 필터 적용 등

자세한 내용은 프로젝트 이슈나 문의로 알려주세요!

---

## 보안 주의사항

- `.env` 파일을 절대 GitHub에 올리지 마세요
- ACCESS_TOKEN을 다른 사람과 공유하지 마세요
- 토큰이 유출되면 즉시 재발급하세요

---

## 라이선스

MIT

## 문의

문제가 있거나 질문이 있으면 이슈를 등록해주세요.

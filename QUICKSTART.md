# 스레드 자동화 빠른 시작 가이드

## 목차
1. [초기 설정](#초기-설정)
2. [기본 사용법](#기본-사용법)
3. [주요 기능](#주요-기능)
4. [설정 변경](#설정-변경)
5. [문제 해결](#문제-해결)

---

## 초기 설정

### 1단계: 환경 설정 파일 생성

`.env` 파일을 만들고 다음 내용을 입력하세요:

```bash
ACCESS_TOKEN=your_access_token_here
THREADS_USER_ID=your_user_id_here
GRAPH_API_VERSION=v18.0
```

> 💡 **토큰 발급 방법**: `docs/META_DEVELOPER_SETUP.md` 참고

### 2단계: 패키지 설치

```bash
npm install
```

### 3단계: 스케줄 파일 준비

`data/content_schedule.csv` 파일에 게시할 내용을 작성하세요.

**CSV 형식:**
```csv
date,time,content_type,text,image_url,hashtags
2025-12-24,07:00,fortune,"오늘의 운세입니다",,"#운세 #오늘의운세"
2025-12-24,19:00,quiz,"퀴즈: 당신의 별자리는?",https://example.com/image.jpg,"#퀴즈"
```

---

## 기본 사용법

### 가장 간단한 방법 - 한 줄로 모든 것을!

```bash
# 자동 스케줄러 시작 (가장 많이 사용)
npm start
```

### 또는 직접 실행

```bash
node start.js
```

---

## 주요 기능

### 1️⃣ 자동 스케줄러 (메인 기능)

CSV 파일의 스케줄에 맞춰 자동으로 게시합니다.

```bash
npm start
# 또는
node start.js
```

**작동 방식:**
- 5분마다 스케줄 확인
- 예정 시간 ±5분 내에 자동 게시
- 에러 발생 시 자동 재시작
- Ctrl+C로 종료

---

### 2️⃣ 테스트 게시

시스템이 정상 작동하는지 확인합니다.

```bash
npm test
# 또는
node start.js test
```

---

### 3️⃣ 즉시 게시

스케줄을 기다리지 않고 바로 게시합니다.

```bash
# 첫 번째 스케줄 즉시 게시
npm run now
# 또는
node start.js now

# 특정 번호 스케줄 게시 (예: 3번째)
node start.js now 3
```

---

### 4️⃣ 상태 확인

현재 게시 현황과 다음 예정을 확인합니다.

```bash
npm run status
# 또는
node start.js status
```

**출력 예시:**
```
총 게시물: 15개
오늘 게시: 3개

마지막 게시:
  시간: 2025-12-24T07:00:00.000Z
  타입: fortune
  ID: 123456789

다음 예정 스케줄:
  1. 2025-12-24 13:00 - tip
  2. 2025-12-24 19:00 - quiz
```

---

### 5️⃣ 설정 확인

현재 적용된 설정을 확인합니다.

```bash
npm run config
# 또는
node start.js config
```

---

### 6️⃣ 대량 업로드

여러 게시물을 일정 간격으로 올립니다.

```bash
npm run batch
# 또는
node start.js batch
```

**사용 예:**
- `data/upload_list.csv` 파일 준비
- 기본 60분 간격으로 10개까지 게시
- 간격과 개수는 `config/config.js`에서 변경 가능

---

## 설정 변경

### 모든 설정을 한 곳에서!

`config/config.js` 파일을 열어서 원하는 값을 변경하세요.

#### 주요 설정 항목:

```javascript
// 스케줄러 설정
scheduler: {
    checkInterval: 5,        // 확인 간격 (분) → 원하는 값으로 변경
    timeWindow: 5,           // 게시 허용 범위 (±분)
    waitBetweenRequests: 5,  // 요청 사이 대기 (초)
    waitBetweenPosts: 10     // 게시 사이 대기 (초)
},

// 대량 업로드 설정
batch: {
    intervalMinutes: 60,     // 게시 간격 (분) → 원하는 값으로 변경
    maxPosts: 10             // 최대 게시 개수 → 원하는 값으로 변경
},

// 에러 처리 설정
error: {
    autoRestart: true,       // 자동 재시작 여부
    restartDelay: 30,        // 재시작 대기 시간 (초)
    maxRestarts: 10          // 최대 재시작 횟수
}
```

### 파일 경로 변경

다른 CSV 파일을 사용하고 싶다면:

```javascript
paths: {
    scheduleCSV: path.join(__dirname, '..', 'data', 'my_schedule.csv'),
    // ...
}
```

---

## 파일 구조

```
asajudal_threads_AUTO/
│
├── start.js                 ⭐ 메인 실행 파일 (여기서 모든 것을 제어!)
│
├── config/
│   └── config.js           ⚙️  설정 파일 (여기서 설정 변경!)
│
├── data/
│   ├── content_schedule.csv   📅 메인 스케줄
│   ├── upload_list.csv        📦 대량 업로드용
│   └── posted_log.json        📝 게시 기록
│
├── lib/                    📚 공통 라이브러리 (건드릴 필요 없음)
│   ├── threads-api.js
│   ├── csv-utils.js
│   └── post-logger.js
│
├── scripts/                🔧 구버전 스크립트 (호환성용)
│
└── docs/                   📖 상세 문서
    ├── META_DEVELOPER_SETUP.md
    ├── OPERATION_GUIDE.md
    └── ...
```

---

## 문제 해결

### ❌ "ACCESS_TOKEN이 설정되지 않았습니다"

**해결:** `.env` 파일을 생성하고 토큰을 입력하세요.

```bash
# .env 파일 내용
ACCESS_TOKEN=실제_토큰_값
THREADS_USER_ID=실제_유저_ID
```

---

### ❌ "CSV 파일을 찾을 수 없습니다"

**해결:** `data/` 폴더에 CSV 파일이 있는지 확인하세요.

```bash
# 파일 확인
ls data/

# 없다면 예제 파일 복사
cp data/test_schedule.csv data/content_schedule.csv
```

---

### ❌ 게시가 안 됩니다

**체크리스트:**
1. ✅ `.env` 파일이 제대로 설정되었는지 확인
2. ✅ 토큰이 만료되지 않았는지 확인
3. ✅ CSV 파일의 날짜/시간 형식이 올바른지 확인
4. ✅ 테스트 게시를 해보기: `npm test`

```bash
# 설정 확인
node start.js config

# 상태 확인
node start.js status

# 테스트 게시
node start.js test
```

---

### ❌ 스케줄러가 자꾸 멈춥니다

**해결:** 자동 재시작이 활성화되어 있지만, 계속 문제가 생긴다면:

1. `config/config.js`에서 에러 처리 설정 확인
2. 로그를 확인해서 어떤 에러인지 파악
3. CSV 파일의 내용이 올바른지 확인 (특히 이미지 URL)

---

### 🔍 더 많은 도움이 필요하다면

- `docs/TROUBLESHOOTING.md` - 상세한 문제 해결 가이드
- `docs/OPERATION_GUIDE.md` - 운영 가이드
- GitHub Issues - 버그 리포트 및 질문

---

## 요약: 가장 자주 사용하는 명령어

```bash
# 1. 초기 설정
npm install

# 2. 스케줄러 시작 (메인 기능)
npm start

# 3. 상태 확인
npm run status

# 4. 즉시 게시 (급할 때)
npm run now

# 5. 테스트 (시스템 체크)
npm test
```

**이게 전부입니다! 🎉**

더 복잡한 기능이 필요하면 `docs/` 폴더의 문서를 참고하세요.

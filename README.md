# 🧊 Zero Chef

냉장고·식품 사진 한 장으로 재료를 자동 인식하고, 남은 재료로 만들 수 있는 레시피를 AI가 추천해주는 모바일 웹 앱입니다.

---

## 주요 기능

### 1. AI 재료 인식
- 냉장고 내부 또는 식품 포장 사진을 촬영하거나 앨범에서 선택
- AI Vision 모델이 브랜드명까지 포함해 재료를 자동 인식 (예: 신라면, 진라면, 너구리)
- 인식된 재료는 냉장고 구역별(상단·중단·하단 선반, 채소 칸, 도어, 냉동칸, 상온 보관)로 자동 분류
- 재료마다 bbox(위치 좌표)를 추출해 원본 사진에서 해당 재료를 크롭·확대해서 확인 가능

### 2. 구역별 재료 관리
- **냉장실 / 냉동실**: 재료가 있을 때만 패널 표시 (비어 있으면 자동 숨김)
- **상온 보관**: 라면·과자·통조림 등 냉장 불필요 식품 자동 분류
- **커스텀 장소**: 김치냉장고, 베란다 냉장고, 팬트리, 와인셀러, 상온보관, 기타 등 9가지 프리셋 + 직접 입력
  - 장소별 사진 촬영으로 재료 추가 가능
  - 장소 삭제 시 해당 장소의 재료도 함께 삭제
- 재료 개별 삭제, 구역 전체 비우기, 전체 초기화 지원

### 3. 재료 상세 보기 및 편집
- 재료 탭 시 상세 시트 표시
  - 왼쪽: MealDB 식품 이미지 (없으면 이모지 fallback)
  - 오른쪽: 원본 사진에서 해당 재료를 bbox 기준으로 크롭·확대
- 이름, 수량, 소비기한 직접 편집 가능
- 소비기한 D-day / D-1 / 만료 알림 배지 표시
- AI 인식률(confidence) 표시
- 해당 재료로 바로 레시피 검색 가능

### 4. AI 레시피 추천
- 보유 재료 기반으로 레시피 6개 자동 추천
- 조리 시간, 난이도, 재료 일치율 표시
- 부족한 재료 / 사용 가능한 재료 구분 표시
- 추가하면 더 맛있어지는 저렴한 재료 팁 제공
- 특정 재료로 필터링해 레시피 검색 가능
- 소비기한 임박 재료 상단 배너 표시

### 5. 멀티 모델 지원 (OpenRouter)
| 모델 | 제공사 | Vision | 특징 |
|------|--------|--------|------|
| GPT-4o | OpenAI | O | 추천 |
| Gemini 2.5 Pro | Google | O | 강력 |
| Gemini 2.5 Flash | Google | O | 빠름 |
| Claude Sonnet 4.5 | Anthropic | O | - |
| Claude Haiku 4.5 | Anthropic | O | 저렴 |
| Llama 3.1 70B | Meta | X | 무료 |

Vision 미지원 모델 선택 시 이미지 분석은 GPT-4o로 자동 fallback.

### 6. 보류함 (불확실 재료 관리)
- AI 인식률 50% 미만인 재료는 `uncertain` 상태로 분류
- 재료를 탭하면 이름을 직접 입력하거나 확정 / 보류함으로 이동 선택
- 보류함 탭에서 한꺼번에 처리 가능

---

## 기술 스택

| 분류 | 사용 기술 |
|------|----------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| 애니메이션 | Framer Motion |
| AI API | OpenRouter (OpenAI SDK 호환) |
| 상태 관리 | React useState / localStorage 영속화 |
| 이미지 처리 | Canvas API (HEIC 포함 모든 포맷 → JPEG 변환, 최대 1600px 리사이즈) |
| 아이콘 | Lucide React |

---

## 폴더 구조

```
zerochef/
├── app/
│   ├── actions/
│   │   └── fridge.ts          # Server Actions (이미지 분석, 레시피 추천)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # 메인 페이지 (탭 라우팅, 전역 상태)
├── components/
│   ├── fridge/
│   │   ├── AddLocationModal.tsx   # 새 장소 추가 모달
│   │   ├── FridgeView.tsx         # 냉장고 뷰 (냉장실·냉동실·커스텀 장소)
│   │   └── IngredientItem.tsx     # 재료 칩 컴포넌트
│   ├── ingredients/
│   │   ├── AddIngredientModal.tsx     # 수동 재료 추가 모달
│   │   ├── HoldingArea.tsx            # 보류함 탭
│   │   ├── IngredientDetailSheet.tsx  # 재료 상세 Bottom Sheet
│   │   └── UncertainItemPopup.tsx     # 불확실 재료 팝업
│   ├── recipes/
│   │   ├── ExpiringBanner.tsx     # 소비기한 임박 배너
│   │   ├── FilterBar.tsx          # 레시피 필터 바
│   │   ├── RecipeCard.tsx         # 레시피 카드
│   │   └── RecipeList.tsx         # 레시피 목록 (AI 호출 포함)
│   ├── settings/
│   │   └── SettingsSheet.tsx      # 설정 시트 (API 키, 모델 선택)
│   ├── ui/                        # shadcn/ui 기본 컴포넌트
│   └── upload/
│       └── PhotoUpload.tsx        # 최초 사진 업로드 화면
├── hooks/
│   ├── useApiKeys.ts          # API 키 관리 (localStorage)
│   ├── useCustomLocations.ts  # 커스텀 장소 관리 (localStorage)
│   ├── useIngredients.ts      # 재료 상태 관리 (localStorage)
│   └── useModel.ts            # 선택 모델 관리 (localStorage)
└── lib/
    ├── models.ts              # 지원 모델 목록 및 메타데이터
    ├── types.ts               # 공통 타입 정의
    └── utils.ts               # 유틸 함수 (소비기한 계산 등)
```

---

## 실행 방법

### 요구 사항
- Node.js 18 이상
- [OpenRouter](https://openrouter.ai) API 키

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

### 환경 변수 (선택)

서버에 API 키를 미리 설정하려면 `.env.local` 파일 생성:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
```

환경 변수가 없으면 앱 내 설정(⚙️)에서 직접 입력할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 데이터 저장

모든 데이터는 **브라우저 localStorage**에 저장됩니다. 서버에는 아무것도 저장되지 않습니다.

| 키 | 내용 |
|----|------|
| `fridge_ingredients_v1` | 재료 목록 |
| `custom_locations_v1` | 커스텀 장소 목록 |
| `api_keys_v1` | API 키 목록 |
| `selected_model` | 선택된 AI 모델 |

---

## 주요 설계 결정

- **Server Actions으로 API 키 보호**: OpenRouter API 호출은 `app/actions/fridge.ts`에서 서버 측에서만 실행되어 클라이언트에 키가 노출되지 않습니다.
- **Canvas 이미지 전처리**: HEIC 등 모든 포맷을 JPEG로 변환하고 최대 1600px로 리사이즈한 뒤 API에 전달해 전송 크기와 비용을 최소화합니다.
- **bbox 기반 재료 크롭**: AI가 반환한 `[left%, top%, width%, height%]` 좌표로 원본 사진에서 해당 재료 영역을 CSS transform으로 확대해 별도 서버 크롭 없이 표시합니다.
- **모바일 최적화**: iOS에서 `display:none` 방식의 input은 카메라를 열지 못하기 때문에 `position:absolute` + `width:0` 방식으로 input을 숨깁니다.

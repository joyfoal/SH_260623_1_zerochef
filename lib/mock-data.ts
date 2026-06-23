import { Ingredient, Recipe } from './types'

const today = new Date()
const d = (days: number) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + days)
  return dt.toISOString()
}

export const MOCK_INGREDIENTS: Ingredient[] = [
  // Top shelf
  { id: '1', name: '우유', emoji: '🥛', section: 'top-shelf', confidence: 0.97, expiryDate: d(1), quantity: '500ml', status: 'confirmed' },
  { id: '2', name: '요거트', emoji: '🫙', section: 'top-shelf', confidence: 0.91, expiryDate: d(1), quantity: '2개', status: 'confirmed' },
  { id: '3', name: '두부', emoji: '⬜', section: 'top-shelf', confidence: 0.88, expiryDate: d(3), quantity: '1모', status: 'confirmed' },
  { id: '4', name: '치즈', emoji: '🧀', section: 'top-shelf', confidence: 0.93, expiryDate: d(7), quantity: '4장', status: 'confirmed' },

  // Middle shelf
  { id: '5', name: '계란', emoji: '🥚', section: 'middle-shelf', confidence: 0.99, expiryDate: d(14), quantity: '6개', status: 'confirmed' },
  { id: '6', name: '베이컨', emoji: '🥓', section: 'middle-shelf', confidence: 0.95, expiryDate: d(2), quantity: '5줄', status: 'confirmed' },
  { id: '7', name: '김치', emoji: '🌶️', section: 'middle-shelf', confidence: 0.98, expiryDate: d(30), quantity: '1통', status: 'confirmed' },
  { id: '8', name: '돼지고기', emoji: '🥩', section: 'middle-shelf', confidence: 0.82, expiryDate: d(1), quantity: '200g', status: 'confirmed' },

  // Bottom shelf
  { id: '9', name: '당근', emoji: '🥕', section: 'bottom-shelf', confidence: 0.96, expiryDate: d(5), quantity: '2개', status: 'confirmed' },
  { id: '10', name: '양파', emoji: '🧅', section: 'bottom-shelf', confidence: 0.94, expiryDate: d(10), quantity: '3개', status: 'confirmed' },
  { id: '11', name: '파', emoji: '🌿', section: 'bottom-shelf', confidence: 0.79, expiryDate: d(3), quantity: '1묶음', status: 'confirmed' },

  // Crisper / Veggie
  { id: '12', name: '시금치', emoji: '🥬', section: 'crisper', confidence: 0.91, expiryDate: d(1), quantity: '1봉', status: 'confirmed' },
  { id: '13', name: '버섯', emoji: '🍄', section: 'crisper', confidence: 0.87, expiryDate: d(2), quantity: '100g', status: 'confirmed' },
  { id: '14', name: '애호박', emoji: '🫑', section: 'crisper', confidence: 0.85, expiryDate: d(4), quantity: '1개', status: 'confirmed' },

  // Door upper
  { id: '15', name: '케첩', emoji: '🍅', section: 'door-upper', confidence: 0.96, expiryDate: d(90), quantity: '1개', status: 'confirmed', isBasicSeasoning: true },
  { id: '16', name: '마요네즈', emoji: '🫙', section: 'door-upper', confidence: 0.94, expiryDate: d(60), quantity: '1개', status: 'confirmed', isBasicSeasoning: true },
  { id: '17', name: '간장', emoji: '🍶', section: 'door-upper', confidence: 0.99, expiryDate: d(365), quantity: '1병', status: 'confirmed', isBasicSeasoning: true },

  // Door lower
  { id: '18', name: '오렌지 주스', emoji: '🍊', section: 'door-lower', confidence: 0.93, expiryDate: d(3), quantity: '1L', status: 'confirmed' },
  { id: '19', name: '맥주', emoji: '🍺', section: 'door-lower', confidence: 0.98, expiryDate: d(180), quantity: '3캔', status: 'confirmed' },

  // Freezer
  { id: '20', name: '냉동 만두', emoji: '🥟', section: 'freezer', confidence: 0.97, expiryDate: d(90), quantity: '20개', status: 'confirmed' },
  { id: '21', name: '냉동 밥', emoji: '🍚', section: 'freezer', confidence: 0.92, expiryDate: d(30), quantity: '2인분', status: 'confirmed' },

  // Uncertain items (auto zoom-in popup)
  { id: '22', name: '검은 봉지 속 재료', emoji: '🫙', section: 'middle-shelf', confidence: 0.41, status: 'uncertain' },
  { id: '23', name: '불명확한 용기', emoji: '📦', section: 'bottom-shelf', confidence: 0.38, status: 'uncertain' },
  { id: '24', name: '알 수 없는 소스', emoji: '🍶', section: 'door-upper', confidence: 0.35, status: 'uncertain' },
]

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: '김치볶음밥',
    emoji: '🍳',
    cookTime: 7,
    difficulty: 'easy',
    matchRate: 95,
    availableIngredients: ['김치', '계란', '냉동 밥', '파', '간장'],
    missingIngredients: ['참기름'],
    steps: [
      '팬에 기름을 두르고 김치를 볶는다',
      '냉동 밥을 넣고 함께 볶는다',
      '간장 1/2스푼으로 간을 맞춘다',
      '계란 프라이를 올리고 파를 뿌린다',
    ],
    tags: ['볶음밥', '한식', '야식'],
    calories: 480,
  },
  {
    id: 'r2',
    name: '계란 스크램블 + 베이컨',
    emoji: '🍳',
    cookTime: 5,
    difficulty: 'easy',
    matchRate: 100,
    availableIngredients: ['계란', '베이컨', '치즈'],
    missingIngredients: [],
    steps: [
      '베이컨을 팬에 바삭하게 굽는다',
      '계란 2개를 풀어 소금으로 간한다',
      '약불에서 부드럽게 스크램블한다',
      '치즈를 올리고 잔열로 녹인다',
    ],
    tags: ['브런치', '양식', '5분'],
    calories: 320,
  },
  {
    id: 'r3',
    name: '시금치 된장국',
    emoji: '🍲',
    cookTime: 8,
    difficulty: 'easy',
    matchRate: 88,
    availableIngredients: ['시금치', '두부', '파'],
    missingIngredients: ['된장', '멸치'],
    steps: [
      '물 500ml에 된장을 풀어 끓인다',
      '두부를 큼직하게 썰어 넣는다',
      '시금치를 넣고 1분간 더 끓인다',
      '파를 송송 썰어 올린다',
    ],
    tags: ['국', '한식', '건강식'],
    calories: 120,
  },
  {
    id: 'r4',
    name: '버섯 당근 볶음',
    emoji: '🥘',
    cookTime: 6,
    difficulty: 'easy',
    matchRate: 100,
    availableIngredients: ['버섯', '당근', '양파', '간장'],
    missingIngredients: [],
    steps: [
      '버섯과 당근을 먹기 좋게 썬다',
      '팬에 기름을 두르고 양파부터 볶는다',
      '당근과 버섯을 넣고 볶는다',
      '간장 1스푼으로 간을 맞춘다',
    ],
    tags: ['볶음', '한식', '채식'],
    calories: 180,
  },
  {
    id: 'r5',
    name: '두부 김치찌개',
    emoji: '🫕',
    cookTime: 10,
    difficulty: 'easy',
    matchRate: 90,
    availableIngredients: ['두부', '김치', '돼지고기', '파', '간장'],
    missingIngredients: ['고춧가루'],
    steps: [
      '돼지고기를 팬에 볶아 기름을 낸다',
      '김치를 넣고 함께 볶는다',
      '물 300ml를 붓고 끓인다',
      '두부를 넣고 5분간 끓인다',
      '파로 마무리한다',
    ],
    tags: ['찌개', '한식', '얼큰'],
    calories: 350,
  },
  {
    id: 'r6',
    name: '호박 베이컨 파스타',
    emoji: '🍝',
    cookTime: 10,
    difficulty: 'easy',
    matchRate: 72,
    availableIngredients: ['애호박', '베이컨', '계란', '치즈'],
    missingIngredients: ['파스타면', '마늘'],
    steps: [
      '파스타를 삶는다',
      '베이컨을 볶아 기름을 낸다',
      '호박을 넣고 볶는다',
      '계란 + 치즈 소스를 만들어 섞는다',
    ],
    tags: ['파스타', '양식'],
    calories: 520,
  },
  {
    id: 'r7',
    name: '만두 국',
    emoji: '🥟',
    cookTime: 5,
    difficulty: 'easy',
    matchRate: 98,
    availableIngredients: ['냉동 만두', '계란', '파', '간장'],
    missingIngredients: ['멸치육수'],
    steps: [
      '물을 끓인다',
      '냉동 만두를 넣고 5분간 끓인다',
      '계란을 풀어 넣는다',
      '간장, 파로 간을 맞춘다',
    ],
    tags: ['국물', '한식', '5분', '간단'],
    calories: 280,
  },
  {
    id: 'r8',
    name: '시금치 계란 볶음',
    emoji: '🥚',
    cookTime: 5,
    difficulty: 'easy',
    matchRate: 100,
    availableIngredients: ['시금치', '계란', '마늘', '간장'],
    missingIngredients: [],
    steps: [
      '팬에 기름을 두르고 마늘을 볶는다',
      '시금치를 넣고 센 불에서 빠르게 볶는다',
      '계란을 넣고 스크램블한다',
      '간장으로 간을 맞춘다',
    ],
    tags: ['볶음', '한식', '5분', '채식'],
    calories: 150,
  },
]

export const COMMON_INGREDIENTS = [
  '고추장', '된장', '간장', '고춧가루', '설탕', '소금', '참기름', '식용유',
  '마늘', '생강', '파', '양파', '당근', '감자', '고구마',
  '계란', '두부', '김치', '버섯', '시금치', '배추', '무',
  '쇠고기', '돼지고기', '닭고기', '새우', '오징어',
  '우유', '치즈', '버터', '요거트',
  '쌀', '라면', '파스타', '밀가루', '빵',
  '토마토', '오이', '피망', '브로콜리', '애호박',
  '사과', '바나나', '귤', '포도',
]

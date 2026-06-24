'use server'

import OpenAI from 'openai'
import { Ingredient, Recipe } from '@/lib/types'
import { DEFAULT_MODEL_ID } from '@/lib/models'

function getClient(apiKey?: string) {
  const key = process.env.OPENROUTER_API_KEY || apiKey
  if (!key) throw new Error('API 키가 설정되지 않았습니다.')
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://zerochef.local',
      'X-Title': 'Zero Chef',
    },
  })
}

export async function getEnvKeyStatus(): Promise<{ configured: boolean }> {
  return { configured: !!process.env.OPENROUTER_API_KEY }
}

export async function analyzeFridgeImage(
  imageBase64: string,
  apiKey?: string,
  model?: string,
): Promise<Partial<Ingredient>[]> {
  const useModel = model || DEFAULT_MODEL_ID
  try {
    const openai = getClient(apiKey)
    const response = await openai.chat.completions.create({
      model: useModel,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: `이 사진에서 식재료/식품을 찾아 JSON 배열로 반환해주세요.

장소 판단 기준:
- 냉장고 내부 사진 → 냉장고 섹션(top-shelf/middle-shelf/bottom-shelf/crisper/door-upper/door-lower) 사용
- 냉동실/냉동식품 사진 → "freezer"
- 선반/식탁/바구니/봉투/상온 보관 식품(라면, 과자, 통조림, 건조식품 등) → "pantry"
- 냉장이 필요 없는 가공식품(라면류, 스낵류, 건면, 소스 등) → "pantry"

각 재료:
- name: 한국어 제품명 (포장에 보이는 브랜드명+제품명 그대로, 예: "신라면", "진라면", "너구리", "오뚜기 진라면 순한맛", "참치캔", "백설탕")
  여러 개가 한 사진에 있으면 각각 별도 항목으로 반환하세요.
- section: "top-shelf"|"middle-shelf"|"bottom-shelf"|"crisper"|"door-upper"|"door-lower"|"freezer"|"pantry"
- confidence: 0~1
- emoji: 적절한 이모지
- quantity: 대략적인 양 (선택)
- bbox: [left%, top%, width%, height%] 사진 내 재료 위치 (0~100 퍼센트값)

confidence 0.5 미만은 status: "uncertain", 이상은 status: "confirmed"
재료마다 bbox를 반드시 포함하세요.
JSON 배열만 반환:`,
            },
          ],
        },
      ],
    })

    const text  = response.choices[0]?.message?.content ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch (e) {
    console.error('Vision API error:', e)
    throw e
  }
  return []
}

export async function getRecipeRecommendations(
  ingredientNames: string[],
  apiKey?: string,
  targetIngredient?: string,
  model?: string,
): Promise<Partial<Recipe>[]> {
  const useModel = model || DEFAULT_MODEL_ID
  try {
    const openai = getClient(apiKey)
    const targetLine = targetIngredient
      ? `특히 "${targetIngredient}"를 주재료로 활용한 레시피를 우선 추천해주세요.\n`
      : ''

    const response = await openai.chat.completions.create({
      model: useModel,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `보유 재료: ${ingredientNames.join(', ')}
${targetLine}
기본 양념(소금, 설탕, 간장, 고추장, 된장, 참기름, 식용유, 마늘, 생강, 고춧가루)은 항상 있다고 가정.

위 재료로 만들 수 있는 레시피 6개를 JSON 배열로 반환해주세요.

각 레시피 필드:
- id: "r_숫자"
- name: 요리 이름
- emoji: 이모지
- cookTime: 분
- difficulty: "easy"|"medium"
- matchRate: 보유재료 일치율 0~100
- availableIngredients: 사용 가능한 재료 배열
- missingIngredients: 부족한 재료 배열 (기본양념 제외)
- steps: 조리 단계 배열 (3~5단계)
- tags: 태그 배열
- calories: 칼로리 (선택)
- additionalTips: 저렴하고 쉽게 구할 수 있는 재료 1~3가지를 추가하면 더 맛있어지는 팁 배열
  예: ["달걀 1개를 풀어 넣으면 더 부드러워요", "청양고추 1개 추가하면 칼칼해요"]

JSON 배열만 반환:`,
        },
      ],
    })

    const text  = response.choices[0]?.message?.content ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch (e) {
    console.error('Recipe API error:', e)
    throw e
  }
  return []
}

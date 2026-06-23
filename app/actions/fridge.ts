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
              text: `이 사진에서 식재료를 찾아 JSON 배열로 반환해주세요.

냉장고 내부 사진이면 냉장고 섹션(top-shelf, middle-shelf 등)으로 지정하세요.
냉장고가 아닌 사진(선반, 식탁, 바구니, 봉투 등)이면 section을 "middle-shelf"로 지정하세요.

각 재료:
- name: 한국어 이름
- section: "top-shelf"|"middle-shelf"|"bottom-shelf"|"crisper"|"door-upper"|"door-lower"|"freezer"
- confidence: 0~1
- emoji: 적절한 이모지
- quantity: 대략적인 양 (선택)

confidence 0.5 미만은 status: "uncertain", 이상은 status: "confirmed"
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

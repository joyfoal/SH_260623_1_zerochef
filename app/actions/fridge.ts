'use server'

import OpenAI from 'openai'
import { Ingredient, Recipe } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeFridgeImage(imageBase64: string): Promise<Partial<Ingredient>[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
              text: `이 냉장고 사진에서 식재료를 찾아 JSON 배열로 반환해주세요.
각 재료:
- name: 한국어 이름
- section: "top-shelf"|"middle-shelf"|"bottom-shelf"|"crisper"|"door-upper"|"door-lower"|"freezer"
- confidence: 0~1 (확실도)
- emoji: 적절한 이모지
- quantity: 대략적인 양 (선택)

confidence 0.5 미만은 status: "uncertain", 이상은 status: "confirmed"
JSON 배열만 반환:`,
            },
          ],
        },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch (e) {
    console.error('Vision API error:', e)
  }
  return []
}

export async function getRecipeRecommendations(ingredientNames: string[]): Promise<Partial<Recipe>[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `보유 재료: ${ingredientNames.join(', ')}

기본 양념(소금, 설탕, 간장, 고추장, 된장, 참기름, 식용유, 마늘, 생강, 고춧가루)은 항상 있다고 가정하고,
위 재료로 만들 수 있는 5~10분 레시피 5개를 JSON으로 반환해주세요.

각 레시피:
- id: "r_숫자"
- name: 요리 이름
- emoji: 이모지
- cookTime: 분 (5~10)
- difficulty: "easy"|"medium"
- matchRate: 보유 재료 일치율 0~100
- availableIngredients: 사용 가능한 재료 배열
- missingIngredients: 부족한 재료 배열 (기본 양념 제외)
- steps: 조리 단계 배열 (3~5단계)
- tags: 태그 배열
- calories: 칼로리 (선택)

JSON 배열만 반환:`,
        },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch (e) {
    console.error('Recipe API error:', e)
  }
  return []
}

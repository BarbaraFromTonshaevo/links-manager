import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useLinksStore } from './linksStore'
import { supabase } from '@/supabase'

let mockResult = { error: null}

const mockQuery = {
  from: vi.fn(() => mockQuery),
  delete: vi.fn(() => mockQuery),
  eq: vi.fn(() => mockQuery),
  then: (resolve) => resolve(mockResult), // делает mockQuery awaitable
}

vi.mock('@/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery), // supabase.from — это ровно тот же метод, что внутри mockQuery
  },
}))

describe('linksStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // новый Pinia-инстанс на каждый тест,
    // иначе стор из одного теста "утечёт" в следующий
    setActivePinia(createPinia())
    mockResult = { error: null } // сброс перед каждым тестом
  })

  it('removeLink: удаляет ссылку из списка при успешном ответе', async () => {
    const store = useLinksStore()
    store.links = [
      { id: 1, name: 'Google' },
      { id: 2, name: 'GitHub' },
    ]

    await store.removeLink(1)
    expect(store.links).toEqual([{ id: 2, name: 'GitHub' }])
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
  })

  it('removeLink: бросает ошибку и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google' }]
    mockResult = { error: new Error('Delete failed') }

    await expect(store.removeLink(1)).rejects.toThrow('Delete failed')
    expect(store.links).toEqual([{ id: 1, name: 'Google' }]) // список не тронут
  })
})

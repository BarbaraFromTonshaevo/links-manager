import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useLinksStore } from './linksStore'

let mockResult = { error: null }

const mockQuery = {
  from: vi.fn(() => mockQuery),
  delete: vi.fn(() => mockQuery),
  update: vi.fn(() => mockQuery),
  eq: vi.fn(() => mockQuery),
  then: (resolve) => resolve(mockResult), // делает mockQuery awaitable
}

vi.mock('@/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery), // supabase.from — это ровно тот же метод, что внутри mockQuery
  },
}))

describe('linksStore - removeLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // новый Pinia-инстанс на каждый тест,
    // иначе стор из одного теста "утечёт" в следующий
    setActivePinia(createPinia())
    mockResult = { error: null } // сброс перед каждым тестом
  })

  it('удаляет ссылку из списка при успешном ответе', async () => {
    const store = useLinksStore()
    store.links = [
      { id: 1, name: 'Google' },
      { id: 2, name: 'GitHub' },
    ]

    await store.removeLink(1)
    expect(store.links).toEqual([{ id: 2, name: 'GitHub' }])
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
  })

  it('бросает ошибку и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google' }]
    mockResult = { error: new Error('Delete failed') }

    await expect(store.removeLink(1)).rejects.toThrow('Delete failed')
    expect(store.links).toEqual([{ id: 1, name: 'Google' }]) // список не тронут
  })
})

describe('linksStore - changeIsFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockResult = { error: null } // сброс перед каждым тестом
  })

  it('смена значения свойства is_favorite на true', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', is_favorite: false }]
    await store.changeIsFavorite(1)
    expect(store.links).toEqual([{ id: 1, name: 'Google', is_favorite: true }])
    expect(mockQuery.update).toHaveBeenCalledWith({ is_favorite: true })
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
  })

  it('смена значения свойства is_favorite на false', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', is_favorite: true }]
    await store.changeIsFavorite(1)
    expect(store.links).toEqual([{ id: 1, name: 'Google', is_favorite: false }])
    expect(mockQuery.update).toHaveBeenCalledWith({ is_favorite: false })
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
  })

  it('проверка отсутствие изменений если указан несуществующий id', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', is_favorite: false }]
    await store.changeIsFavorite(2)
    expect(store.links).toEqual([{ id: 1, name: 'Google', is_favorite: false }])
  })

  it('бросает ошибку и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', is_favorite: false }]
    mockResult = { error: new Error('changeIsFavorite failed') }
    await expect(store.changeIsFavorite(1)).rejects.toThrow('changeIsFavorite failed')
    expect(store.links).toEqual([{ id: 1, name: 'Google', is_favorite: false }]) // список не тронут
  })
})

describe('linksStore - addClickCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockResult = { error: null } // сброс перед каждым тестом
  })

  it('проверка изменения click_count', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 0 }]
    await store.addClickCount(1)
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 1 }])
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
    expect(mockQuery.update).toHaveBeenCalledWith({'click_count': 1})
  })

  it('проверка отсутствие изменений если указан несуществующий id', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 0 }]
    await store.addClickCount(2)
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 0 }])
  })

  it('бросает ошибку и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 0 }]
    mockResult = { error: new Error('addClickCount failed') }
    await expect(store.addClickCount(1)).rejects.toThrow('addClickCount failed')
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 0 }]) // список не тронут
  })
})

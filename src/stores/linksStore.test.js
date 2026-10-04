import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useLinksStore } from './linksStore'
import { supabase } from '@/supabase'

let mockResult = { error: null }

const mockQuery = {
  from: vi.fn(() => mockQuery),
  delete: vi.fn(() => mockQuery),
  update: vi.fn(() => mockQuery),
  eq: vi.fn(() => mockQuery),
  range: vi.fn(() => mockQuery),
  order: vi.fn(() => mockQuery),
  select: vi.fn(() => mockQuery),
  then: (resolve) => resolve(mockResult), // делает mockQuery awaitable
}

vi.mock('@/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery), // supabase.from — это ровно тот же метод, что внутри mockQuery
    rpc: vi.fn(),
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
  })

  it('проверка изменения click_count с учетом актуальных данных', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 5 }]
    supabase.rpc.mockResolvedValue({ data: 8, error: null })
    await store.addClickCount(1)
    expect(supabase.rpc).toHaveBeenCalledWith('increment_click_count', { link_id: 1 })
    expect(mockQuery.update).not.toHaveBeenCalled()
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 8 }])
  })

  it('проверка отсутствие изменений если указан несуществующий id', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 0 }]
    await store.addClickCount(2)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 0 }])
  })

  it('бросает ошибку и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 0 }]
    supabase.rpc.mockResolvedValue({ data: null, error: new Error('addClickCount failed') })
    await expect(store.addClickCount(1)).rejects.toThrow('addClickCount failed')
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 0 }]) // список не тронут
  })

  it('проверка случая если возвращается click_count = null', async () => {
    const store = useLinksStore()
    store.links = [{ id: 1, name: 'Google', click_count: 5 }]
    supabase.rpc.mockResolvedValue({ data: null, error: null })
    await store.addClickCount(1)
    expect(store.links).toEqual([{ id: 1, name: 'Google', click_count: 5 }])
  })
})

describe('linksStore - fetchLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockResult = { error: null }
  })

  it('загружает ссылки и обновляет offset/hasMore/totalLinks', async () => {
    const store = useLinksStore()
    const fakeLinks = [
      { id: 1, name: 'Google', url: 'https://google.com', click_count: 0, is_favorite: false },
      { id: 2, name: 'GitHub', url: 'https://github.com', click_count: 0, is_favorite: false },
    ]
    mockResult = { data: fakeLinks, error: null, count: 10 }
    await store.fetchLinks()

    expect(store.links).toEqual(fakeLinks)
    expect(store.offset).toBe(2)
    expect(store.hasMore).toBe(true)
  })

  it('выставляет isLoading в true во время запроса и в false после', async () => {
    const store = useLinksStore()
    mockResult = { data: [], error: null, count: 0 }

    const promise = store.fetchLinks()
    expect(store.isLoading).toBe(true) // сразу после вызова, пока промис ещё pending

    await promise
    expect(store.isLoading).toBe(false) // после завершения, через finally
  })

  it('проверка что вызываются с фильтрами', async () => {
    const store = useLinksStore()
    const fakeLinks = [
      { id: 1, name: 'Google', url: 'https://google.com', click_count: 1, is_favorite: true },
      { id: 2, name: 'GitHub', url: 'https://github.com', click_count: 0, is_favorite: true },
    ]
    mockResult = { data: fakeLinks, error: null, count: 10 }
    store.sortByPopular = true
    store.onlyFavorites = true
    await store.fetchLinks()

    expect(mockQuery.eq).toHaveBeenCalledWith('is_favorite', true)
    expect(mockQuery.order).toHaveBeenCalledWith('click_count', { ascending: false })
  })

  it('проверка что сбрасываются фильтры', async () => {
    const store = useLinksStore()
    const fakeLinks = [
      { id: 1, name: 'Google', url: 'https://google.com', click_count: 1, is_favorite: true },
      { id: 2, name: 'GitHub', url: 'https://github.com', click_count: 0, is_favorite: true },
    ]
    mockResult = { data: fakeLinks, error: null, count: 10 }
    store.sortByPopular = true
    store.onlyFavorites = true
    await store.fetchLinks(false, true)

    expect(store.sortByPopular).toBe(false)
    expect(store.onlyFavorites).toBe(false)
    expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('проверка что сбрасывается страницы', async () => {
    const store = useLinksStore()
    const fakeLinks = [
      { id: 1, name: 'Google', url: 'https://google.com', click_count: 1, is_favorite: false },
      { id: 2, name: 'GitHub', url: 'https://github.com', click_count: 0, is_favorite: false },
    ]
    mockResult = { data: fakeLinks, error: null, count: 10 }

    store.offset = 3
    store.links = fakeLinks
    store.hasMore = false

    const promise = store.fetchLinks(true, false)

    expect(store.offset).toBe(0)
    expect(store.links.length).toBe(0)
    expect(store.hasMore).toBe(true)

    await promise
    expect(store.links).toEqual(fakeLinks)
    expect(store.offset).toBe(2)
    expect(store.hasMore).toBe(true)
  })

  it('меняет errorMessage и не меняет список при ошибке', async () => {
    const store = useLinksStore()
    const fakeLinks = [
      { id: 1, name: 'Google', url: 'https://google.com', click_count: 1, is_favorite: false },
      { id: 2, name: 'GitHub', url: 'https://github.com', click_count: 0, is_favorite: false },
    ]

    expect(store.isLoading).toBe(false)
    store.links = fakeLinks
    store.offset = 2
    store.hasMore = true

    mockResult = { error: new Error('fetchLinks failed') }
    const promise = store.fetchLinks()
    expect(store.isLoading).toBe(true)
    expect(store.errorMessage).toBe('')
    await promise
    expect(store.errorMessage).toBe('Не удалось загрузить ссылки. Попробуйте обновить страницу.')

    // список не тронут
    expect(store.links).toEqual(fakeLinks)
    expect(store.offset).toBe(2)
    expect(store.hasMore).toBe(true)
    expect(store.isLoading).toBe(false)
  })

  it('сбрасывает ошибку после успешной загрузки', async () => {
    const store = useLinksStore()

    // 1. Первая загрузка падает → ошибка записана
    mockResult = { error: new Error('fetchLinks failed') }
    await store.fetchLinks()
    expect(store.errorMessage).toBe('Не удалось загрузить ссылки. Попробуйте обновить страницу.')

    // 2. «Сеть вернулась»: мок теперь отвечает успешно
    mockResult = { data: [{ id: 1 }], error: null, count: 1 }
    await store.fetchLinks()

    // 3. Ошибка должна исчезнуть
    expect(store.errorMessage).toBe('')
  })
})

import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from './userStore'
import { supabase } from '@/supabase'

vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
    },
  },
}))

describe('userStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // новый Pinia-инстанс на каждый тест,
    // иначе стор из одного теста "утечёт" в следующий
    setActivePinia(createPinia())
  })

  it('обновляет user и isReady при SIGNED_IN', async () => {
    const store = useUserStore()

    // store уже создан → onAuthStateChange уже был вызван один раз →
    // достаём колбэк, который стор туда передал, из истории вызовов мока
    const callback = supabase.auth.onAuthStateChange.mock.calls[0][0]

    const fakeSession = { user: { id: '123' } }
    callback('SIGNED_IN', fakeSession)

    expect(store.user).toEqual(fakeSession.user)
    expect(store.isReady).toBe(true)
    await expect(store.authReady).resolves.toBeUndefined()
  })

  it('начальное состояние до вызова колбэка', () => {
    const store = useUserStore()
    expect(store.user).toBe(null)
    expect(store.isReady).toBe(false)
  })

  it('обновляет user и isReady при SIGNED_OUT', async () => {
    const store = useUserStore()

    // store уже создан → onAuthStateChange уже был вызван один раз →
    // достаём колбэк, который стор туда передал, из истории вызовов мока
    const callback = supabase.auth.onAuthStateChange.mock.calls[0][0]

    callback('SIGNED_OUT', null)

    expect(store.user).toEqual(null)
    expect(store.isReady).toBe(true)
    await expect(store.authReady).resolves.toBeUndefined()
  })
})

// По умолчанию Vitest гоняет тесты в Node-окружении, где нет window —
// resetPassword обращается к window.location.origin, а значит без этой
// директивы тест упадёт с ReferenceError. jsdom эмулирует браузерный DOM,
// включая window, только для этого файла (глобально не включаем, чтобы
// не замедлять остальные тесты, которым DOM не нужен).
// @vitest-environment jsdom
import { useAuth } from './useAuth'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '@/supabase'

// Имя обязано начинаться с "mock" — vi.mock(...) поднимается (hoisting)
// в самый верх файла ещё до выполнения остального кода, и Vitest разрешает
// ссылаться внутри фабрики только на переменные с этим префиксом. Иначе —
// ошибка обращения к переменной до её инициализации (temporal dead zone).
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },

    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}))

describe('useAuth - signIn', () => {
  // важно: без этого настройка мока из одного теста (mockResolvedValue)
  // может "утечь" в следующий тест, если вы явно не переопределите её там
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает данные при успешном входе', async () => {
    const fakeData = { user: { id: '123' } }
    supabase.auth.signInWithPassword.mockResolvedValue({ data: fakeData, error: null })

    const { signIn } = useAuth()
    const result = await signIn({ email: 'a@a.com', password: '123456' })

    expect(result).toEqual(fakeData)
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@a.com',
      password: '123456',
    })
  })

  it('бросает ошибку при неверных данных', async () => {
    // Supabase-клиент никогда не бросает исключение сам, он возвращает { data, error }
    // Мок должен повторять форму реального ответа.
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid credentials'),
    })

    const { signIn, errorMessage } = useAuth()
    await expect(signIn({ email: 'a@a.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials',
    )
    expect(errorMessage.value).toBe('Invalid credentials')
  })
})

describe('useAuth - signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает пустоту', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null })

    const { signOut } = useAuth()
    const result = await signOut()

    expect(result).toBeUndefined()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('бросает ошибку', async () => {
    // Supabase-клиент никогда не бросает исключение сам, он возвращает { data, error }
    // Мок должен повторять форму реального ответа.
    supabase.auth.signOut.mockResolvedValue({
      error: new Error('Exit Error'),
    })

    const { signOut, errorMessage } = useAuth()
    await expect(signOut()).rejects.toThrow('Exit Error')
    expect(errorMessage.value).toBe('Exit Error')
  })
})

describe('useAuth - signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает данные при успешной регистрации', async () => {
    const fakeData = { user: { id: '123' } }
    supabase.auth.signUp.mockResolvedValue({ data: fakeData, error: null })
    const { signUp } = useAuth()
    const result = await signUp({ email: 'a@a.com', password: '123456', firstname: 'test name' })

    expect(result).toEqual(fakeData)
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@a.com',
      password: '123456',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      id: '123',
      email: 'a@a.com',
      firstname: 'test name',
    })
  })

  it('бросает ошибку при неверных данных', async () => {
    // Supabase-клиент никогда не бросает исключение сам, он возвращает { data, error }
    // Мок должен повторять форму реального ответа.
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: new Error('Invalid credentials'),
    })

    const { signUp, errorMessage } = useAuth()

    await expect(
      signUp({ email: 'a@a.com', password: 'wrong', firstname: 'test name' }),
    ).rejects.toThrow('Invalid credentials')
    expect(errorMessage.value).toBe('Invalid credentials')
  })
})

describe('useAuth - updatePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает данные при успешной смене пароля', async () => {
    const fakeData = { user: { id: '123' } }
    supabase.auth.updateUser.mockResolvedValue({ data: fakeData, error: null })

    const { updatePassword } = useAuth()
    const result = await updatePassword('testpassword')

    expect(result).toEqual(fakeData)
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'testpassword' })
  })

  it('бросает ошибку при неверных данных', async () => {
    supabase.auth.updateUser.mockResolvedValue({
      error: new Error('Invalid password'),
    })

    const { updatePassword, errorMessage } = useAuth()

    await expect(updatePassword('testpassword')).rejects.toThrow('Invalid password')
    expect(errorMessage.value).toBe('Invalid password')
  })
})

describe('useAuth - resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает данные при успешном сбросе пароля', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

    const { resetPassword } = useAuth()
    await resetPassword('a@a.com')
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@a.com', {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  })

  it('бросает ошибку при неверных данных', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: new Error('Invalid email'),
    })

    const { resetPassword, errorMessage } = useAuth()

    await expect(resetPassword('a@a.com')).rejects.toThrow('Invalid email')
    expect(errorMessage.value).toBe('Invalid email')
  })
})

// signInWithGithub намеренно не покрыт тестом — структурно идентичен
// signIn (тот же паттерн call → { data, error }), не добавляет новой
// ветвящейся логики, которую стоило бы проверять отдельно.
it.todo('signInWithGithub — аналогичен signIn, доп. логики для проверки нет')

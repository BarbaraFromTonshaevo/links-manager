import { useRequest } from './useRequest'
import { expect, describe, it } from 'vitest'

describe('useRequest', () => {
  it('выставляет loading в true во время запроса и в false после', async () => {
    const { loading, handleRequest } = useRequest()

    expect(loading.value).toBe(false) // до вызова

    const promise = handleRequest(async () => 'ok')
    expect(loading.value).toBe(true) // сразу после вызова, пока промис ещё не резолвился

    await promise
    expect(loading.value).toBe(false) // после завершения
  })

  it('проверка error пути', async () => {
    const {loading, errorMessage, handleRequest } = useRequest()

    expect(errorMessage.value).toBe('')
    expect(loading.value).toBe(false)


    const promise = handleRequest(async () => {
      throw new Error('test error')
    })
    expect(loading.value).toBe(true)

    await expect(promise).rejects.toThrow('test error')
    
    expect(loading.value).toBe(false)
    expect(errorMessage.value).toBe('test error')
  })

  it('Проверка, что успешный результат действительно возвращается', async () => {
    const { handleRequest } = useRequest()

    const promise = handleRequest(async () => 'ok')
    const result = await promise
    expect(result).toBe('ok') // после завершения
  })
})

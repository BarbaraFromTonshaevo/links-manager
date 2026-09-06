import { supabase } from '@/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('auth', () => {
  const user = ref(null)
  // isReady нужен, чтобы отличать "мы ещё не знаем, есть сессия или нет"
  // от "точно знаем, что сессии нет". Без него user === null в самом
  // начале выглядел бы так же, как user === null после реальной проверки.
  const isReady = ref(false)

  // "Deferred"-паттерн: resolve обычно вызывают сразу внутри исполнителя
  // промиса, но нам нужно вызвать его позже, из другого места кода —
  // из колбэка onAuthStateChange, который сработает асинхронно и не
  // знает про этот промис напрямую. Поэтому сохраняем ссылку на саму
  // функцию resolve в переменной authReady, объявленной снаружи,
  // чтобы дёрнуть её оттуда, когда придёт время.
  let resolveAuthReady
  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve
  })

  function getAuthState() {
    // onAuthStateChange — подписка (как addEventListener), а не запрос
    // с промисом: сама подписка регистрируется мгновенно и синхронно,
    // а колбэк внутри выполнится позже, асинхронно, когда Supabase
    // определит реальное состояние сессии (и затем повторно — при
    // каждом следующем событии: вход, выход, обновление токена и т.д.).
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // session есть только при активной сессии (SIGNED_IN и т.п.),
      // при SIGNED_OUT Supabase передаёт session === null.
      user.value = session?.user ?? null
      isReady.value = true
      // Резолвит authReady только при первом вызове — повторные вызовы
      // resolve() на уже зарезолвленном промисе ничего не делают,
      // так что защищаться от повторных срабатываний не нужно.
      resolveAuthReady()
    })
    return data
  }

  // TODO: сейчас подписка на onAuthStateChange никогда не отписывается.
  // В обычной работе это не проблема — стор живёт всё время сессии,
  // но при HMR в dev-режиме (или в тестах) может плодить дублирующиеся
  // подписки. Решение: onScopeDispose(() => subscription.unsubscribe())
  // внутри setup-функции стора.
  // eslint-disable-next-line no-unused-vars
  const authStateSubscription = getAuthState()
  //   console.log(authStateSubscription)

  return { user, isReady, authReady }
})

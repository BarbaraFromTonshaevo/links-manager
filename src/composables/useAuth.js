import { supabase } from '@/supabase'
import { useRequest } from '@/composables/useRequest'

export function useAuth() {
  const { loading, errorMessage, handleRequest } = useRequest()

  const signUp = async ({ email, password, firstname }) => {
    return await handleRequest(async () => {
      const { data, error } = await supabase.auth.signUp({ email, password })
      await supabase.from('users').insert({ id: data.user.id, firstname, email })
      if (error) {
        throw error
      }
      return data
    })
  }

  const signIn = async ({ email, password }) => {
    return await handleRequest(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw error
      }
      return data
    })
  }

  const resetPassword = async (email) => {
    return await handleRequest(async () => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/reset-password',
      })
      if (error) {
        throw error
      }
      return data
    })
  }

  const updatePassword = async (password) => {
    return await handleRequest(async () => {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) {
        throw error
      }
      return data
    })
  }

    const signInWithGithub = async () => {
    return await handleRequest(async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'github' })
      if (error) {
        throw error
      }
      return data
    })
  }

  return { loading, errorMessage, signUp, signIn, resetPassword, updatePassword, signInWithGithub }
}

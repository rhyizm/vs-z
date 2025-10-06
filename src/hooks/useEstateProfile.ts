/**
 * 財産プロフィールの永続化を管理するカスタムフック
 * 
 * @module useEstateProfile
 */

"use client"

import { useCallback, useMemo, useState } from "react"

import { useLiff } from "@/lib/liff"
import type { EstateProfilePayload, EstateProfileResponse } from "@/types/estate-profile"

/**
 * プロファイル保存時のペイロード型。IDは省略可能。
 */
type SavePayload = EstateProfilePayload

/**
 * useEstateProfileフックが返す値の型定義
 */
export interface EstateProfileValue {
  /** 現在のプロフィールID。未保存の場合はnull */
  profileId: string | null
  /** 取得したプロフィールデータ */
  profile: EstateProfileResponse | null
  /** 保存処理中かどうかの状態 */
  isSaving: boolean
  /** プロフィール取得中かどうかの状態 */
  isLoading: boolean
  /** エラーメッセージ。エラーがない場合はnull */
  error: string | null
  /**
   * プロファイルを保存する関数
   * @param payload - 保存するプロフィールデータ
   * @returns 保存されたプロフィールのID、失敗時はnullを返すPromise
   */
  saveProfile: (payload: SavePayload) => Promise<string | null>
  /** 既存のプロフィールを取得する関数 */
  loadLatestProfile: () => Promise<EstateProfileResponse | null>
  /** エラーメッセージをクリアする関数 */
  clearError: () => void
}

/**
 * 財産プロフィールの保存状態を管理するカスタムフック
 * 
 * @returns {EstateProfileValue} プロフィールの状態と操作関数を含むオブジェクト
 */
export function useEstateProfile(): EstateProfileValue {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profile, setProfile] = useState<EstateProfileResponse | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { idToken, userId, isLoggedIn } = useLiff()

  /**
   * プロファイルを保存する非同期関数
   * 
   * @param {SavePayload} payload - 保存するプロフィールデータ
   * @returns {Promise<string | null>} 保存されたプロフィールID、失敗時はnull
   * @throws エラーが発生した場合は例外をスロー
   */
  const saveProfile = useCallback(
    async (payload: SavePayload) => {
      setIsSaving(true)
      setError(null)

      if (!isLoggedIn || !idToken) {
        const message = "LINEログインが必要です。"
        setError(message)
        throw new Error(message)
      }

      const targetId = payload.id ?? profileId ?? null
      const endpoint = targetId ? `/api/estate-profiles/${targetId}` : "/api/estate-profiles"
      const method = targetId ? "PUT" : "POST"

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        }

        if (userId) {
          headers["X-Line-User-Id"] = userId
        }

        const response = await fetch(endpoint, {
          method,
          headers,
          body: JSON.stringify({ ...payload, id: targetId ?? undefined }),
        })

        if (!response.ok) {
          let message = "プロファイルの保存に失敗しました。"
          try {
            const data = (await response.json()) as { error?: string }
            if (data?.error) {
              message = data.error
            }
          } catch {
            // ignore JSON parse errors
          }

          setError(message)
          throw new Error(message)
        }

        const data = (await response.json()) as { id: string }
        setProfileId(data.id)
        return data.id ?? null
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "プロファイルの保存中にエラーが発生しました。"
        setError(message)
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [idToken, isLoggedIn, profileId, userId],
  )

  /**
   * エラーメッセージをクリアする関数
   */
  const clearError = useCallback(() => setError(null), [])

  const loadLatestProfile = useCallback(async () => {
    if (!isLoggedIn || !idToken) {
      setProfileId(null)
      setProfile(null)
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${idToken}`,
      }

      if (userId) {
        headers["X-Line-User-Id"] = userId
      }

      const response = await fetch("/api/estate-profiles", {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        let message = "プロファイルの取得に失敗しました。"
        try {
          const data = (await response.json()) as { error?: string }
          if (data?.error) {
            message = data.error
          }
        } catch {
          // ignore JSON parse errors
        }

        setError(message)
        throw new Error(message)
      }

      const data = (await response.json()) as { profile: EstateProfileResponse | null }

      if (!data?.profile) {
        setProfileId(null)
        setProfile(null)
        return null
      }

      setProfileId(data.profile.id)
      setProfile(data.profile)
      return data.profile
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "プロファイルの取得中にエラーが発生しました。"
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [idToken, isLoggedIn, userId])

  return useMemo(
    () => ({
      profileId,
      profile,
      isSaving,
      isLoading,
      error,
      saveProfile,
      loadLatestProfile,
      clearError,
    }),
    [profileId, profile, isSaving, isLoading, error, saveProfile, loadLatestProfile, clearError],
  )
}

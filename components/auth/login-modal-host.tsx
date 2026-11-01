"use client"

import { LoginModal } from "./login-modal"
import { useLoginModal } from "./login-modal-context"

export function LoginModalHost() {
  const { open } = useLoginModal()
  if (!open) return null
  return <LoginModal />
}

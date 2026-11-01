import { apiGet, apiPost } from "@/lib/api/client"
import type { AuthProvider, EmailChallenge, Session, WalletId } from "./types"

export class MockAuthProvider implements AuthProvider {
  getSession(): Promise<Session> {
    return apiGet<Session>("/api/auth/session")
  }

  signInWithEmail(email: string): Promise<EmailChallenge> {
    return apiPost<EmailChallenge>("/api/auth/email", { email })
  }

  verifyCode(email: string, code: string): Promise<Session> {
    return apiPost<Session>("/api/auth/verify", { email, code })
  }

  signInWithWallet(wallet: WalletId): Promise<Session> {
    return apiPost<Session>("/api/auth/wallet", { wallet })
  }

  signOut(): Promise<Session> {
    return apiPost<Session>("/api/auth/logout", {})
  }
}

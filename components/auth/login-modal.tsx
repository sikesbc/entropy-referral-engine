"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useRef, useState } from "react"
import { APP_MODE } from "@/lib/app-mode"
import { useAuth } from "@/lib/auth/auth-context"
import type { WalletId } from "@/lib/auth/types"
import { cn } from "@/lib/utils"
import { LoginLandingView } from "./login-landing-view"
import { LoginModalFooter } from "./login-modal-footer"
import { LoginModalHeader } from "./login-modal-header"
import { useLoginModal } from "./login-modal-context"
import { PRIVY_FONT } from "./privy-styles"
import { VerifyCodeView } from "./verify-code-view"
import { WalletPickerView } from "./wallet-picker-view"

const SEND_CODE_ERROR = "Could not send a code to that email. Try again."
const WALLET_ERROR = "Could not connect that wallet. Try again."

export function LoginModal() {
  const { open, view, closeLogin, setView } = useLoginModal()
  const { signInWithEmail, verifyCode, signInWithWallet } = useAuth()
  const popupRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [pendingWallet, setPendingWallet] = useState<WalletId | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)

  const submitEmail = (address: string) => {
    setSending(true)
    setEmailError(null)
    signInWithEmail(address)
      .then((challenge) => {
        setEmail(challenge.email)
        setView("code")
      })
      .catch(() => setEmailError(SEND_CODE_ERROR))
      .finally(() => setSending(false))
  }

  const verify = async (code: string) => {
    await verifyCode(email, code)
    closeLogin()
  }

  const resend = async () => {
    await signInWithEmail(email)
  }

  const chooseWallet = (wallet: WalletId) => {
    if (APP_MODE) {
      closeLogin()
      signInWithWallet(wallet).catch(() => undefined)
      return
    }
    setPendingWallet(wallet)
    setWalletError(null)
    signInWithWallet(wallet)
      .then(() => closeLogin())
      .catch(() => setWalletError(WALLET_ERROR))
      .finally(() => setPendingWallet(null))
  }

  const back = view === "email" ? undefined : () => setView("email")
  const label =
    view === "wallets"
      ? "Select your wallet"
      : view === "code"
        ? "Enter confirmation code"
        : "log in or sign up"

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeLogin()
      }}
    >
      <DialogPrimitive.Portal>
        <div id="privy-dialog" className={cn("relative z-[999999]", PRIVY_FONT)}>
          <DialogPrimitive.Backdrop
            id="privy-dialog-backdrop"
            className="fixed inset-0 backdrop-blur-[3px]"
          />
          <DialogPrimitive.Viewport className="fixed inset-0 flex min-h-dvh w-screen items-end justify-center overflow-y-auto min-[441px]:items-center">
            <DialogPrimitive.Popup
              ref={popupRef}
              aria-label={label}
              initialFocus={popupRef}
              className="w-full outline-none min-[441px]:m-auto min-[441px]:w-[360px] min-[441px]:rounded-[24px]"
            >
              <div
                id="privy-modal-content"
                className="flex max-h-[calc(100svh-32px)] flex-col overflow-x-hidden overflow-y-auto rounded-t-[24px] bg-[#f2f1f0] text-center text-[14px] leading-[20px] [scrollbar-width:none] min-[441px]:rounded-[24px] dark:bg-[#0c0c0c]"
              >
                <LoginModalHeader onBack={back} onClose={closeLogin} />
                {view === "wallets" ? (
                  <WalletPickerView
                    pendingWallet={pendingWallet}
                    error={walletError}
                    onSelect={chooseWallet}
                  />
                ) : view === "code" && email ? (
                  <VerifyCodeView email={email} onVerify={verify} onResend={resend} />
                ) : (
                  <LoginLandingView
                    defaultEmail={email}
                    submitting={sending}
                    error={emailError}
                    onSubmitEmail={submitEmail}
                    onChooseWallet={() => setView("wallets")}
                  />
                )}
                <LoginModalFooter
                  underlineLinks={view !== "wallets"}
                  className={view === "wallets" ? "mt-[70px]" : view === "code" ? "mt-[40px]" : "mt-[73px]"}
                />
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Viewport>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

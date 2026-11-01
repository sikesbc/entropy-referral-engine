import { FeedLoginButton } from "./feed-login-button"

export function SignedOutFeed() {
  return (
    <main className="flex flex-1 flex-col gap-[0.1875rem] px-[0.1875rem] pb-[0.1875rem]">
      <section className="entropy-card rounded-[0.625rem] p-5">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-xl">Social</h1>
          <p className="text-[0.8125rem] text-ink-quiet">
            Log in to follow top traders and join their trades.
          </p>
          <FeedLoginButton />
        </div>
      </section>
    </main>
  )
}

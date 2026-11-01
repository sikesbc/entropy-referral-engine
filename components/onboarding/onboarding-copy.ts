export const ONBOARDING_COPY = {
  title: "Welcome to Entropy",
  back: "Back",
  continue: "Continue",
  saving: "Saving…",
  usernameTitle: "Choose your username",
  usernamePlaceholder: "username",
  usernameHelp: "3 to 30 characters • letters, numbers, and underscores",
  usernameLength: "Usernames must be 3 to 30 characters.",
  usernameChars: "Only letters, numbers, and underscores.",
  usernameUnderscore: "Usernames can't end with an underscore.",
  usernameReserved: "That username is reserved.",
  usernameTaken: "That username is already taken.",
  usernameChecking: "Checking username…",
  usernameAvailable: "Username is available.",
  referralSubtitle: "Were you invited by a friend?",
  referralTitle: "Referral code",
  referralPlaceholder: "Enter a code",
  referralApply: "Apply code",
  referralSkip: "I don't have a code",
  referralInvalid: "That code could not be applied.",
  referralChecking: "Checking code…",
  referralInviting: (username: string) => `${username} is inviting you`,
  referralUnknown: "That code doesn't belong to anyone.",
  referralUnknownApplied: (code: string) =>
    `The code “${code}” doesn't belong to anyone, so no referrer was credited.`,
  referralExistingTrader: (username: string | null) =>
    `This wallet has traded io markets before, so ${username ?? "your referrer"} isn't credited. Referrals only count for traders who are new to io.`,
  referralSelf: "You can't refer yourself, so no referrer was credited.",
  referralAlreadyRegistered: (code: string | null) =>
    code
      ? `This account already signed up. Referrers are set once, at signup, so “${code}” wasn't applied.`
      : "This account already signed up.",
  referredBy: (code: string) => `Referred by @${code}`,
  leaderboardTitle: "Traders already on entropy",
  leaderboardSubtitle: "You're in good company",
  leaderboardLabel: "Leaderboard preview",
  leaderboardRank: "#",
  leaderboardTrader: "Trader",
  leaderboardLoading: "Loading leaderboard…",
  leaderboardError: "Leaderboard unavailable right now.",
  leaderboardEmpty: "No featured traders available.",
  leaderboardPitch: "Connect your X to show up here, and get a verified badge on the leaderboard.",
  connect: "Connect",
  connectLabel: "Connect X",
  connected: "Connected",
  skip: "Skip for now",
  greeting: (name: string) => `Good to have you here, @${name}.`,
  deposit: "Make your first deposit",
  done: "Done",
  completeError: "Unable to finish setting up your account. Please try again.",
  stepLabel: (step: number, total: number) => `Onboarding step ${step} of ${total}`,
} as const

export const ONBOARDING_STEPS = ["username", "referral", "leaderboard", "welcome"] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

export const ONBOARDING_LEADERBOARD = { window: "30d", order: "volume", known: false, size: 4 } as const

export const ONBOARDING_LEAVE_MS = 520
export const ONBOARDING_CONNECTED_ADVANCE_MS = 900
export const USERNAME_CHECK_DELAY_MS = 350

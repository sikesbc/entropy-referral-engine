import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { chromium } from "playwright"

const require = createRequire(import.meta.url)
const { privateKeyToAccount } = require(
  require.resolve("viem/accounts", { paths: [require.resolve("@privy-io/react-auth")] }),
)

const [, , keyFile, url = "http://localhost:3000/"] = process.argv
const account = privateKeyToAccount(readFileSync(keyFile, "utf8").trim())

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext({ viewport: null, colorScheme: "dark" })
await context.exposeFunction("__testWalletSign", (message) =>
  account.signMessage({ message: message.startsWith("0x") ? { raw: message } : message }),
)
await context.addInitScript(
  ({ address }) => {
    const provider = {
      isMetaMask: true,
      request: async ({ method, params }) => {
        if (method === "eth_requestAccounts" || method === "eth_accounts") return [address]
        if (method === "eth_chainId") return "0x1"
        if (method === "net_version") return "1"
        if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null
        if (method === "wallet_requestPermissions" || method === "wallet_getPermissions") {
          return [{ parentCapability: "eth_accounts" }]
        }
        if (method === "personal_sign") return window.__testWalletSign(params[0])
        throw Object.assign(new Error(`Unsupported method ${method}`), { code: 4200 })
      },
      on: () => {},
      removeListener: () => {},
    }
    window.ethereum = provider
    const info = {
      uuid: "00000000-0000-4000-8000-000000000000",
      name: "MetaMask",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
      rdns: "io.metamask",
    }
    const announce = () =>
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", { detail: Object.freeze({ info, provider }) }),
      )
    window.addEventListener("eip6963:requestProvider", announce)
    announce()
  },
  { address: account.address },
)

const page = await context.newPage()
await page.goto(url)
console.log(`Test wallet ${account.address} ready. Close the window to stop.`)
await new Promise((resolve) => browser.on("disconnected", resolve))

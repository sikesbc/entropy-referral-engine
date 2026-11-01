const AVATAR_GRADIENTS = [
  "linear-gradient(to bottom, #002e4e 25%, #0a3654 32.14%, #254b65 39.29%, #506c80 46.43%, #8395a1 53.57%, #aeb6bc 60.71%, #c9cbcd 67.86%, #d3d3d3 75%)",
  "linear-gradient(to bottom, #c7dc68 16.67%, #c8dc6e 21.43%, #cbdb7d 26.19%, #cfda95 30.95%, #d5dab3 35.71%, #d9d9cb 40.48%, #dcd8da 45.24%, #ddd8e0 50%, #ded9e1 54.76%, #e1dde3 59.52%, #e5e2e6 64.29%, #eae8ea 69.05%, #eeeded 73.81%, #f1f1ef 78.57%, #f2f2f0 83.33%)",
  "linear-gradient(to bottom, #928178 16.67%, #96867d 21.43%, #a19289 26.19%, #b3a59c 30.95%, #c7bcb4 35.71%, #d9cfc7 40.48%, #e4dbd3 45.24%, #e8e0d8 50%, #e8e1d9 54.76%, #eae3dc 59.52%, #ece7e1 64.29%, #eeebe7 69.05%, #f0efec 73.81%, #f2f1ef 78.57%, #f2f2f0 83.33%)",
  "linear-gradient(to bottom, #0c3866 16.67%, #143e69 21.43%, #284c71 26.19%, #49657f 30.95%, #6f818f 35.71%, #909a9d 40.48%, #a4a8a5 45.24%, #acaea8 50%, #afb1ac 54.76%, #b8bab5 59.52%, #c6c8c3 64.29%, #d8d8d5 69.05%, #e6e6e3 73.81%, #efefec 78.57%, #f2f2f0 83.33%)",
  "linear-gradient(to bottom, #608080 16.67%, #658283 21.43%, #72878a 26.19%, #878f95 30.95%, #a199a3 35.71%, #b6a1ae 40.48%, #c3a6b5 45.24%, #c8a8b8 50%, #caabb9 54.76%, #ceb2bc 59.52%, #d6bec1 64.29%, #deccc7 69.05%, #e6d8cc 73.81%, #eadfcf 78.57%, #ece2d0 83.33%)",
  "linear-gradient(to bottom, #586b4d 16.67%, #5d7054 21.43%, #6b7c65 26.19%, #819081 30.95%, #9ba8a2 35.71%, #b1bcbe 40.48%, #bfc8cf 45.24%, #c4cdd6 50%, #c6ced6 54.76%, #ccd2d6 59.52%, #d6d8d6 64.29%, #e1dfd7 69.05%, #ebe5d7 73.81%, #f1e9d7 78.57%, #f3ead7 83.33%)",
  "linear-gradient(to bottom, #b7282e 16.67%, #b72f35 21.43%, #b64249 26.19%, #b66168 30.95%, #b5858e 35.71%, #b5a4ad 40.48%, #b4b7c1 45.24%, #b4bec8 50%, #b7c1ca 54.76%, #bfc7cf 59.52%, #cbd2d7 64.29%, #dbdee1 69.05%, #e7e9e9 73.81%, #efefee 78.57%, #f2f2f0 83.33%)",
  "linear-gradient(to bottom, #c8c0b4 16.67%, #c7bfb4 21.43%, #c4bdb3 26.19%, #bfbab2 30.95%, #bab6b2 35.71%, #b5b3b1 40.48%, #b2b1b0 45.24%, #b1b0b0 50%, #b4aead 54.76%, #bcaaa5 59.52%, #c9a499 64.29%, #d99c89 69.05%, #e6967d 73.81%, #ee9275 78.57%, #f19072 83.33%)",
] as const

function hashSeed(seed: string): number {
  let hash = 2166136261
  const text = seed.toLowerCase()
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % AVATAR_GRADIENTS.length
}

export function avatarGradient(seed: string | null | undefined): string {
  return seed ? AVATAR_GRADIENTS[hashSeed(seed)] : AVATAR_GRADIENTS[0]
}

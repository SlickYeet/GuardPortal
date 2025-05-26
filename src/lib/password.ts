export function generateTemporaryPassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
  let password = ""

  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ") // Uppercase
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz") // Lowercase
  password += getRandomChar("0123456789") // Number
  password += getRandomChar("!@#$%^&*()-_=+") // Special

  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return shuffleString(password)
}

export function getRandomChar(charset: string) {
  return charset.charAt(Math.floor(Math.random() * charset.length))
}

export function shuffleString(str: string) {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}

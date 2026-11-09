// Generates a short, human-friendly confirmation code like "VTL-4X9K2"
function generateConfirmationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VTL-${code}`;
}

module.exports = { generateConfirmationCode };
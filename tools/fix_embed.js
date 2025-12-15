const fs = require(fs);
const path = src/bot.js;
let s = fs.readFileSync(path, utf8);
const pattern = /const embed = buildEcoEmbed\(\{ title, description: desc, fields: safeFields \}\);\s*if \(imageAttachment\) embed\.setImage\(\);\s*else if \(imageAttachment\) embed\.setImage\(`attachment:\/\/\$\{imageAttachment\.filename\}`\);/s;
if (!pattern.test(s)) {
  console.log(pattern_not_found);
  process.exit(0);
}
s = s.replace(pattern, "const embed = buildEcoEmbed({ title, description: desc, fields: safeFields });\n  if (imageAttachment) embed.setImage(`attachment://${imageAttachment.filename}`);\n  else if (imageUrl && isLikelyDirectImageUrl(imageUrl)) embed.setImage(imageUrl);");
fs.writeFileSync(path, s);
console.log(fixed);

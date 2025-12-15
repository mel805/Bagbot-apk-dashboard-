with open('server-v2.js.backup-20251006_182343', 'r') as f:
    content = f.read()

# Corrections nécessaires:
# 1. Remplacer const upload simple par storage
old_multer = "const multer = require('multer');\nconst upload = multer({ dest: '/tmp/' });"
new_multer = """const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = require('path').join(__dirname, '../data/uploads');
    if (!require('fs').existsSync(uploadsPath)) {
      require('fs').mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = require('path').extname(file.originalname);
    const name = require('path').basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|flac/;
    const extname = allowedTypes.test(require('path').extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('audio/');
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Seuls les fichiers audio sont autorisés !'));
  }
});"""

content = content.replace(old_multer, new_multer)

# 2. Ajouter GUILD_ID
if 'const GUILD_ID' not in content:
    content = content.replace('const CONFIG = path.join', 'const GUILD_ID = \'1360897918504271882\';\nconst CONFIG = path.join')

# 3. Remplacer tous GUILD par GUILD_ID
content = content.replace('[GUILD]', '[GUILD_ID]')
content = content.replace('${GUILD}', '${GUILD_ID}')

# 4. Écouter sur 0.0.0.0
content = content.replace('app.listen(PORT, () => {', 'app.listen(PORT, "0.0.0.0", () => {')

with open('server-v2.js', 'w') as f:
    f.write(content)

print("✅ server-v2.js corrigé")

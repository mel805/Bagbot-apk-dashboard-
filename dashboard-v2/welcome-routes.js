// Module pour les routes Welcome/Goodbye API
module.exports = function(app, readConfig, writeConfig, GUILD) {
  
  // GET /api/welcome - Get welcome/goodbye configuration
  app.get('/api/welcome', (req, res) => {
    try {
      const config = readConfig();
      const welcome = config.guilds?.[GUILD]?.welcome || {
        enabled: false,
        channelId: null,
        message: "Bienvenue {user} sur **{server}** ! 🎉\nNous sommes maintenant {memberCount} membres !",
        embedEnabled: true,
        embedTitle: "Bienvenue !",
        embedDescription: "Bienvenue {user} ! 👋",
        embedColor: "#5865F2",
        embedThumbnail: true,
        embedFooter: "Profite bien de ton séjour !"
      };
      const goodbye = config.guilds?.[GUILD]?.goodbye || {
        enabled: false,
        channelId: null,
        message: "{user} a quitté le serveur... 😢\nNous sommes maintenant {memberCount} membres.",
        embedEnabled: true,
        embedTitle: "Au revoir...",
        embedDescription: "{user} a quitté le serveur 👋",
        embedColor: "#ED4245",
        embedThumbnail: false,
        embedFooter: null
      };
      res.json({ welcome, goodbye });
    } catch (err) {
      console.error('[API Welcome] Error:', err);
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  // POST /api/welcome - Save welcome/goodbye configuration
  app.post('/api/welcome', (req, res) => {
    try {
      const config = readConfig();
      if (!config.guilds[GUILD]) config.guilds[GUILD] = {};
      
      if (req.body.welcome) {
        config.guilds[GUILD].welcome = { 
          ...config.guilds[GUILD].welcome, 
          ...req.body.welcome 
        };
      }
      
      if (req.body.goodbye) {
        config.guilds[GUILD].goodbye = { 
          ...config.guilds[GUILD].goodbye, 
          ...req.body.goodbye 
        };
      }
      
      writeConfig(config);
      res.json({ success: true });
    } catch (err) {
      console.error('[API Welcome] Error saving:', err);
      res.status(500).json({ error: 'Failed to save config' });
    }
  });
  
};

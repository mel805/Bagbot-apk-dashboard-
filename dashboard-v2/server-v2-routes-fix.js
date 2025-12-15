// Fix routes
const routes = [
  { path: ['/', '/index.html'], file: 'redirect.html' },
  { path: '/dash', file: 'index-v2-27oct.html' },
  { path: '/test-cache', file: 'test-cache.html' },
  { path: '/music', file: 'music.html' },
  { path: '/test', file: 'test.html' }
];

routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(__dirname, route.file));
  });
});

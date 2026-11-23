/**
 * The mock API: json-server's usual REST routes over db.json, plus a bulk route
 * that saves a board column's new order in one request.
 */
const path = require('path');
const jsonServer = require('json-server');

const PORT = 3030;
const DELAY_MS = 1000;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// So the app's loading states can be seen
server.use((req, res, next) => setTimeout(next, DELAY_MS));

/**
 * PUT /tasks/bulk with an array of full tasks: replaces each task by its id and
 * returns them. Nothing is saved if any id is unknown.
 * Registered before the router, which would otherwise read "bulk" as a task id.
 */
server.put('/tasks/bulk', (req, res) => {
  const tasks = req.body;
  if (!Array.isArray(tasks)) {
    res.status(400).json({ error: 'Expected an array of tasks' });
    return;
  }

  const unknownIds = tasks
    .filter((task) => !router.db.get('tasks').getById(task.id).value())
    .map((task) => task.id);
  if (unknownIds.length > 0) {
    res.status(404).json({ error: `Unknown task ids: ${unknownIds.join(', ')}` });
    return;
  }

  for (const task of tasks) {
    router.db.get('tasks').replaceById(task.id, task).value();
  }
  router.db.write();
  res.json(tasks);
});

server.use(router);

server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});

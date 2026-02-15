const {createServer} = require("./createServer");
const {routes} = require("./routes");

const PORT = 3000
const HOSTNAME = "localhost";

const server = createServer({
  hostname: HOSTNAME, routes
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`GraphMaker backend listening on port http://${HOSTNAME}:${PORT}`);
});
import {createServer} from "./createServer";
import {routes} from "./routes";

const PORT = 3000
const HOSTNAME = "0.0.0.0";

const server = createServer({
  hostname: HOSTNAME, routes
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`GraphMaker backend listening on port http://${HOSTNAME}:${PORT}`);
});
const net = require('net');

const checkPort = (port) => {
  const server = net.createServer().listen(port, '127.0.0.1');
  server.on('listening', () => {
    server.close();
    console.log(`Port ${port} is FREE`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is IN USE (This is good if backend is running)`);
    } else {
      console.log(`Port ${port} error: ${err.message}`);
    }
  });
};

checkPort(5000);

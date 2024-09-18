import express from "express";
import https from "httpolyglot";
import fs from "fs";
import path from "path";
import mediasoup from "mediasoup";
import { Server } from "socket.io";

const __dirname = path.resolve();

const app = express();

app.get("/", (req, res) => {
  res.send("hello from mediasoup");
});
app.use("/sfu", express.static(path.join(__dirname, "public")));

const options = {
  //   key: fs.readFileSync("./server/ssl/key/.pem", "utf-8"),
  //   cert: fs.readFileSync("./server/ssl/cert/.pem", "utf-8"),
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(3000, () => {
  console.log("listening to the port" + 3000);
});
const io = new Server(httpsServer);
const peers = io.of("/mediasoup");

let worker;
let router;
let produceTransport;
let consumerTransport;
const createWorker = async () => {
  worker = await mediasoup.createWorker({ rtcMinPort: 2000, rtcMaxPort: 2020 });
  console.log(`worker pid ${worker.pid}`);
  worker.on("died", (error) => {
    console.log("mediasoup worker has died");
    setTimeout(() => process.exit(1), 2000);
  });
  return worker;
};
worker = createWorker();

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

peers.on("connection", async (socket) => {
  console.log(socket.id);
  socket.emit("connection-success", { socketId: socket.id });
  socket.on("disconnect", () => {
    console.log("Peer disconnected");
  });

  router = await worker.createRouter({ mediaCodecs });

  socket.on("getRtpCapabilities", (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    console.log("rtpCapabilities", rtpCapabilities);
    callback({ rtpCapabilities });
  });
  socket.on("createWebrtcTransport", async ({ sender }, callback) => {
    console.log(`Is this a sender request?${sender}`);
    if (sender) produceTransport = await CreateWebRtcTransport(callback);
    else consumerTransport = await CreateWebRtcTransport(callback);
  });
});

const createWebRtcTransport = async (callback) => {
  try {
    const webRtcTransport_options = {
      listenIps: [
        {
          ip: "192.168.0.151",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };
    let transport = await router.createWebRtcTransport(webRtcTransport_options);
    console.log(`transport id:${transport.id}`);
    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
      }
    });
    transport.on("close", () => {
      console.log("transport closed");
    });
    callback({
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters(),
        iceCandidates: transport.iceCandidates(),
        dtlsParameters: transport.dtlsParameters(),
      },
    });
    return transport;
  } catch (err) {
    console.log(err);
    callback({
      params: { error: error },
    });
  }
};

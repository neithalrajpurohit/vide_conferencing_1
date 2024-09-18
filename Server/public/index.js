const io = require("socket.io-client");
const socket = io("/mediasoup");


socket.on("connection-success", ({ socketId }) => {
  console.log(socketId, "knkln");
});

let device = {};
let params = {
  //
};

const streamSuccess = async (stream) => {
  localVideo.srcObject = stream;
  const track = stream.getVideoTracks()[0];
  params = {
    track,
    ...params,
  };
};

const getLocalStream = () => {
  navigator.getUserMedia(
    {
      audio: false,
      video: {
        width: {
          min: 640,
          max: 1920,
        },
        height: {
          min: 400,
          max: 1080,
        },
      },
    },
    streamSuccess,
    (error) => {
      console.log(error.message);
    }
  );
};

const createDevice = async () => {
  try {
    device = new mediaSoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    console.log("Rtp Capabilities", rtpCapabilities);
  } catch (err) {
    console.log(error);
    if (error.name === "UnsupportedError") {
      console.log("Browser not supported");
    }
  }
};
const getRtpCapabilities = () => {
  socket.emit("getRtpCapabilities", (rtpCapabilities) => {
    console.log(`Router rtp capabilities...${rtpCapabilities}`);
  });
};

const createSendTransport = () =>{
    socket.emit('createWebRtcTransport',{sender:true},({params})=>{
        {
            if (params.error){
                console.log(params.error)
                return
            }
            console.log(params)
        }
    })
}
btnLocalVideo.addEventListener("click", getLocalStream);
btnRtpCapabilities.addEventListener("click", getRtpCapabilities);
btnDevice.addEventListener("click"createDevice);
btnCreateSendTransport.addEventListener("click",createSendTransport)

import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import { useEffect } from "react";

import { Canvas, useLoader } from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei/core/OrbitControls.js";
// import { OrthographicCamera } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import CatAnimations from "../../assets/players/Cat_Animations.js";
import { SkyTube } from "../../assets/deco/SkyTube.js";
import { ObjectTest } from "../../assets/deco/ObjectTest.js";
import { CampingPack } from "../../assets/deco/CampingPack.js";
// import { FireAnimated } from "../../assets/deco/FireAnimated.js";
import { Polaroid } from "../../assets/deco/Polaroid.js";
import { CartoonCampingKit } from "../../assets/deco/CartoonCampingKit.js";
import { FireAnimated } from "../../assets/deco/FireAnimated.js";
import { Notebook } from "../../assets/deco/Notebook.js";

import ReverseNavbar from "../organisms/ReverseNavbar.jsx";
import TravelWriteModal from "../organisms/TravelWriteModal.jsx";
import ReverseFooter from "../organisms/ReverseFooter.jsx";
import { getArchiveDetail } from "../../api/reverse.js";
import { useLocation } from "react-router-dom";
import TravelReadModal from "../organisms/TravelReadModal.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setInfo } from "../../modules/reverse.js";
import { Vector3 } from "three";
import DogAnimations from "../../assets/players/Dog_Animations.js";

var channels = [];
var channelUsers = new Map();
var friendToName = new Map();
var audioMap = new Map();
var rtcPeers = new Map();
var ws1;
let localStream;
let audioMapIdx = 0;

function Reverse() {
  // default action = idle
  // const [characterPosition, setCharacterPosition] = useState();
  const [destinationPoint, setDestinationPoint] = useState(new Vector3(-30, 0, -30));
  const destRef = useRef(destinationPoint);
  const floorTexture = useLoader(TextureLoader, "/textures/grid.png");
  if (floorTexture) {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.x = 10;
    floorTexture.repeat.y = 10;
  }
  const [visible, setVisible] = useState(false);
  const handleVisible = (data) => {
    setVisible(data);
  };

  // orthographic camera
  const aspect = window.innerWidth / window.innerHeight;

  const [isPressed, setIsPressed] = useState(false);
  const [others, setOthers] = useState([]);
  const [userId, setUserId] = useState("");
  const othersRef = useRef(others);
  const addOther = (value) => {
    setOthers((others) => {
      let temp = [...others, value];
      othersRef.current = temp;
      return temp;
    });
  };
  const removeOther = (value) => {
    setOthers((others) => {
      console.log(value);
      console.log(others);
      let temp = othersRef.current.filter((other) => other !== value);
      console.log(temp);
      othersRef.current = temp;
      return temp;
    });
  };
  // const [otherCharacterMap, setMap] = useState({});
  const [otherCharacterMap, setMap] = useState(new Map());
  const addMap = (key, value) => {
    setMap((prev) => new Map([...prev, [key, value]]));
  };
  const upsertMap = (key, value) => {
    setMap((prev) => new Map(prev).set(key, value));
  };
  const deleteMap = (key) => {
    setMap((prev) => {
      const newState = new Map(prev);
      newState.delete(key);
      return newState;
    });
  };
  // const [archiveId, setArchiveId] = useState("");
  const [rtcPeers2, setRtcPeers2] = useState("");

  useEffect(() => {
    console.log(others);
    othersRef.current = others;
  }, [others]);
  useEffect(() => {
    // console.log(otherCharacterMap);
  }, [otherCharacterMap]);
  useEffect(() => {
    // console.log(destRef.current);
    destRef.current = destinationPoint;
    // console.log(destRef.current);
    // console.log(destinationPoint);
  }, [destinationPoint]);

  const preventClose = (e) => {
    // console.log(e)
    // e.preventDefault();
    disconnectAll();
    // console.log(e);
    // console.log("hihihihi");
    // e.returnValue = ""; //Chrome에서 동작하도록; deprecated
  };
  // console.log(preventClose);
  useEffect(() => {
    (() => {
      window.addEventListener("unload", preventClose);
    })();
    console.log(loginUser);
    login();
  }, []);
  var signal1 = {
    userId: null,
    type: null,
    data: null,
    toUid: null,
    archiveId: null,
  };
  var channelData = {
    userId: null,
    data: null,
    type: null,
  };
  // const archiveidHandle = (e) => {
  //   setArchiveId(e.target.value);
  // };
  var userId2 = "";

  const webrtcRedux = useSelector((state) => state.webrtc);
  useEffect(() => {
    if (localStream) {
      if (webrtcRedux.micCheck) {
        localStream.getAudioTracks().forEach((element) => {
          element.enabled = true;
        });
      } else {
        localStream.getAudioTracks().forEach((element) => {
          element.enabled = false;
        });
      }
      console.log(localStream.getAudioTracks());
    }
  }, [webrtcRedux.micCheck]);
  useEffect(() => {
    const audioSet = document.getElementById("user-audio").childNodes;
    if (audioSet) {
      if (webrtcRedux.headCheck) {
        for (let i = audioSet.length - 1; i >= 0; i--) {
          audioSet[i].muted = false;
        }
      } else {
        for (let i = audioSet.length - 1; i >= 0; i--) {
          audioSet[i].muted = true;
        }
      }
      console.log(audioSet);
    }
  }, [webrtcRedux.headCheck]);
  // ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ
  async function login() {
    await navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true } })
      .then(handleAudio)
      .catch((e) => {
        //console.lo(e);
      });
    startWebSocket();
  }
  function handleAudio(stream) {
    localStream = stream;
    const audio = document.getElementById("myAudio");
    //console.lo(audio);
    const audioTracks = localStream.getAudioTracks();
    //console.lo(audioTracks);
    localStream.oninactive = function () {
      //console.lo("stream ended");
    };
    // window.stream = localStream;
    audio.srcObject = localStream;
  }

  function startWebSocket() {
    console.log("startWebSocket");
    ws1 = new WebSocket("wss://re-verse.co.kr/socket");
    // console.log(ws1);

    ws1.onopen = (event) => {
      signal1.userId = "";
      signal1.type = "Login";
      signal1.data = "";
      signal1.archiveId = archiveId;
      ws1.send(JSON.stringify(signal1));
    };

    ws1.onerror = (error) => {
      alert("Error connecting to signalling server, please try login again");
    };

    ws1.onclose = (event) => {
      console.log(channels);
      console.log(channelUsers);
      console.log(friendToName);
      console.log(audioMap);
      console.log(rtcPeers);
      // document.getElementById("status-offline").style.display = "block";
      // document.getElementById("status-online").style.display = "none";
      // document.getElementById("myUsername").removeAttribute("readOnly");
      // let myStatus = document.getElementById("myStatus");
      // myStatus.className = "status orange";
      // document.getElementById("h3-myStatus").innerText = "offline";
      // document.getElementById("h3-myStatus").appendChild(myStatus);
      // document.getElementById("btnLogin").style.display = "block";
      // document.getElementById("toSend").setAttribute("disabled", "true");
      // document.getElementById("btnSend").setAttribute("disabled", "true");
    };

    ws1.onmessage = (event) => {
      var data1 = JSON.parse(event.data);
      // console.log(data1);
      var data2 = null;
      console.log("here is onmessage");
      if (data1.userId === userId2 || data1.userId.length < 2) {
        return;
      } else if (data1.type === "NewMember") {
        handleNewMemberAndOffer(data1);
      } else if (data1.type === "UserId") {
        setUserId(data1.data);
        userId2 = data1.data;
        // document.getElementById("status-offline").style.display = "none";
        // document.getElementById("status-online").style.display = "block";
        // document.getElementById("toSend").removeAttribute("disabled");
        // document.getElementById("btnSend").removeAttribute("disabled");
        // document.getElementById("btnLogin").style.display = "none";
        // document.getElementById("myUsername").setAttribute("readOnly", "true");

        // let myStatus = document.getElementById("myStatus");
        // myStatus.className = "status green";
        // document.getElementById("h3-myStatus").innerText = "online";
        // document.getElementById("h3-myStatus").appendChild(myStatus);
        // document.getElementById('btnShowLogin').click();
        // alert(
        //   "Connected to Signalling Server. Please click the Show Login/Chat button"
        // );
        newMember(userId2);
      } else if (data1.type === "Offer") {
        data2 = JSON.parse(data1.data);
        console.log("Receive offer:");
        handleNewMemberAndOffer(data1);
      } else if (data1.type === "Ice") {
        data2 = JSON.parse(data1.data);
        if (data2) {
          let peer1 = rtcPeers.get(data1.userId);

          if (peer1) {
            peer1.addIceCandidate(new RTCIceCandidate(data2)).catch((error) => {});
          }
        }
      } else if (data1.type === "Answer") {
        console.log("Receive answer:");
        data2 = JSON.parse(data1.data);
        // console.log(data2);
        let peer1 = rtcPeers.get(data1.userId);
        peer1.setRemoteDescription(new RTCSessionDescription(data2));
      }
    };
  }

  function handleNewMemberAndOffer(data1) {
    console.log("handle new member");
    let data3 = JSON.parse(data1.data);
    let peerId = data1.userId;
    // console.log(peerId);
    let rtcPeer = new RTCPeerConnection({
      offerToReceiveAudio: true,
      iceServers: [
        {
          urls: "stun:re-verse.co.kr:8997",
        },
        // {
        //   urls: "turn:re-verse.co.kr:8997?transport=tcp",
        //   username: "reverse",
        //   credential: "flQjtm1024",
        // },
      ],
    });
    // console.log(localStream);
    localStream.getTracks().forEach((track) => {
      console.log("in the rtcpeer make phase track");
      rtcPeer.addTrack(track, localStream);
    });

    setRtcPeers2(rtcPeers2);

    if (data1.type === "NewMember") {
      let channel1 = rtcPeer.createDataChannel(Math.floor(Math.random() * 10000000000));
      channelConfig(channel1);

      //create offer
      rtcPeer
        .createOffer()
        .then((a) => {
          console.log("Sending offer");
          // console.log(a);
          signal1.userId = userId2;
          signal1.type = "Offer";
          signal1.data = JSON.stringify(a);
          signal1.toUid = data1.userId;
          ws1.send(JSON.stringify(signal1));
          rtcPeer.setLocalDescription(a);
        })
        .then(() => {})
        .catch((err) => {
          console.log("Error Offer:" + err);
        });
    }
    //when not new member
    else {
      let data2 = JSON.parse(data1.data);
      console.log("Sending answer");
      rtcPeer.setRemoteDescription(data2).then(() => {
        rtcPeer.createAnswer().then((a) => {
          signal1.userId = userId2;
          signal1.type = "Answer";
          signal1.data = JSON.stringify(a);
          signal1.toUid = data1.userId;
          rtcPeer.setLocalDescription(a);
          ws1.send(JSON.stringify(signal1));
        });
      });
    }
    rtcPeer.ondatachannel = (event) => {
      let channel2 = event.channel;
      channelConfig(channel2, peerId);
    };
    rtcPeer.ontrack = (event) => {
      console.log("here is ontrack phase");
      // console.log("this is answer ontrack");
      // console.log(friendToName);
      // console.log(peerId);

      // console.log(audioMap.size());
      // audioMap.set(peerId, "audio" + audioMap.size());
      // console.log(audioMap);

      let newUser = document.createElement("li");
      let div1 = document.createElement("div");
      let h2 = document.createElement("h2");
      h2.innerText = peerId;
      let div2 = document.createElement("div");
      let userAudio = document.createElement("audio");
      userAudio.id = peerId;
      console.log("this is userAudio id : " + userAudio.id);
      userAudio.autoplay = true;
      userAudio.controls = true;
      userAudio.hidden = true;
      div2.appendChild(userAudio);
      div1.appendChild(h2);
      newUser.appendChild(div1);
      newUser.appendChild(div2);
      document.getElementById("user-audio").appendChild(userAudio);
      const peerAudio = document.getElementById(peerId);
      // console.log(event.streams);
      // if (peerAudio.srcObject !== event.streams[0]) {
      peerAudio.srcObject = event.streams[0];
      // }
      // console.log(event.streams);
      //console.lo(audioComp);
      //console.lo(peerAudio);
    };
    rtcPeer.onicecandidate = (event) => {
      if (event.candidate) {
        signal1.userId = userId2;
        signal1.type = "Ice";
        signal1.data = JSON.stringify(event.candidate);
        signal1.toUid = data1.userId;
      }
      if (event.candidate) {
        if (Object.keys(event.candidate.candidate).length > 1) {
          ws1.send(JSON.stringify(signal1));
        }
      }
    };
    rtcPeer.onicecandidateerror = (event) => {
      console.log("ice error");
    };

    rtcPeer.onicegatheringstatechange = (event) => {
      console.log("ice change phase");
      console.log(event);
    };

    // rtcPeer.oniceconnectionstatechange = (event) => {};

    rtcPeers.set(peerId, rtcPeer);
  }
  function channelConfig(channel1, peerId) {
    channel1.onclose = (event) => {
      console.log("Close channel:");
      // console.log(channel1);
      // console.log(event);
      // console.log(channelUsers);
      let friendId = channelUsers.get(channel1);
      let friendName = friendToName.get(friendId);
      // console.log(peerId);
      // console.log(friendId);
      // console.log(event);
      // console.log(friendName);
      // console.log("=======================");
      // if (peerId) document.getElementById(peerId).remove();
      // else
      if (friendName) {
        document.getElementById(friendId).remove();
        removeOther(friendName);
        deleteMap(friendName);
        // console.log(othersRef.current);
      }
      // console.log(friendId);
      addUserOnChat(friendToName.get(friendId), false);
      friendToName.delete(friendId);
    };

    channel1.onmessage = (event) => {
      //console.lo("Receive msg datachannel:" + event.data);
      let dataChannel1 = JSON.parse(event.data);
      // console.log(dataChannel1);
      if (dataChannel1.type === "message") {
        addChatLine(dataChannel1.data, "you", dataChannel1.userId);
      } else if (dataChannel1.type === "handshake") {
        console.log("this is handshake phase");
        // console.log(dataChannel1);
        // setOthers((other) => {
        //   return [...other, dataChannel1.userId];
        // });
        // setMap((other) => ({
        //   ...other,
        //   [dataChannel1.userId]: dataChannel1.data.position,
        // }));
        // setOthers((other) => {
        //   return [...other, dataChannel1.userId];
        // });
        // upsertMap(dataChannel1.userId, dataChannel1.data.position);

        // otherCharacterMap.set(dataChannel1.userId, dataChannel1.data.position);
        friendToName.set(dataChannel1.data.uuid, dataChannel1.data.username);
        // addUser(dataChannel1.data, dataChannel1.userId);
        channelUsers.set(channel1, dataChannel1.data.uuid);
        // console.log(friendToName);
        // console.log(channelUsers);
        upsertMap(dataChannel1.userId, dataChannel1.data.position);
        setOthers((other) => {
          return [...other, dataChannel1.userId];
        });
      } else if (dataChannel1.type === "move") {
        console.log("==================== moving phase");
        // setMap((other) => ({
        //   ...other,
        //   [dataChannel1.userId]: dataChannel1.data,
        // }));
        upsertMap(dataChannel1.userId, dataChannel1.data);
      }
    };

    channel1.onopen = () => {
      //console.lo("Now it's open");
      console.log("here is datachannel open");
      channelData.userId = loginUser.nickname;
      channelData.type = "handshake";
      // console.log(peerId);
      // console.log(destRef.current);
      channelData.data = {
        position: { x: destRef.current.x, y: 1, z: destRef.current.z },
        username: loginUser.nickname,
        uuid: userId2,
      };
      channel1.send(JSON.stringify(channelData));
    };
    channels.push(channel1);
  }
  function addChatLine(data1, listClass, pengirim) {
    let list = document.createElement("li");
    list.className = listClass;
    let entete = document.createElement("div");
    entete.className = "entete";
    let span1 = document.createElement("span");
    let h2 = document.createElement("h2");
    let h3 = document.createElement("h3");
    h2.innerText = pengirim;
    h2.className = "m-2";
    h3.innerText = new Date().toLocaleTimeString();
    entete.appendChild(h3);
    entete.appendChild(h2);

    let triangle = document.createElement("div");
    triangle.className = "triangle";
    let message = document.createElement("message");
    message.className = "message";
    message.innerHTML = data1;
    list.appendChild(entete);
    if (listClass === "you") {
      list.appendChild(triangle);
    }
    list.appendChild(message);

    let chatWindow = document.getElementById("chat");
    chatWindow.appendChild(list);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  function addUserOnChat(pengirim, join1) {
    let chatWindow = document.getElementById("chat");
    let child1 = document.createElement("p");
    if (join1) {
      child1.className = "text-white text-center m-2 bg-success";
      child1.innerText = pengirim + " joined";
    } else {
      child1.className = "text-white text-center m-2 bg-danger";
      child1.innerText = pengirim + " leaved";
    }

    chatWindow.appendChild(child1);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function sendChat() {
    console.log("here is sendchat");
    channels.forEach((a) => {
      let dataToSend = document.getElementById("toSend").value;
      channelData.userId = loginUser.nickname;
      channelData.type = "message";
      channelData.data = dataToSend;
      //console.lo("Send chat:" + JSON.stringify(channelData));
      if (a.readyState === "open") {
        a.send(JSON.stringify(channelData));
      }
    });
    addChatLine(document.getElementById("toSend").value, "me", "Me");
    document.getElementById("toSend").value = "";
  }

  function sendPosition(position) {
    channels.forEach((a) => {
      channelData.userId = loginUser.nickname;
      channelData.type = "move";
      channelData.data = position;
      //console.lo("Send chat:" + JSON.stringify(channelData));
      if (a.readyState === "open") {
        a.send(JSON.stringify(channelData));
      }
    });
  }
  function newMember(data1) {
    signal1.userId = data1;
    signal1.type = "NewMember";
    signal1.toUid = "signaling";
    signal1.data = "Join";
    signal1.archiveId = archiveId;
    ws1.send(JSON.stringify(signal1));
  }

  function disconnectAll() {
    ws1.close();
    rtcPeers.forEach((a, b) => {
      const senders = a.getSenders();

      // 만약 안들린다면 삭제해보기
      senders.forEach((sender) => a.removeTrack(sender));
      // localStream.getTracks().forEach((track))
      // localStream.getTracks().forEach((track)=>a.removeTrack(track));
      a.close();
    });
    // localStream.getTracks().forEach((track) => track.stop());
    console.log("disconnect phase");
    const audioSet = document.getElementById("user-audio").childNodes;
    for (let i = audioSet.length - 1; i >= 0; i--) {
      audioSet[i].remove();
    }
    for (let i = others.length - 1; i >= 0; i--) {
      console.log(others[i]);
      removeOther(others[i]);
      console.log(othersRef.current);
    }
    rtcPeers.clear();
    audioMap.clear();
    channels = [];
    // channelUsers.forEach((a, b) => document.getElementById(a).remove());
    channelUsers.clear();
  }

  //ddddddddddddddddddddddddddddddd
  const location = useLocation();
  console.log(location.pathname);
  console.log(location.pathname.substring(9));
  const archiveId = location.pathname.substring(9);
  const loginUser = useSelector((state) => state.user.loginUser);

  const dispatch = useDispatch();
  const reverse = useSelector((state) => state.reverse);

  useEffect(() => {
    getArchiveDetail(archiveId, getArchiveDetailSuccess, getArchiveDetailFail);
  }, []);

  const getArchiveDetailSuccess = (res) => {
    console.log(res);
    dispatch(
      setInfo({
        ...reverse.info,
        archiveId: archiveId,
        stuffs: res.data.stuffs,
      })
    );
  };

  const getArchiveDetailFail = (err) => {
    console.log(err);
  };
  // default action = idle
  const refCanvas = useRef();
  const [action, setAction] = useState("Idle_A");
  // const [characterPosition, setCharacterPosition] = useState();
  // const [destinationPoint, setDestinationPoint] = useState();
  // const floorTexture = useLoader(TextureLoader, "/textures/grid.png");
  // if (floorTexture) {
  //   floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  //   floorTexture.repeat.x = 10;
  //   floorTexture.repeat.y = 10;
  // }

  // orthographic camera
  // const aspect = window.innerWidth / window.innerHeight;

  // // test object
  // const [visible, setVisible] = useState(false);
  // const handleVisible = (data) => {
  //   setVisible(data);
  // };

  return (
    <div className="h-screen overflow-hidden relative">
      <audio id="myAudio" autoPlay hidden muted controls></audio>
      <div className="w-full h-[0.15] absolute z-10">
        <ul id="user-audio"></ul>
      </div>
      <div className="w-full h-[0.15] absolute z-10">
        <ReverseNavbar />
      </div>
      {/* <div className="w-1/4 h-2/5 absolute z-20 bottom-0">
        <ReverseFooter />
      </div> */}

      {/* chatting */}
      <div className="w-1/4 h-2/5 absolute z-20 bottom-0">
        <ul id="chat" className="h-[80%] border overflow-y-scroll">
          {/* <li className="you">
                  <div className="entete">
                    <span className="status green"></span>
                    <h2>Vincent</h2>
                    <h3>10:12AM, Today</h3>
                  </div>
                  <div className="triangle"></div>
                  <div className="message">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                  </div>
                </li> */}
          {/* <li className="me">
                  <div className="entete">
                    <h3 >10:12AM, Today</h3>
                    <h2 className='m-2'>Vincent</h2>
                    
                  </div>
                  <div className="triangle"></div>
                  <div className="message">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                  </div>
                </li> */}
        </ul>
        <main className="h-[10%]">
          <footer>
            <textarea placeholder="Type your message" id="toSend"></textarea>
            <button id="btnSend" onClick={() => sendChat()}>
              Send
            </button>
            <br />
            <br />
            <div className="col-md-12 text-center bg-black text-white">
              <p>
                Copyright ©<script>document.write(new Date().getFullYear());</script>
                2022 Rizky Satrio All rights reserved
              </p>
            </div>
          </footer>
        </main>
      </div>
      {/* chatting */}

      <Canvas
        ref={refCanvas}
        shadows
        orthographic
        dpr={[1, 2]}
        camera={{
          // player의 초기 위치: [-30, 0, -30]
          position: [-29, 5, -25],
          // position: [1, 5, 5],
          left: `-${aspect}`,
          right: `${aspect}`,
          top: 1,
          bottom: -1,
          zoom: 28,
          near: -1000,
          far: 1000,
        }}
      >
        {/* // TODO: 컴포넌트 배치할 때에는 키고 하는게 편함 */}
        <OrbitControls />
        {/* camera */}
        {/* perspective; 원근감 o, ortho; 원근감 x */}
        {/* light */}
        <directionalLight
          intensity={0.4}
          position={[-50, 50, 50]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={-100}
          shadow-camera-far={2000}
          shadow-camera-left={-2000}
          shadow-camera-right={2000}
          shadow-camera-top={2000}
          shadow-camera-bottom={-2000}
        />
        <ambientLight intensity={0.3} />
        <spotLight intensity={0.5} position={[100, 1000, 100]} />
        {/* character */}
        <Suspense fallback={null}>
          {/* // TODO: 오브젝트 배치할 때에는 캐릭터 빼고 하는게 좋아 */}
          {others.map((other, idx) => {
            console.log(other);
            console.log(others);
            // console.log(idx);
            console.log(otherCharacterMap);
            // console.log(otherCharacterMap[other]);
            return (
              <DogAnimations
                key={idx}
                // action={action}
                destinationPoint={otherCharacterMap.get(other)}
                // isPressed={isPressed}
                handleVisible={handleVisible}
                userName={other}
                // handleCurrentPosition={handleCurrentPosition}
              />
            );
          })}
          <CatAnimations
            destinationPoint={destinationPoint}
            handleVisible={handleVisible}
            // handleEvent={handleEvent}
          />

          <SkyTube />
          <ObjectTest visible={visible} />
          {/* <ObjectTest currentPosition={currentPosition} /> */}
          <CampingPack />
          <CartoonCampingKit />
          <FireAnimated />

          {/* polaroid = 글 보기 오브젝트 , notebook = 글 쓰기 오브젝트 */}
          <Polaroid />
          <Notebook />
          {/* <Polaroid event={event} />
          <Notebook event={event} /> */}
          {/* <Polaroid position={new THREE.Vector3(38.5, 0.8, -70)} /> */}
        </Suspense>
        {/* floor */}
        <mesh
          onPointerDown={(e) => {
            setDestinationPoint(e.point);
            sendPosition(e.point);
          }}
          rotation={[-0.5 * Math.PI, 0, 0]}
          receiveShadow
        >
          <planeBufferGeometry attach="geometry" args={[300, 300]} />
          <meshStandardMaterial map={floorTexture} />
        </mesh>

        {/* pointer mesh; 클릭할 때 내가 어디로 가는지 확인하려고,, 나중에 지울지도 */}
        <mesh rotation={[-0.5 * Math.PI, 0, 0]} position={[-30, 0.01, -30]} receiveShadow>
          <planeBufferGeometry attach="geometry" args={[5, 5]} />
          <meshBasicMaterial color="black" transparent opacity={0.3} />
        </mesh>
      </Canvas>
      {/* // TODO: travel = 0, anniv = 1, diary = 2 */}
      {reverse.info.stuffs.length > 0 && (
        <>
          <TravelWriteModal
          // archiveId={reverse.info.archiveId}
          // stuffId={reverse.info.stuffsId[0]}
          />
          <TravelReadModal
          // archiveId={reverse.info.archiveId}
          // stuffId={reverse.info.stuffsId[0]}
          />
        </>
      )}
    </div>
  );
}

export default Reverse;

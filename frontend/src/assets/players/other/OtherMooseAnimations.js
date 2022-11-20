/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/
import * as THREE from "three";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import GLTFLoader from "gltfjsx/src/utils/glftLoader";
import { useFrame, useGraph } from "@react-three/fiber";
import { Vector3 } from "three";
import { useBox } from "@react-three/cannon";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
export default function OtherMooseAnimations({
  action,
  destinationPoint,
  handleCurrentPosition,
  handleVisible,
  userName,
}) {
  const group = useRef();
  // const previousAction = usePrevious(action);
  const { scene, materials, animations } = useGLTF(
    "/assets/animals/GLTF/Animations/Moose_Animations.gltf",
  );
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  // console.log(nodes);
  const { actions } = useAnimations(animations, group);
  const [initPosition, setInitPosition] = useState();
  const [moving, setMoving] = useState(false);
  const moveRef = useRef(moving);
  let angle = 0;

  // 이벤트 발생할 오브젝트의 좌표
  const objectPosition = new THREE.Vector3(-20, 0.01, 3);
  // console.log(objectPosition);
  // const [visible, setVisible] = useState(false);
  useEffect(() => {
    // console.log("destination point");
    // console.log(destinationPoint);
    setInitPosition(new Vector3(destinationPoint.x, 0, destinationPoint.z));
  }, []);
  useEffect(() => {
    // console.log("destination point");
    // console.log(destinationPoint);
    setInitPosition(new Vector3(destinationPoint.x, 0, destinationPoint.z));
  }, [userName]);
  useEffect(() => {
    if (destinationPoint) {
      // setMoving(true);
      setMoving((prev) => {
        moveRef.current = true;
        // console.log(moveRef);
        prev = true;
      });
      // console.log(123123);
      // console.log(destinationPoint);
      // console.log(group.current); // player.modelmesh
      // console.log(group.current.lookAt(destinationPoint));
      group.current.lookAt(
        new Vector3(destinationPoint.x, 0, destinationPoint.z),
      );
      group.current.name = userName;
      // console.log(group.current.name);
      // console.log(group.current);
    }
  }, [destinationPoint]);
  const [isCollided, setCollision] = useState(false);
  const [ref, api] = useBox(() => ({
    rotation: [0, 0, 0],
    mass: 10,
    args: [1.5, 1.5, 1.5],
    // type: "Static",
    // args: [1, 5, 1],
    position: [destinationPoint.x, 1.1, destinationPoint.z],
    onCollideBegin: (e) => {
      console.log("아야");
      console.log(e);
      // setMoving(false);
      setCollision(true);
      actions["Walk"].stop();
      actions["Idle_A"].play();
    },
  }));
  useFrame((state) => {
    actions["Idle_A"].play();
    if (group.current) {
      // state.camera.lookAt(group.current.position);
    }

    if (group.current) {
      if (moveRef.current) {
        angle = Math.atan2(
          destinationPoint.z - group.current.position.z,
          destinationPoint.x - group.current.position.x,
        );
        if (isCollided) {
          group.current.position.x -= Math.cos(angle) * 0.5;
          group.current.position.z -= Math.sin(angle) * 0.5;
          destinationPoint.x = group.current.position.x;
          destinationPoint.z = group.current.position.z;
          setMoving(false);
          setCollision(false);
        } else {
          group.current.position.x += Math.cos(angle) * 0.2;
          group.current.position.z += Math.sin(angle) * 0.2;
        }
        api.position.set(group.current.position.x, 0, group.current.position.z);

        // state.camera.position.x = 1 + group.current.position.x;
        // state.camera.position.z = 5 + group.current.position.z;

        // console.log(group.current.position);

        // handleCurrentPosition(group.current.position);

        actions["Idle_A"].stop();
        actions["Walk"].play();
        // console.log("우리 강아지 걷는다");

        if (
          Math.abs(destinationPoint.x - group.current.position.x) < 0.1 &&
          Math.abs(destinationPoint.z - group.current.position.z) < 0.1
        ) {
          // setMoving(false);
          setMoving((prev) => {
            // console.log(moveRef);
            moveRef.current = false;
            prev = false;
          });
          actions["Walk"].stop();
          actions["Idle_A"].play();
          // console.log("우리 강아지 멈춘다");
        }

        // 오브젝트 visible event
        if (
          Math.abs(objectPosition.x - group.current.position.x) < 4 &&
          Math.abs(objectPosition.z - group.current.position.z) < 4
        ) {
          handleVisible(true);
          // setVisible(true);
        } else {
          handleVisible(false);
        }
      }
      api.position.set(group.current.position.x, 0, group.current.position.z);
    }
  });

  // useEffect(() => {
  //   if (previousAction) {
  //     actions[previousAction].fadeOut(0.2);
  //     actions[action].stop();
  //   }
  //   actions[action].play();
  //   actions[action].fadeIn(0.2);
  //   // actions.Idle_A.play();
  // }, [actions, action, previousAction]);
  return (
    <group>
      <group ref={group} position={initPosition}>
        <group>
          <group scale={2}>
            <primitive object={nodes.root} />
            <skinnedMesh
              geometry={nodes.Moose.geometry}
              material={materials.M_Moose}
              skeleton={nodes.Moose.skeleton}
              morphTargetDictionary={nodes.Moose.morphTargetDictionary}
              morphTargetInfluences={nodes.Moose.morphTargetInfluences}
              // 그림자 설정은 여기에!
              castShadow
              // receiveShadow
            />
          </group>
        </group>
      </group>
      <mesh ref={ref} castShadow={true}>
        {/* <boxGeometry args={[1.5, 1.5, 1.5]} /> */}
        <meshLambertMaterial color={"hotpink"} />
      </mesh>
    </group>
  );
}

// useGLTF.preload("/Moose_Animations.gltf");

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

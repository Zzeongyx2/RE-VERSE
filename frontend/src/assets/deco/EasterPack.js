/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: L3X (https://sketchfab.com/L3X)
license: SKETCHFAB Standard (https://sketchfab.com/licenses)
source: https://sketchfab.com/3d-models/easter-picnic-pack-7dac71c6f31b45bebb38a9ba55a8ebe2
title: Easter Picnic Pack
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function EasterPack(props) {
  const { nodes, materials } = useGLTF("/assets/easter_picnic_pack/scene.gltf");
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <group
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.1}
            position={[-85, 0, 90]}
          >
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Ground_0.geometry}
              material={materials.Mat_Ground}
            />
            <mesh
              geometry={nodes["Easter_Picnic_Pack_02_-_Default_0"].geometry}
              material={materials["02_-_Default"]}
            />
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Ester_Basket_0.geometry}
              material={materials.Mat_Ester_Basket}
            />
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Easter_Blanket_0.geometry}
              material={materials.Mat_Easter_Blanket}
            />
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Leaves_01_0.geometry}
              material={materials.Mat_Leaves_01}
            />
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Leaves_02_0.geometry}
              material={materials.Mat_Leaves_02}
            />
            <mesh
              geometry={nodes.Easter_Picnic_Pack_Mat_Clovers_0.geometry}
              material={materials.Mat_Clovers}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/scene.gltf");

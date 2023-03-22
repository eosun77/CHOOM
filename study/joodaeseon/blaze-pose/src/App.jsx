import React, { useEffect, useRef } from "react";

import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/pose";

import { Camera } from "./apis/camera";
import { STATE } from "./apis/params";
import { setBackendAndEnvFlags } from "./apis/util";

import "./App.css";

export default function App(props) {
  const video = useRef();
  let camera, detector, rafId;

  useEffect(() => {
    init();
  });

  const init = async () => {
    camera = await Camera.setupCamera(STATE.camera);
    detector = await createDetector();
  };

  const handleStart = () => {
    renderPrediction();
    video.current.style.visibility = "hidden";
  };

  async function createDetector() {
    return poseDetection.createDetector(STATE.model, STATE.detectorConfig);
  }

  async function renderPrediction() {
    await checkGuiUpdate();

    if (!STATE.isModelChanged) {
      await renderResult();
    }

    rafId = requestAnimationFrame(renderPrediction);
  }

  async function renderResult() {
    if (camera.video.readyState < 2) {
      await new Promise((resolve) => {
        camera.video.onloadeddata = () => {
          resolve(video);
        };
      });
    }

    let poses = null;

    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (detector != null) {
      // Detectors can throw errors, for example when using custom URLs that
      // contain a model that doesn't provide the expected output.
      try {
        poses = await detector.estimatePoses(camera.video, {
          enableSmoothing: true,
        });
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
    }

    camera.drawCtx();

    // The null check makes sure the UI is not in the middle of changing to a
    // different model. If during model change, the result is from an old model,
    // which shouldn't be rendered.
    const similarity = require("cosine-similarity");
    if (poses && poses.length > 0) {
      let sum = 0;
      const sums = [];
      poses[0].keypoints.map((kpt, index) => {
        const norm = Math.sqrt(kpt.x * kpt.x + kpt.y * kpt.y + kpt.z * kpt.z);
        const kptNorm = { x: kpt.x / norm, y: kpt.y / norm, z: kpt.z / norm };
        sum = similarity(props.poses[index], kptNorm);
        sums.push({ sum: sum, name: kpt.name, score: kpt.score });
      });
      sum /= 33;
      console.log(sums);
      camera.drawResults(poses);
    }
  }

  async function checkGuiUpdate() {
    if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
      camera = await Camera.setupCamera(STATE.camera);
      STATE.isTargetFPSChanged = false;
      STATE.isSizeOptionChanged = false;
    }

    if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
      STATE.isModelChanged = true;

      window.cancelAnimationFrame(rafId);

      if (detector != null) {
        detector.dispose();
      }

      if (STATE.isFlagChanged || STATE.isBackendChanged) {
        await setBackendAndEnvFlags(STATE.flags, STATE.backend);
      }

      try {
        detector = await createDetector(STATE.model);
      } catch (error) {
        detector = null;
        alert(error);
      }

      STATE.isFlagChanged = false;
      STATE.isBackendChanged = false;
      STATE.isModelChanged = false;
    }
  }

  return (
    <div className="app">
      <div id="main">
        <div className="container">
          <div className="canvas-wrapper">
            <canvas id="output"></canvas>
            <video id="video" playsInline ref={video}></video>
          </div>
          <div id="scatter-gl-container"></div>
        </div>
        <button onClick={handleStart}>시작</button>
      </div>
    </div>
  );
}
import React, { useRef, useEffect } from "react";

import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/pose";

import { Camera } from "../../apis/camera";
import { STATE } from "../../apis/params";

import {
  DanceVideoContainer,
  CamContainer,
  CanvasContainer,
  CircleBtn,
  AnalyzingDiv,
} from "./style";

interface Kpt {
  x: number;
  y: number;
  z: number;
  score: number;
}
interface Pose {
  keypoints: Kpt[];
}

const pallete = {
  red: "rgba(255, 0, 0, 0.5)",
  green: "rgba(0,255,0,0.5)",
};

function DanceCam(props: {
  poseList: Pose[];
  danceVideoRef: React.MutableRefObject<any>;
}) {
  const video = useRef<HTMLVideoElement>(null);

  let camera: Camera, detector: any;
  useEffect(() => {
    init();
  });

  const init = async () => {
    camera = await Camera.setupCamera(STATE.camera);
    detector = await createDetector();
    await detector.estimatePoses(camera.video, {
      enableSmoothing: true,
    });
  };

  let countFrame: number;

  const handleStart = (): void => {
    countFrame = 0;
    camera.mediaRecorder?.start();
    props.danceVideoRef.current.playVideo();
    renderPrediction();
    if (video.current) {
      video.current.style.visibility = "hidden";
    }
  };
  async function createDetector() {
    return poseDetection.createDetector(STATE.model, STATE.detectorConfig);
  }

  async function renderPrediction() {
    await renderResult(countFrame);
    countFrame++;

    if (countFrame < props.poseList.length)
      requestAnimationFrame(renderPrediction);
    else camera.mediaRecorder?.stop();
  }

  async function renderResult(countFrame: number): Promise<void> {
    if (camera.video.readyState < 2) {
      await new Promise<void>((resolve) => {
        camera.video.onloadeddata = () => {
          resolve();
        };
      });
    }

    let estimatePoseList: any;

    if (detector != null) {
      try {
        estimatePoseList = await detector.estimatePoses(camera.video, {
          enableSmoothing: true,
        });
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
    }

    camera.drawCtx();

    if (estimatePoseList && estimatePoseList.length > 0) {
      camera.drawResults(estimatePoseList, pallete.red);

      const videoPose = [props.poseList[countFrame]];
      if (videoPose[0].keypoints !== undefined) {
        camera.drawResults(videoPose, pallete.green);
        const score = getSmularity(videoPose, estimatePoseList);
        camera.drawScore(score);
      }
    }
  }

  const similarity = require("cosine-similarity");
  const joints = [
    [8, 12],
    [7, 11],
    [8, 7],
    [12, 14],
    [16, 14],
    [16, 20],
    [16, 18],
    [11, 13],
    [13, 15],
    [15, 19],
    [15, 17],
    [12, 11],
    [12, 24],
    [11, 23],
    [24, 23],
    [24, 26],
    [26, 28],
    [28, 32],
    [28, 30],
    [23, 25],
    [25, 27],
    [27, 29],
    [27, 31],
  ];

  const getSmularity = (pose1: Pose[], pose2: Pose[]) => {
    let sum = 0;
    let pose1ConfidenceSum = 0;
    joints.map((joint) => {
      const v1 = {
        x: pose1[0].keypoints[joint[0]].x - pose1[0].keypoints[joint[1]].x,
        y: pose1[0].keypoints[joint[0]].y - pose1[0].keypoints[joint[1]].y,
        z: pose1[0].keypoints[joint[0]].z - pose1[0].keypoints[joint[1]].z,
      };
      const v2 = {
        x: pose2[0].keypoints[joint[0]].x - pose2[0].keypoints[joint[1]].x,
        y: pose2[0].keypoints[joint[0]].y - pose2[0].keypoints[joint[1]].y,
        z: pose2[0].keypoints[joint[0]].z - pose2[0].keypoints[joint[1]].z,
      };
      const pose1Confidence =
        (pose1[0].keypoints[joint[0]].score +
          pose1[0].keypoints[joint[1]].score) /
        2;
      pose1ConfidenceSum += pose1Confidence;
      const norm_v1 = l2_norm(v1);
      const norm_v2 = l2_norm(v2);
      let tempSum = similarity(norm_v1, norm_v2) * pose1Confidence;
      sum += tempSum;
      return sum;
    });

    let avg = sum / pose1ConfidenceSum;
    if (avg < 0) avg = 0;
    return Math.round(avg * 100);
  };

  const l2_norm = (kpt: { x: number; y: number; z: number }) => {
    const norm = Math.sqrt(kpt.x * kpt.x + kpt.y * kpt.y + kpt.z * kpt.z);
    return { x: kpt.x / norm, y: kpt.y / norm, z: kpt.z / norm };
  };

  return (
    <DanceVideoContainer>
      <CanvasContainer id="camOutput"></CanvasContainer>
      <CamContainer id="cam" playsInline ref={video}></CamContainer>
      {props.poseList.length > 0 ? (
        <div>
          {" "}
          <CircleBtn onClick={handleStart} left="60px">
            시작
          </CircleBtn>
          <CircleBtn onClick={handleStart} left="-60px">
            시작
          </CircleBtn>
        </div>
      ) : (
        <AnalyzingDiv>영상 준비중입니다</AnalyzingDiv>
      )}
    </DanceVideoContainer>
  );
}

export default DanceCam;

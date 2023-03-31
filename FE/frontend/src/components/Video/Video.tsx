import React, { useState } from "react";
import ReactPlayer from "react-player";
import { BtnDetail, ThumbnailImg, VideoContainer } from "./style";

interface VideoProps {
  id: number | null;
  url?: string;
  videoPath: string;
  thumbnailPath: string;
  title: string;
  width?: string;
  height?: string;
  handleClickVideo: () => void;
}

function Video({
  url,
  // youtubeId,
  thumbnailPath,
  videoPath,
  width,
  height,
  handleClickVideo,
}: VideoProps) {
  const [playingVideoId, setPlayingVideoId] = useState<string>("");

  return (
    <VideoContainer
      key={videoPath}
      width={width ?? "360px"}
      height={height ?? "640px"}
      onMouseEnter={(): void => setPlayingVideoId(videoPath)}
      onMouseLeave={(): void => setPlayingVideoId("")}
    >
      {playingVideoId === videoPath ? (
        <>
          {/* {id ? (
            <video
              src={videoPath}
              autoPlay
              controls
              width="270px"
              height="480px"
              controlsList="nodownload"
            />
          ) : (
            <ReactPlayer
              url={url}
              controls
              loop
              muted
              playing
            />
          )} */}
          <ReactPlayer
            url={url}
            controls
            loop
            muted
            playing
            width={width ?? "360px"}
            height={height ?? "640px"}
          />
          <BtnDetail btnText="상세보기" handleClick={handleClickVideo} />
        </>
      ) : (
        <ThumbnailImg
          src={thumbnailPath}
          alt="썸네일이미지"
          width={width ?? "360px"}
          height={height ?? "640px"}
        />
      )}
    </VideoContainer>
  );
}

export default Video;

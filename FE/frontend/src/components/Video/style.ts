import styled from "styled-components";
import Btn from "../Btn/Btn";

const VideoContainer = styled.div`
  width: 270px;
  /* height: 480px; */
  position: relative;

  iframe,
  video {
    width: 100%;
    border-radius: 1rem;
  }

  img {
    width: 100%;
    border-radius: 1rem;
  }
`;

const BtnDetail = styled(Btn)`
  width: fit-content;
  position: absolute;
  top: 1em;
  left: 1em;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: none;
`;

export { VideoContainer, BtnDetail };
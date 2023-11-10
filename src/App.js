import "./App.css";
import { fabric } from "fabric";
import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState, useCallback } from "react";

function App() {
  const [videoSrc, setVideoSrc] = useState("");

  const [fab_Video_State, setFab_Video_State] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalCanvas, setFinalCanvas] = useState(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fabricRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [videoMetadata, setVideoMetadata] = useState({ duration: 0 });

  useEffect(() => {
    wavesurferRef.current = WaveSurfer.create({
      container: "#waveform",
      waveColor: "grey",
      progressColor: "black",
      backend: "MediaElement",
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (videoSrc) {
      wavesurferRef.current.load(videoSrc);
    }
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const onTimeUpdate = () => {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const progress = currentTime / duration;
        wavesurferRef.current.seekTo(progress);
        setVideoMetadata((prevMdata) => ({ ...prevMdata, currentTime }));
      };
      video.addEventListener("timeupdate", onTimeUpdate);
      return () => video.removeEventListener("timeupdate", onTimeUpdate);
    }
  }, [videoSrc]);

  const addVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const video = new fabric.Image(videoRef.current, {
        top: 0,
        left: 0,
        originX: "center",
        originY: "center",
        width: 200,
        height: 200,
      });

      const duration = video.getElement().duration;
    }
  }, [canvasRef.current]);

  //Handling Play Pause
  useEffect(() => {
    if (
      finalCanvas !== null &&
      fab_Video_State !== null &&
      videoRef.current !== null
    ) {
      console.log("videoRef", videoRef.current);
      if (isPlaying) {
        videoRef.current.play();
        fab_Video_State.getElement().play();
      } else {
        videoRef.current.pause();
        fab_Video_State.getElement().pause();
      }
    }
  }, [isPlaying]);

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    const videoUrl = URL.createObjectURL(file);
    // console.log('video loaded', canvasRef.current);
    // console.log("video changed videoURL", videoUrl);
    setVideoSrc(videoUrl);
  };

  const handleVideoLoaded = (event) => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 900,
      backgroundColor: "black",
    });
    const video = event.target;
    let vH = video.videoHeight;
    let vW = video.videoWidth;
    // videoRef.current = video;

    // console.log('canvasRef.current ', canvasRef.current);
    let videoE = document.createElement("video");
    videoE.id = "videoE";
    videoE.width = vW;
    videoE.height = vH;
    videoE.muted = true;
    videoE.crossOrigin = "anonymous";
    videoE.src = videoSrc;

    var fab_video = new fabric.Image(videoE, { left: 0, top: 0 });
    fab_video.set({ selectable: true, movable: true });
    canvas.add(fab_video);
    canvas.centerObject(fab_video);
    setFinalCanvas(canvas);

    setFab_Video_State(fab_video);

    setVideoMetadata({
      duration: video.duration,
      height: video.videoHeight,
      width: video.videoWidth,
      aspectRatio: video.videoWidth / video.videoHeight,
      range: `${video.seekable.start(0)} - ${video.seekable.end(0).toFixed(2)}`,
    });

    // fab_video.getElement().play();

    canvas.requestRenderAll();
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "60%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          style={{
            backgroundColor: "black",
            color: "white",
            fontSize: "15px",
            padding: "10px 60px",
            borderRadius: "20px",
            margin: "10px",
            cursor: "pointer",
          }}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />
        {
          <video
            ref={videoRef}
            src={videoSrc}
            hidden={true}
            className="videoE"
            controls
            onLoadedMetadata={handleVideoLoaded}
          />
        }
        <canvas ref={canvasRef} id="canvas" width="640" height="360"></canvas>
        <button
          style={{
            backgroundColor: "black",
            color: "white",
            fontSize: "20px",
            padding: "10px 60px",
            borderRadius: "20px",
            margin: "10px",
            cursor: "pointer",
          }}
          onClick={handlePlayPause}
        >
          Play / Pause
        </button>
        <div
          style={{
            width: "100%",
            position: "relative",
            margin: "10px",
          }}
        >
          <div
            id="waveform"
            style={{
              marginTop: "15px",
              width: "100%",
            }}
          />
          <p
            style={{
              position: "absolute",
              top: 0,
              left: "10px",
              color: "black",
              zIndex: -1,
              alignItems: "center",
            }}
          >
            Audio Waveform
          </p>
        </div>
      </div>
      {videoSrc && (
        <div
          style={{
            height: "100%",
            width: "40%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
          }}
        >
          <p style={{ fontWeight: 600, fontSize: "20px" }}>Video Metadata</p>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "10px" }}>Duration</td>
                <td>{videoMetadata.duration.toFixed(2)} seconds</td>
              </tr>
              <tr>
                <td style={{ padding: "10px" }}>Height</td>
                <td>{videoMetadata.height}px</td>
              </tr>
              <tr>
                <td style={{ padding: "10px" }}>Width</td>
                <td>{videoMetadata.width}px</td>
              </tr>
              <tr>
                <td style={{ padding: "10px" }}>Range</td>
                <td>{videoMetadata.range}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

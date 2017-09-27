import { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import NoSSR from 'react-no-ssr';
import Loading from './Loading'; 

import { setVideoReady,
  setVideoLoading,
  setVideoPlaying,
  setVideoPaused,
  setCurrentFrame
} from '../../statemanagement/app/VideoStateManagement';

class Video extends Component {

  constructor(props) {
    super(props);
    props.dispatch(setVideoLoading());
    this.monitorTime = this.monitorTime.bind(this);
  }

  componentDidMount() {
    this.videoEl.addEventListener('loadeddata', () => {
      console.log('cancel autoplay')
      // Cancel autoplay iOS
      this.videoEl.pause();
    });
    this.videoEl.addEventListener('canplaythrough', () => {
      console.log('video ready to play');
      // TODO DISPATCH ACTION IS READY TO PLAY
      this.props.dispatch(setVideoReady());
      // For chrome android, autoplay doesn't work
      this.videoEl.play();
    });

    this.videoEl.addEventListener('play', () => {
      // TODO DISPATCH ACTION IS PLAYING
      this.props.dispatch(setVideoPlaying());
      this.monitorTime();
    });

    this.videoEl.addEventListener('pause', () => {
      // TODO DISPATCH ACTION IS PLAYING
      this.props.dispatch(setVideoPaused());
    });

    this.videoEl.addEventListener('ended', () => {
      this.props.dispatch(setVideoPlaying());
      // TODO DISPATCH ACTION IS LOOPING TO CLEAN UP STUFF
    });
  }

  monitorTime() {
    if(this.props.isPaused) {
      return;
    }
    let newCurrentFrame = Math.round(this.videoEl.currentTime * 25)
    if(this.props.currentFrame !== newCurrentFrame) {
      window.currentFrame = newCurrentFrame;
    }
    requestAnimationFrame(this.monitorTime);
  }

  render() { 
    return (
      <div className="video-container">
        {!this.props.isReadyToPlay &&
          <Loading />
        }
        <video
          ref={(el) => { 
            this.videoEl = el;
          }}
          className="video"
          loop
          muted
          playsInline
          autoPlay
        >
          <source src="/static/sample/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <style jsx>{`
          .video {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
          }

          .video-container {
            display: flex;
            height: 100vh;
            width: 100vw;
            justify-content: center;
            align-items:center;
          }

          @media (min-aspect-ratio: 16/9) {
            .video {
              width: 100vw;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .video {
              width: auto;
              height: 100vh;
            }
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect((state) => {
  return {
    isReadyToPlay: state.video.get('isReadyToPlay'),
    isPaused: state.video.get('isPaused'),
    currentFrame: state.video.get('currentFrame')
  }
})(Video);

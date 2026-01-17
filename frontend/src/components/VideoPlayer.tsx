import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    videoUrl: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && videoUrl) {
            videoRef.current.load();
        }
    }, [videoUrl]);

    if (!videoUrl) return null;

    return (
        <div className="card video-container">
            <h3>Generated Result</h3>
            <video ref={videoRef} controls className="video-player" width="100%">
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="audio/mpeg" />
                Your browser does not support the video tag.
            </video>
            <div className="actions">
                <a href={videoUrl} download="lipsync_output.mp4" className="download-btn">
                    Download Video
                </a>
            </div>
        </div>
    );
};

export default VideoPlayer;

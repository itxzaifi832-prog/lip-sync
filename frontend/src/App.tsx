import { useState } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { generateLipSync } from './services/api';

function App() {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (text: string, imageFile: File) => {
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const blob = await generateLipSync(text, imageFile);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        } catch (err) {
            console.error(err);
            setError("Failed to generate lip-sync video. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Lip-Sync Generator</h1>
                <p>Enter text and upload a face image to make it speak!</p>
            </header>

            <main className="main-content">
                <UploadForm onGenerate={handleGenerate} isLoading={isLoading} />

                {isLoading && <LoadingSpinner />}

                {error && <div className="error-message">{error}</div>}

                {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
            </main>

            <footer className="app-footer">
                <p>Runs locally with Wav2Lip + FastAPI</p>
            </footer>
        </div>
    );
}

export default App;

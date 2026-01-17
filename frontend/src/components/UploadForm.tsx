import React, { useState } from 'react';

interface UploadFormProps {
    onGenerate: (text: string, image: File) => void;
    isLoading: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({ onGenerate, isLoading }) => {
    const [text, setText] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large (max 5MB)");
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text && image) {
            onGenerate(text, image);
        }
    };

    return (
        <div className="card">
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="input-group">
                    <label htmlFor="text-input">Text to Speak</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                        placeholder="Enter text here..."
                        disabled={isLoading}
                        maxLength={1000}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="image-input">Face Image</label>
                    <input
                        id="image-input"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageChange}
                        disabled={isLoading}
                    />
                    <small>Supported: JPG, PNG (Max 5MB)</small>
                </div>

                {preview && (
                    <div className="preview-container">
                        <img src={preview} alt="Face Preview" className="preview-image" />
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={isLoading || !text || !image}>
                    {isLoading ? 'Generating...' : 'Generate Lip-Sync Video'}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;

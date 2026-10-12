import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, Volume2, Square, Pause, Play, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import AccessibleButton from '../components/AccessibleButton';
import { ocrService } from '../services/ocrService';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function CameraReader() {
  const { settings, announce } = useAccessibility();

  const [imageSrc, setImageSrc] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream upon unmount
  useEffect(() => {
    return () => {
      stopCamera();
      speechService.stopSpeaking();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage('');
    try {
      announce('Requesting camera permissions');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      announce('Camera opened. Position your document and press Capture Photo.');
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission was denied. Please allow camera access in browser permissions or upload an image file instead.'
        : `Could not access camera: ${err.message}`;
      setErrorMessage(msg);
      announce(msg);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    setImageSrc(dataUrl);
    stopCamera();
    announce('Photo captured. Ready to extract text.');
    runOCR(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const msg = 'Unsupported file format. Please select an image file (JPG, PNG, WebP).';
      setErrorMessage(msg);
      announce(msg);
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      setImageSrc(src);
      announce('Image uploaded successfully. Starting text recognition.');
      runOCR(src);
    };
    reader.onerror = () => {
      const msg = 'Failed to read image file from your device.';
      setErrorMessage(msg);
      announce(msg);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async (src) => {
    setIsProcessing(true);
    setProgressStatus('Initializing OCR engine...');
    setProgressPercent(10);
    setErrorMessage('');

    try {
      const lang = settings.speechLanguage === 'ta-IN' ? 'tam' : 'eng';
      const result = await ocrService.recognize(src, {
        lang,
        onProgress: ({ status, progress }) => {
          setProgressStatus(`Processing: ${status} (${progress}%)`);
          setProgressPercent(progress);
        },
      });

      setIsProcessing(false);
      setProgressPercent(100);

      if (!result.text || !result.text.trim()) {
        const msg = 'No readable text was recognized in this image. Please try a clearer photo or higher lighting.';
        setErrorMessage(msg);
        announce(msg);
        setExtractedText('');
      } else {
        setExtractedText(result.text);
        const successMsg = `Text extraction complete. Found approximately ${result.text.split(/\s+/).length} words. You can review and edit below.`;
        announce(successMsg);
        if (settings.spokenFeedback) {
          speechService.speak(successMsg, {
            rate: settings.speechRate,
            lang: settings.speechLanguage,
          });
        }
      }
    } catch (err) {
      setIsProcessing(false);
      const msg = `Recognition error: ${err.message || 'Could not process image'}.`;
      setErrorMessage(msg);
      announce(msg);
    }
  };

  const handleReadExtractedText = () => {
    if (!extractedText.trim()) {
      announce('No extracted text available to read.');
      return;
    }

    speechService.stopSpeaking();
    setIsSpeaking(true);
    setIsPaused(false);
    announce('Reading extracted text aloud');

    speechService.speak(extractedText, {
      rate: settings.speechRate,
      lang: settings.speechLanguage,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
    });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      speechService.resumeSpeaking();
      setIsPaused(false);
      announce('Speech resumed');
    } else {
      speechService.pauseSpeaking();
      setIsPaused(true);
      announce('Speech paused');
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    announce('Speech stopped');
  };

  const handleClearAll = () => {
    speechService.stopSpeaking();
    stopCamera();
    setImageSrc(null);
    setExtractedText('');
    setErrorMessage('');
    setProgressPercent(0);
    setProgressStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    announce('Camera reader cleared.');
  };

  return (
    <div className="camera-reader-page">
      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: '8px' }}>
        Camera Reader (Image OCR)
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: 'var(--font-lg)' }}>
        Extract and listen to written text from documents, labels, and signs using client-side OCR.
      </p>

      {/* Accuracy Disclaimer Callout */}
      <section className="callout callout-warning" aria-label="OCR Accuracy Notice">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle size={24} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Important Accuracy Disclaimer:</strong>
            <p style={{ marginTop: '4px' }}>
              Optical Character Recognition (OCR) may misread low-contrast, skewed, or handwritten text. Please verify any critical information, medical dosages, dates, or official figures before relying on them. You can freely edit the text area below.
            </p>
          </div>
        </div>
      </section>

      {/* Error Announcement */}
      {errorMessage && (
        <div className="callout callout-error" role="alert" tabIndex={-1}>
          <strong>Notice:</strong> {errorMessage}
        </div>
      )}

      {/* Image Capture & Upload Controls */}
      <section aria-labelledby="capture-controls-title" className="callout" style={{ margin: '20px 0' }}>
        <h2 id="capture-controls-title" style={{ fontSize: 'var(--font-xl)', marginBottom: '14px' }}>
          Image Source
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          aria-hidden="true"
        />

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <AccessibleButton
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            variant="primary"
            icon={Upload}
            ariaLabel="Upload an image from your device"
            disabled={isProcessing}
          >
            Upload Image
          </AccessibleButton>

          {!isCameraActive ? (
            <AccessibleButton
              onClick={startCamera}
              variant="secondary"
              icon={Camera}
              ariaLabel="Use device camera to take a photo"
              disabled={isProcessing}
            >
              Open Camera
            </AccessibleButton>
          ) : (
            <>
              <AccessibleButton
                onClick={capturePhoto}
                variant="primary"
                icon={Camera}
                ariaLabel="Capture photo from camera feed"
              >
                Capture Photo
              </AccessibleButton>
              <AccessibleButton
                onClick={stopCamera}
                variant="secondary"
                ariaLabel="Close camera feed"
              >
                Close Camera
              </AccessibleButton>
            </>
          )}

          {(imageSrc || extractedText) && (
            <AccessibleButton
              onClick={handleClearAll}
              variant="danger"
              icon={Trash2}
              ariaLabel="Clear current image and extracted text"
            >
              Clear Reader
            </AccessibleButton>
          )}
        </div>

        {/* Live Camera Feed Preview */}
        {isCameraActive && (
          <div style={{ marginTop: '20px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#000',
                objectFit: 'contain',
              }}
              aria-label="Live camera viewfinder"
            />
          </div>
        )}

        {/* Image Preview */}
        {imageSrc && !isCameraActive && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-md)', marginBottom: '8px' }}>Loaded Image:</h3>
            <img
              src={imageSrc}
              alt="Selected document or captured scene for OCR text extraction"
              style={{
                maxWidth: '100%',
                maxHeight: '350px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-color)',
              }}
            />
          </div>
        )}
      </section>

      {/* OCR Status & Progress */}
      {isProcessing && (
        <section className="callout" aria-live="polite" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCw className="listening-pulse" size={20} aria-hidden="true" />
            <span style={{ fontWeight: 600 }}>{progressStatus || 'Processing image OCR...'}</span>
          </div>
          <div
            style={{
              width: '100%',
              backgroundColor: 'var(--border-color)',
              height: '10px',
              borderRadius: '5px',
              marginTop: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--primary)',
                height: '100%',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </section>
      )}

      {/* Extracted Text Result Area */}
      <section aria-labelledby="extracted-text-heading" style={{ marginTop: '30px' }}>
        <h2 id="extracted-text-heading" style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>
          Extracted Text (Editable)
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
          Review and edit any words before reading aloud or copying:
        </p>

        <textarea
          className="form-textarea"
          value={extractedText}
          onChange={(e) => setExtractedText(e.target.value)}
          placeholder="Extracted text will appear here. You can also type or paste text manually."
          aria-label="Extracted OCR text area"
          rows={7}
          style={{ width: '100%' }}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <AccessibleButton
            onClick={handleReadExtractedText}
            variant="primary"
            icon={Volume2}
            ariaLabel="Read extracted text aloud"
            disabled={!extractedText.trim() || isSpeaking}
          >
            Read Aloud
          </AccessibleButton>

          {isSpeaking && (
            <>
              <AccessibleButton
                onClick={handlePauseResume}
                variant="secondary"
                icon={isPaused ? Play : Pause}
                ariaLabel={isPaused ? 'Resume reading' : 'Pause reading'}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </AccessibleButton>

              <AccessibleButton
                onClick={handleStopSpeaking}
                variant="danger"
                icon={Square}
                ariaLabel="Stop reading immediately"
              >
                Stop Speaking
              </AccessibleButton>
            </>
          )}

          {extractedText.trim() && (
            <AccessibleButton
              onClick={handleReadExtractedText}
              variant="secondary"
              ariaLabel="Repeat reading extracted text"
            >
              Repeat
            </AccessibleButton>
          )}
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section className="callout callout-success" style={{ marginTop: '36px' }} aria-label="Privacy information">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <strong>Client-Side Guarantee:</strong> OCR runs completely inside your browser via WebAssembly. Neither your photos nor the extracted text are uploaded to any server.
          </div>
        </div>
      </section>
    </div>
  );
}

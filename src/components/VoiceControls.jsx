import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Square, Pause, Play, HelpCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibleButton from './AccessibleButton';

export default function VoiceControls() {
  const navigate = useNavigate();
  const { settings, announce } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleVoiceCommand = (commandText) => {
    const raw = commandText.toLowerCase().trim();
    setLastTranscript(commandText);

    // Provide confirmation speech
    const speakFeedback = (text) => {
      announce(text);
      if (settings.spokenFeedback) {
        speechService.speak(text, {
          rate: settings.speechRate,
          lang: settings.speechLanguage,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    };

    // Routing commands
    if (raw.includes('go home') || raw.includes('home') || raw.includes('முகப்பு')) {
      speakFeedback('Navigating to Home');
      navigate('/');
    } else if (raw.includes('camera') || raw.includes('reader') || raw.includes('கேமரா')) {
      speakFeedback('Opening Camera Reader');
      navigate('/reader');
    } else if (raw.includes('form') || raw.includes('படிவம்')) {
      speakFeedback('Opening Form Assistant');
      navigate('/forms');
    } else if (raw.includes('setting') || raw.includes('accessibility') || raw.includes('அமைப்புகள்')) {
      speakFeedback('Opening Accessibility Settings');
      navigate('/settings');
    } 
    // Speech control commands
    else if (raw.includes('stop speaking') || raw.includes('stop') || raw.includes('நிறுத்து')) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setIsPaused(false);
      announce('Speech stopped');
    } else if (raw.includes('pause') || raw.includes('இடைநிறுத்து')) {
      speechService.pauseSpeaking();
      setIsPaused(true);
      announce('Speech paused');
    } else if (raw.includes('resume') || raw.includes('தொடரவும்')) {
      speechService.resumeSpeaking();
      setIsPaused(false);
      announce('Speech resumed');
    } else if (raw.includes('read this page') || raw.includes('read page') || raw.includes('படிக்கவும்')) {
      readCurrentPage();
    } else if (raw.includes('help') || raw.includes('உதவி')) {
      speakFeedback('Supported commands are: Go home, Open camera reader, Open form assistant, Open accessibility settings, Read this page, and Stop speaking.');
    } else {
      speakFeedback(`Command not recognized: ${commandText}. Say Help for available commands.`);
    }
  };

  const toggleListening = () => {
    if (!speechService.isRecognitionSupported()) {
      announce('Speech recognition is not supported in this browser. Please use Chrome or Edge, or use keyboard controls.');
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      announce('Microphone listening stopped');
    } else {
      speechService.startListening({
        lang: settings.speechLanguage,
        onStart: () => {
          setIsListening(true);
          announce('Microphone listening. Speak your command now.');
        },
        onResult: (transcript) => {
          setIsListening(false);
          handleVoiceCommand(transcript);
        },
        onError: (err) => {
          setIsListening(false);
          const errorMsg = err.error === 'not-allowed'
            ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
            : 'Voice recognition error. Please try again or use the buttons.';
          announce(errorMsg);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    }
  };

  const readCurrentPage = () => {
    // Read semantic main content or page summary
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    // Filter headings and text
    const textToRead = mainEl.innerText || '';
    if (!textToRead.trim()) {
      announce('No readable text found on this page.');
      return;
    }

    setIsSpeaking(true);
    setIsPaused(false);
    announce('Reading page content aloud');

    speechService.speak(textToRead.slice(0, 3000), {
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

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    announce('Speech stopped');
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

  return (
    <section className="voice-bar" aria-label="Voice Navigation Controls">
      <div className="voice-bar-inner">
        <div className="voice-status">
          {isListening && <span className="listening-pulse" aria-hidden="true" />}
          <span>
            {isListening
              ? 'Listening for command...'
              : lastTranscript
              ? `Heard: "${lastTranscript}"`
              : 'Voice navigation available'}
          </span>
        </div>

        <div className="voice-buttons-group">
          {/* Main Microphone Button */}
          <AccessibleButton
            onClick={toggleListening}
            variant={isListening ? 'mic-active' : 'primary'}
            ariaLabel={isListening ? 'Stop listening for voice commands' : 'Start listening for voice commands'}
            icon={isListening ? MicOff : Mic}
          >
            {isListening ? 'Stop Listening' : 'Voice Command'}
          </AccessibleButton>

          {/* Read Page Button */}
          <AccessibleButton
            onClick={readCurrentPage}
            variant="secondary"
            ariaLabel="Read the content of this page aloud"
            icon={Volume2}
            disabled={isSpeaking && !isPaused}
          >
            Read Page
          </AccessibleButton>

          {/* Pause / Resume */}
          {isSpeaking && (
            <AccessibleButton
              onClick={handlePauseResume}
              variant="secondary"
              ariaLabel={isPaused ? 'Resume speech' : 'Pause speech'}
              icon={isPaused ? Play : Pause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </AccessibleButton>
          )}

          {/* Immediate Stop Speaking */}
          {isSpeaking && (
            <AccessibleButton
              onClick={handleStopSpeaking}
              variant="danger"
              ariaLabel="Stop speaking immediately"
              icon={Square}
            >
              Stop
            </AccessibleButton>
          )}

          {/* Quick Voice Help */}
          <AccessibleButton
            onClick={() => handleVoiceCommand('help')}
            variant="secondary"
            ariaLabel="Spoken voice commands help"
            icon={HelpCircle}
          >
            Voice Help
          </AccessibleButton>
        </div>
      </div>
    </section>
  );
}

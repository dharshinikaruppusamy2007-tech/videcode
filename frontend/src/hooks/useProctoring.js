import { useRef, useState, useCallback, useEffect } from 'react';

const MAX_WARNINGS = 3;
const GRACE_MS = 6000;
const VIOLATION_COOLDOWN_MS = 3000;
const INACTIVITY_TIMEOUT_MS = 60000;
const INACTIVITY_CHECK_MS = 2000;
const FACE_LOST_TIMEOUT_MS = 10000;
const FACE_CHECK_MS = 1000;
const FACE_FRAME_W = 96;
const FACE_FRAME_H = 72;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'click', 'touchstart', 'scroll', 'wheel'];

function isSkinPixel(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return r > 95 && g > 40 && b > 20 && r > g && r > b && (max - min) > 15 && Math.abs(r - g) > 15;
}

function analyzeFacePresence(data, width, height) {
    const boxLeft = Math.floor(width * 0.25);
    const boxTop = Math.floor(height * 0.15);
    const boxWidth = Math.floor(width * 0.5);
    const boxHeight = Math.floor(height * 0.6);
    let skinPixels = 0;
    let total = 0;
    for (let y = boxTop; y < boxTop + boxHeight; y++) {
        for (let x = boxLeft; x < boxLeft + boxWidth; x++) {
            const idx = (y * width + x) * 4;
            if (isSkinPixel(data[idx], data[idx + 1], data[idx + 2])) skinPixels++;
            total++;
        }
    }
    return total > 0 ? skinPixels / total : 0;
}

export function useProctoring({ onFail }) {
    const onFailRef = useRef(onFail);
    useEffect(() => { onFailRef.current = onFail; }, [onFail]);

    const [warnings, setWarnings] = useState(0);
    const [webcamState, setWebcamState] = useState('off'); // off | requested | active | denied | unsupported
    const [webcamError, setWebcamError] = useState('');
    const [faceVisible, setFaceVisible] = useState(null); // null | true | false
    const [lastWarning, setLastWarning] = useState(null);

    const startedRef = useRef(false);
    const startedAtRef = useRef(Date.now());
    const warningCountRef = useRef(0);
    const lastActivityRef = useRef(Date.now());
    const lastViolationAtRef = useRef(0);
    const faceLostSinceRef = useRef(null);
    const cameraTokenRef = useRef(0);
    const requestingRef = useRef(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const faceIntervalRef = useRef(null);
    const inactivityIntervalRef = useRef(null);

    const stopWebcam = useCallback(() => {
        cameraTokenRef.current += 1;
        requestingRef.current = false;
        if (faceIntervalRef.current) {
            clearInterval(faceIntervalRef.current);
            faceIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setFaceVisible(null);
        setWebcamState('off');
    }, []);

    const stopProctoring = useCallback(() => {
        startedRef.current = false;
        stopWebcam();
        if (inactivityIntervalRef.current) {
            clearInterval(inactivityIntervalRef.current);
            inactivityIntervalRef.current = null;
        }
    }, [stopWebcam]);

    const registerViolation = useCallback((text) => {
        if (!startedRef.current) return;
        if (Date.now() - startedAtRef.current < GRACE_MS) return;
        if (warningCountRef.current >= MAX_WARNINGS) return;

        const now = Date.now();
        if (now - lastViolationAtRef.current < VIOLATION_COOLDOWN_MS) return;
        lastViolationAtRef.current = now;

        warningCountRef.current += 1;
        setWarnings(warningCountRef.current);
        setLastWarning({ count: warningCountRef.current, text });

        if (warningCountRef.current >= MAX_WARNINGS) {
            stopProctoring();
            onFailRef.current?.();
        }
    }, [stopProctoring]);

    const startFaceDetection = useCallback(() => {
        if (faceIntervalRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        faceIntervalRef.current = setInterval(() => {
            if (!streamRef.current || video.readyState < 2) return;
            try {
                ctx.drawImage(video, 0, 0, FACE_FRAME_W, FACE_FRAME_H);
                const ratio = analyzeFacePresence(ctx.getImageData(0, 0, FACE_FRAME_W, FACE_FRAME_H).data, FACE_FRAME_W, FACE_FRAME_H);
                if (ratio >= 0.03) {
                    faceLostSinceRef.current = null;
                    setFaceVisible(true);
                } else {
                    if (faceLostSinceRef.current === null) faceLostSinceRef.current = Date.now();
                    setFaceVisible(false);
                    if (Date.now() - faceLostSinceRef.current > FACE_LOST_TIMEOUT_MS) {
                        faceLostSinceRef.current = Date.now();
                        registerViolation('No face detected — please keep looking at the camera.');
                    }
                }
            } catch { }
        }, FACE_CHECK_MS);
    }, [registerViolation]);

    const startWebcam = useCallback(async () => {
        if (streamRef.current || requestingRef.current) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setWebcamState('unsupported');
            return;
        }
        requestingRef.current = true;
        setWebcamState('requested');
        setWebcamError('');
        const token = ++cameraTokenRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
                audio: false
            });
            if (token !== cameraTokenRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            requestingRef.current = false;
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try { await videoRef.current.play(); } catch { }
            }
            setWebcamState('active');
            startFaceDetection();
        } catch {
            if (token !== cameraTokenRef.current) return;
            requestingRef.current = false;
            setWebcamState('denied');
            setWebcamError('Camera permission was denied. Continuing without webcam monitoring.');
        }
    }, [startFaceDetection]);

    const startProctoring = useCallback(() => {
        startedAtRef.current = Date.now();
        lastActivityRef.current = Date.now();
        startedRef.current = true;
        startWebcam();
    }, [startWebcam]);

    const refreshActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden) registerViolation('Tab switching is not allowed during the interview.');
        };
        const onBlur = () => {
            registerViolation('Leaving the interview window is not allowed.');
        };
        const onActivity = () => {
            lastActivityRef.current = Date.now();
        };

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('blur', onBlur);
        ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));

        inactivityIntervalRef.current = setInterval(() => {
            if (!startedRef.current) return;
            if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
                registerViolation('No activity detected — leaving the screen or using another tool is suspicious.');
                lastActivityRef.current = Date.now();
            }
        }, INACTIVITY_CHECK_MS);

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
            stopProctoring();
        };
    }, [registerViolation, stopProctoring]);

    return {
        warnings,
        webcamState,
        webcamError,
        faceVisible,
        lastWarning,
        videoRef,
        canvasRef,
        startProctoring,
        stopProctoring,
        startWebcam,
        stopWebcam,
        refreshActivity
    };
}

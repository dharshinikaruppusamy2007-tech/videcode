import { Sparkles } from 'lucide-react';

const PARTICLES = [
    { top: '8%', left: '14%', size: 6, delay: '0s', dur: '4.5s' },
    { top: '16%', left: '82%', size: 5, delay: '0.8s', dur: '5s' },
    { top: '70%', left: '6%', size: 7, delay: '1.4s', dur: '5.4s' },
    { top: '24%', left: '6%', size: 4, delay: '2s', dur: '4.2s' },
    { top: '78%', left: '84%', size: 6, delay: '0.5s', dur: '5.8s' },
    { top: '10%', left: '46%', size: 5, delay: '2.6s', dur: '4.8s' },
    { top: '82%', left: '38%', size: 4, delay: '1.1s', dur: '5.2s' },
    { top: '60%', left: '90%', size: 5, delay: '3s', dur: '4.4s' },
];

function AvatarArt({ id }) {
    const uid = (n) => `${id}-${n}`;
    return (
        <svg viewBox="0 0 260 300" role="img" aria-label="Professional AI interviewer avatar" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
                <linearGradient id={uid('skin')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7C9A0" />
                    <stop offset="100%" stopColor="#E9AC7E" />
                </linearGradient>
                <linearGradient id={uid('blazer')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C5BF0" />
                    <stop offset="100%" stopColor="#4B32A8" />
                </linearGradient>
                <linearGradient id={uid('shirt')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EDE9FE" />
                </linearGradient>
                <linearGradient id={uid('hair')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A3A8F" />
                    <stop offset="100%" stopColor="#2E2158" />
                </linearGradient>
                <linearGradient id={uid('iris')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4B32A8" />
                    <stop offset="100%" stopColor="#2A1B54" />
                </linearGradient>
            </defs>

            {/* Torso / blazer */}
            <path d="M130 192 C90 192 56 216 48 258 C45 273 60 282 78 282 L182 282 C200 282 215 273 212 258 C204 216 170 192 130 192 Z" fill={`url(#${uid('blazer')})`} />
            <path d="M130 194 C98 194 68 212 58 244 C78 226 102 219 130 219 C158 219 182 226 202 244 C192 212 162 194 130 194 Z" fill="#FFFFFF" opacity="0.1" />
            {/* Lapels */}
            <path d="M130 198 L116 232 L130 252 L144 232 Z" fill="#8A6BF5" />
            {/* Shirt */}
            <path d="M118 218 C124 210 136 210 142 218 L146 234 L130 252 L114 234 Z" fill={`url(#${uid('shirt')})`} />
            {/* Tie */}
            <path d="M126 212 L130 254 L134 212 Z" fill="#6C4DE6" />
            {/* Neck */}
            <path d="M116 156 L144 156 L148 198 L112 198 Z" fill="#E9AC7E" />
            <path d="M116 156 L144 156 L148 198 L112 198 Z" fill="#000" opacity="0.06" />

            {/* Ears */}
            <ellipse cx="84" cy="114" rx="10" ry="14" fill="#F1BE92" />
            <ellipse cx="176" cy="114" rx="10" ry="14" fill="#F1BE92" />

            {/* Head */}
            <ellipse cx="130" cy="106" rx="49" ry="57" fill={`url(#${uid('skin')})`} />
            <ellipse cx="130" cy="118" rx="43" ry="48" fill="#000" opacity="0.03" />
            {/* Cheeks */}
            <ellipse cx="102" cy="124" rx="11" ry="7" fill="#F09A73" opacity="0.28" />
            <ellipse cx="158" cy="124" rx="11" ry="7" fill="#F09A73" opacity="0.28" />

            {/* Hair */}
            <path d="M81 104 C82 60 98 40 130 40 C162 40 178 60 179 104 C170 96 162 92 156 90 C148 88 112 88 104 90 C98 92 90 96 81 104 Z" fill={`url(#${uid('hair')})`} />
            <path d="M102 44 C114 37 146 37 158 44 C144 40 116 40 102 44 Z" fill="#FFFFFF" opacity="0.16" />
            <path d="M83 98 C84 76 92 58 104 48 L100 62 C92 74 90 88 90 102 Z" fill="#2E2158" />
            <path d="M177 98 C176 76 168 58 156 48 L160 62 C168 74 170 88 170 102 Z" fill="#2E2158" />

            {/* Brows */}
            <path d="M100 88 Q110 83 120 87" stroke="#6B4E8F" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M140 87 Q150 83 160 88" stroke="#6B4E8F" strokeWidth="3.4" fill="none" strokeLinecap="round" />

            {/* Eyes */}
            <ellipse cx="110" cy="102" rx="9.5" ry="10.5" fill="#FFFFFF" />
            <ellipse cx="150" cy="102" rx="9.5" ry="10.5" fill="#FFFFFF" />
            <circle cx="111" cy="103" r="5" fill={`url(#${uid('iris')})`} />
            <circle cx="151" cy="103" r="5" fill={`url(#${uid('iris')})`} />
            <circle cx="113" cy="101" r="1.8" fill="#FFFFFF" />
            <circle cx="153" cy="101" r="1.8" fill="#FFFFFF" />

            {/* Nose */}
            <path d="M127 110 Q122 118 128 122" stroke="#D99A6C" strokeWidth="2.4" fill="none" strokeLinecap="round" />

            {/* Smile */}
            <path d="M116 134 Q130 147 144 134" stroke="#B5683F" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Professional 3D cartoon AI Interviewer avatar with soft lavender glow
 * and voice-state ring. `state` is one of idle | speaking | listening | thinking.
 * This is purely a visual component — it does not generate any voice.
 */
export default function AIInterviewerAvatar({ state = 'idle', size = 240 }) {
    const ringClass = ['idle', 'speaking', 'listening', 'thinking'].includes(state) ? state : 'idle';

    return (
        <div
            className="avatar-stage"
            style={{ width: size, height: size }}
            aria-label="AI Interviewer avatar"
        >
            <div className={`avatar-ring ${ringClass}`} />
            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="avatar-dot"
                    style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.dur,
                    }}
                />
            ))}
            <div style={{ width: '74%', height: '88%', position: 'relative', zIndex: 2 }}>
                <AvatarArt id="ai-avatar" />
            </div>
            <span className="avatar-badge">
                <Sparkles size={12} /> AI
            </span>
        </div>
    );
}

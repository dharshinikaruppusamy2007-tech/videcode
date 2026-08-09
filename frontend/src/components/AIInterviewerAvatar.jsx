import { Sparkles } from 'lucide-react';

/**
 * Professional semi-realistic female AI interviewer avatar for the corporate
 * interview platform. Polished digital-human illustration: realistic eyes,
 * subtle makeup, neat hairstyle, formal blazer, soft studio lighting with
 * lavender/purple ambient glow. `state` is idle | speaking | listening | thinking.
 * Purely visual — it does not generate any voice.
 */
function AvatarArt({ id }) {
    const uid = (n) => `${id}-${n}`;
    return (
        <svg viewBox="0 0 260 300" role="img" aria-label="Professional female AI interviewer avatar" className="avatar-art" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
                <linearGradient id={uid('skin')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBCDA7" />
                    <stop offset="55%" stopColor="#F3B98F" />
                    <stop offset="100%" stopColor="#E8A179" />
                </linearGradient>
                <linearGradient id={uid('hair')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B4A32" />
                    <stop offset="60%" stopColor="#4A3021" />
                    <stop offset="100%" stopColor="#33200F" />
                </linearGradient>
                <linearGradient id={uid('hairHi')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A4764E" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#A4764E" stopOpacity="0" />
                </linearGradient>
                <radialGradient id={uid('halo')} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#9B8AFB" stopOpacity="0.32" />
                    <stop offset="70%" stopColor="#7C5BF0" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#7C5BF0" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={uid('iris')} cx="0.42" cy="0.38" r="0.95">
                    <stop offset="0%" stopColor="#8A5A33" />
                    <stop offset="55%" stopColor="#6E4526" />
                    <stop offset="100%" stopColor="#4A2C16" />
                </radialGradient>
                <linearGradient id={uid('lipUpper')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B35A58" />
                    <stop offset="100%" stopColor="#9E4A4C" />
                </linearGradient>
                <linearGradient id={uid('lipLower')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C76B66" />
                    <stop offset="100%" stopColor="#B25A58" />
                </linearGradient>
                <linearGradient id={uid('blazer')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C5BF0" />
                    <stop offset="100%" stopColor="#4B32A8" />
                </linearGradient>
                <linearGradient id={uid('blazerDark')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5A3FD0" />
                    <stop offset="100%" stopColor="#3A2385" />
                </linearGradient>
                <linearGradient id={uid('shirt')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EDE6FF" />
                </linearGradient>
            </defs>

            {/* Ambient lavender halo (soft studio glow behind the avatar) */}
            <circle cx="130" cy="134" r="112" fill={`url(#${uid('halo')})`} />

            {/* Back hair — full silhouette behind head and shoulders */}
            <path d="M130 30 C 168 30, 192 62, 192 102 C 193 148, 200 196, 188 226 C 180 246, 156 254, 130 254 C 104 254, 80 246, 72 226 C 60 196, 67 148, 68 102 C 68 62, 92 30, 130 30 Z" fill={`url(#${uid('hair')})`} />
            <path d="M92 44 C 120 32, 160 34, 178 54 C 150 34, 112 34, 92 44 Z" fill={`url(#${uid('hairHi')})`} opacity="0.7" />

            {/* Neck + collar shading */}
            <path d="M118 182 L142 182 L149 214 L111 214 Z" fill="#EBAA80" />
            <path d="M118 182 L142 182 L145 192 L115 192 Z" fill="rgba(60,30,20,0.18)" />
            <path d="M116 196 L144 196 L147 210 L113 210 Z" fill="rgba(60,30,20,0.10)" />

            {/* Shirt + modern blazer */}
            <path d="M112 208 L130 232 L148 208 C 138 216, 122 216, 112 208 Z" fill={`url(#${uid('shirt')})`} />
            <path d="M112 208 L122 214 L117 226 Z" fill="#FFFFFF" />
            <path d="M148 208 L138 214 L143 226 Z" fill="#FFFFFF" />
            <path d="M92 212 C 72 220, 54 232, 48 256 L48 290 L126 290 L126 224 C 116 218, 104 214, 92 212 Z" fill={`url(#${uid('blazer')})`} />
            <path d="M168 212 C 156 214, 144 218, 134 224 L134 290 L212 290 L212 256 C 206 232, 188 220, 168 212 Z" fill={`url(#${uid('blazer')})`} />
            <path d="M130 224 L130 290" stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="1.5" />
            <path d="M112 212 L96 246 L110 260 L124 230 Z" fill={`url(#${uid('blazerDark')})`} />
            <path d="M148 212 L164 246 L150 260 L136 230 Z" fill={`url(#${uid('blazerDark')})`} />
            <circle cx="129" cy="256" r="2.2" fill="#3A2385" />
            <circle cx="129" cy="272" r="2.2" fill="#3A2385" />
            <circle cx="127.6" cy="255.4" r="0.8" fill="#FFFFFF" opacity="0.5" />
            <circle cx="127.6" cy="271.4" r="0.8" fill="#FFFFFF" opacity="0.5" />
            <path d="M78 236 C 70 246, 62 260, 58 276 C 64 256, 72 246, 80 240 Z" fill="#9B8AFB" opacity="0.12" />

            {/* Ears + stud earrings */}
            <ellipse cx="83" cy="124" rx="9" ry="13" fill="#EFAE84" />
            <ellipse cx="83" cy="125" rx="4" ry="6" fill="#D99669" opacity="0.5" />
            <ellipse cx="177" cy="124" rx="9" ry="13" fill="#EFAE84" />
            <ellipse cx="177" cy="125" rx="4" ry="6" fill="#D99669" opacity="0.5" />
            <circle cx="83" cy="139" r="1.9" fill="#D8C8F7" />
            <circle cx="82.4" cy="138.4" r="0.7" fill="#FFFFFF" opacity="0.9" />
            <circle cx="177" cy="139" r="1.9" fill="#D8C8F7" />
            <circle cx="176.4" cy="138.4" r="0.7" fill="#FFFFFF" opacity="0.9" />

            {/* Face */}
            <path d="M130 70 C 158 70, 176 94, 177 126 C 178 156, 162 181, 141 189 C 134 191, 126 191, 119 189 C 98 181, 82 156, 83 126 C 84 94, 102 70, 130 70 Z" fill={`url(#${uid('skin')})`} />

            {/* Studio-light shading (key light upper-left) */}
            <path d="M84 116 C 84 146, 94 168, 106 181 C 97 168, 90 150, 90 130 C 90 122, 88 110, 86 104 Z" fill="rgba(90,50,30,0.13)" />
            <path d="M174 108 C 177 128, 175 152, 164 174 C 170 156, 173 138, 173 120 C 173 112, 173 108, 174 108 Z" fill="rgba(90,50,30,0.18)" />
            <path d="M96 178 C 110 190, 150 190, 164 178 C 150 195, 110 195, 96 178 Z" fill="rgba(90,50,30,0.10)" />
            <ellipse cx="112" cy="138" rx="10" ry="7" fill="#FFFFFF" opacity="0.22" />
            <ellipse cx="112" cy="86" rx="15" ry="10" fill="#FFFFFF" opacity="0.2" />
            <path d="M126 112 L126 138 L130 142 L130 112 Z" fill="#FFFFFF" opacity="0.25" />
            <ellipse cx="130" cy="153" rx="5" ry="3" fill="rgba(120,66,40,0.18)" />
            <ellipse cx="130" cy="179" rx="9" ry="3.5" fill="rgba(120,66,40,0.15)" />
            <ellipse cx="130" cy="185" rx="6" ry="3" fill="#FFF8F0" opacity="0.3" />

            {/* Subtle makeup — blush + eyeshadow */}
            <ellipse cx="103" cy="148" rx="9" ry="4.5" fill="#E58A93" opacity="0.18" />
            <ellipse cx="157" cy="148" rx="9" ry="4.5" fill="#E58A93" opacity="0.18" />

            {/* Front hair — side-parted fringe + shoulder-length framing strands */}
            <path d="M80 104 C 84 70, 104 48, 134 46 C 162 44, 182 62, 186 92 C 178 68, 160 54, 140 53 C 120 52, 104 60, 96 74 C 90 84, 86 94, 80 104 Z" fill={`url(#${uid('hair')})`} />
            <path d="M96 66 C 116 50, 148 48, 170 62 C 150 50, 126 54, 110 68 C 106 72, 102 76, 100 80 C 99 74, 97 70, 96 66 Z" fill={`url(#${uid('hair')})`} />
            <path d="M100 60 C 116 50, 136 49, 152 54 C 134 50, 114 54, 104 66 C 100 70, 99 72, 98 74 C 99 70, 99 65, 100 60 Z" fill={`url(#${uid('hairHi')})`} opacity="0.8" />
            <path d="M82 100 C 76 124, 74 158, 84 200 C 90 228, 104 242, 114 242 C 102 220, 100 186, 102 154 C 103 128, 100 112, 90 100 Z" fill={`url(#${uid('hair')})`} />
            <path d="M84 118 C 80 144, 80 176, 86 210 C 88 214, 90 216, 91 214 C 86 186, 85 150, 88 120 C 89 116, 88 114, 86 112 Z" fill={`url(#${uid('hairHi')})`} opacity="0.6" />
            <path d="M178 100 C 184 124, 186 158, 176 200 C 170 228, 156 242, 146 242 C 158 220, 160 186, 158 154 C 157 128, 160 112, 170 100 Z" fill={`url(#${uid('hair')})`} />
            <path d="M176 118 C 180 144, 180 176, 174 210 C 172 214, 170 216, 169 214 C 174 186, 175 150, 172 120 C 171 116, 172 114, 174 112 Z" fill={`url(#${uid('hairHi')})`} opacity="0.6" />

            {/* Brows — groomed, tapered */}
            <path d="M100 116 Q 108 109 120 113 Q 117 116 108 117 Q 103 117 100 116 Z" fill="#4A3226" opacity="0.85" />
            <path d="M140 113 Q 152 109 160 116 Q 157 117 152 117 Q 143 116 140 113 Z" fill="#4A3226" opacity="0.85" />

            {/* Eyes — realistic with lid crease, lash line, hazel iris */}
            <g className="ai-eye">
                <path d="M100 120 Q 110 115 120 120" stroke="#C08B6A" strokeWidth="1.2" opacity="0.5" fill="none" strokeLinecap="round" />
                <path d="M99 122 Q 110 114 121 122 Q 110 119 99 122 Z" fill="#C98A8F" opacity="0.22" />
                <path d="M99 124 Q 110 116 121 124 L123 121" stroke="#3B2618" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <ellipse cx="110" cy="128.5" rx="10.5" ry="7" fill="#FFFEFC" />
                <circle cx="110" cy="128.5" r="5.4" fill={`url(#${uid('iris')})`} />
                <circle cx="110" cy="128.5" r="5.4" fill="none" stroke="#4A2C16" strokeOpacity="0.3" strokeWidth="1" />
                <circle cx="110" cy="128.5" r="2.4" fill="#17100A" />
                <circle cx="112" cy="126.8" r="1.6" fill="#FFFFFF" opacity="0.95" />
                <circle cx="108.6" cy="130.5" r="0.8" fill="#FFFFFF" opacity="0.6" />
                <path d="M100 134 Q 110 137 120 134" stroke="#3B2618" strokeWidth="1" opacity="0.3" fill="none" strokeLinecap="round" />
            </g>
            <g className="ai-eye">
                <path d="M140 120 Q 150 115 160 120" stroke="#C08B6A" strokeWidth="1.2" opacity="0.5" fill="none" strokeLinecap="round" />
                <path d="M139 122 Q 150 114 161 122 Q 150 119 139 122 Z" fill="#C98A8F" opacity="0.22" />
                <path d="M139 124 Q 150 116 161 124 L163 121" stroke="#3B2618" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <ellipse cx="150" cy="128.5" rx="10.5" ry="7" fill="#FFFEFC" />
                <circle cx="150" cy="128.5" r="5.4" fill={`url(#${uid('iris')})`} />
                <circle cx="150" cy="128.5" r="5.4" fill="none" stroke="#4A2C16" strokeOpacity="0.3" strokeWidth="1" />
                <circle cx="150" cy="128.5" r="2.4" fill="#17100A" />
                <circle cx="152" cy="126.8" r="1.6" fill="#FFFFFF" opacity="0.95" />
                <circle cx="148.6" cy="130.5" r="0.8" fill="#FFFFFF" opacity="0.6" />
                <path d="M140 134 Q 150 137 160 134" stroke="#3B2618" strokeWidth="1" opacity="0.3" fill="none" strokeLinecap="round" />
            </g>

            {/* Nose */}
            <path d="M130 130 C 127 139, 124.5 145, 127 150" stroke="#CF9B72" strokeWidth="1.5" opacity="0.75" fill="none" strokeLinecap="round" />
            <path d="M125 152 Q 126.5 154 128 153" stroke="#CF9B72" strokeWidth="1" opacity="0.6" fill="none" strokeLinecap="round" />
            <path d="M132 153 Q 133.5 154 135 152" stroke="#CF9B72" strokeWidth="1" opacity="0.6" fill="none" strokeLinecap="round" />

            {/* Mouth — subtle smile (base) + open mouth while speaking */}
            <g className="ai-mouth">
                <path d="M117 164 C 121.5 161 138.5 161 143 164 C 138.5 166 130 166 130 165.5 C 130 166 121.5 166 117 164 Z" fill={`url(#${uid('lipUpper')})`} />
                <path d="M118 163.5 C 122 160.5 128 160.5 130 162 C 132 160.5 138 160.5 142 163.5" stroke="#9E4A4C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M118 164 Q 130 178 142 164 Q 130 171 118 164 Z" fill={`url(#${uid('lipLower')})`} />
                <path d="M118 164 Q 130 171 142 164" stroke="#8A3E40" strokeWidth="1.2" opacity="0.8" fill="none" strokeLinecap="round" />
                <path d="M124 173 Q 130 176 136 173" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.35" fill="none" strokeLinecap="round" />
                <path className="ai-mouth-open" d="M119 164 Q 130 168 141 164 Q 136 184 130 184 Q 124 184 119 164 Z" fill="#7E2E38" />
                <path className="ai-mouth-open" d="M124 180 Q 130 184 136 180 Q 130 178 124 180 Z" fill="#E07B83" opacity="0.85" />
            </g>

            {/* Lavender rim light on both face edges */}
            <path d="M84 108 C 82 128, 84 152, 92 172 C 88 156, 86 134, 87 114 C 87 110, 85 108, 84 108 Z" fill="#9B8AFB" opacity="0.14" />
            <path d="M176 108 C 178 128, 176 152, 168 172 C 172 156, 174 134, 173 114 C 173 110, 175 108, 176 108 Z" fill="#9B8AFB" opacity="0.14" />
        </svg>
    );
}

/**
 * Professional AI Interviewer avatar with soft lavender glow and voice-state
 * ring. `state` is one of idle | speaking | listening | thinking.
 * Purely visual — it does not generate any voice.
 */
export default function AIInterviewerAvatar({ state = 'idle', size = 240 }) {
    const ringClass = ['idle', 'speaking', 'listening', 'thinking'].includes(state) ? state : 'idle';

    return (
        <div
            className="avatar-stage"
            style={{ width: size, height: size }}
            aria-label="Professional female AI interviewer avatar"
        >
            <div className={`avatar-ring ${ringClass}`} />
            <div style={{ width: '76%', height: '90%', position: 'relative', zIndex: 2 }}>
                <AvatarArt id="ai-avatar" />
            </div>
            <span className="avatar-badge">
                <Sparkles size={12} /> AI
            </span>
        </div>
    );
}

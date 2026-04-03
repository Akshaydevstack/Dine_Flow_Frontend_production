import React from "react";

export default function DineFlowLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradient matching your purple theme */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#8b5cf6', stopOpacity:1}}>
              <animate attributeName="stop-color" values="#8b5cf6;#a78bfa;#c4b5fd;#8b5cf6" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" style={{stopColor:'#a78bfa', stopOpacity:1}}>
              <animate attributeName="stop-color" values="#a78bfa;#c4b5fd;#8b5cf6;#a78bfa" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" style={{stopColor:'#c4b5fd', stopOpacity:1}}>
              <animate attributeName="stop-color" values="#c4b5fd;#8b5cf6;#a78bfa;#c4b5fd" dur="3s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>
        </defs>
        
        {/* Subtle wave backgrounds */}
        <g opacity="0.2">
          <path d="M 0,120 Q 50,100 100,120 T 200,120 T 300,120 T 400,120" 
                stroke="url(#textGradient)" 
                strokeWidth="1.5" 
                fill="none">
            <animate attributeName="d" 
                     values="M 0,120 Q 50,100 100,120 T 200,120 T 300,120 T 400,120;
                             M 0,120 Q 50,140 100,120 T 200,120 T 300,120 T 400,120;
                             M 0,120 Q 50,100 100,120 T 200,120 T 300,120 T 400,120"
                     dur="4s" 
                     repeatCount="indefinite"/>
          </path>
          
          <path d="M 0,140 Q 50,120 100,140 T 200,140 T 300,140 T 400,140" 
                stroke="url(#textGradient)" 
                strokeWidth="1.5" 
                fill="none">
            <animate attributeName="d" 
                     values="M 0,140 Q 50,120 100,140 T 200,140 T 300,140 T 400,140;
                             M 0,140 Q 50,160 100,140 T 200,140 T 300,140 T 400,140;
                             M 0,140 Q 50,120 100,140 T 200,140 T 300,140 T 400,140"
                     dur="4s" 
                     repeatCount="indefinite"
                     begin="0.5s"/>
          </path>
        </g>
        
        {/* Fork icon - left side */}
        <g transform="translate(30, 60)">
          <path d="M 5,0 L 5,30 M 0,0 L 0,15 M 10,0 L 10,15" 
                stroke="#8b5cf6" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round">
            <animate attributeName="opacity" values="0;1" dur="0.8s" fill="freeze"/>
            <animateTransform attributeName="transform" 
                              type="translate" 
                              values="0,-10;0,0" 
                              dur="1s" 
                              fill="freeze"/>
          </path>
        </g>
        
        {/* Main text with cursive font */}
        <text x="70" y="105" 
              fontFamily="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', 'Monotype Corsiva', cursive" 
              fontSize="52" 
              fontWeight="normal"
              fontStyle="italic"
              fill="url(#textGradient)"
              letterSpacing="0">
          <tspan>D<animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze"/></tspan>
          <tspan>i<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.1s" fill="freeze"/></tspan>
          <tspan>n<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.2s" fill="freeze"/></tspan>
          <tspan>e<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.3s" fill="freeze"/></tspan>
          <tspan>F<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.4s" fill="freeze"/></tspan>
          <tspan>l<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.5s" fill="freeze"/></tspan>
          <tspan>o<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.6s" fill="freeze"/></tspan>
          <tspan>w<animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.7s" fill="freeze"/></tspan>
        </text>
        
        {/* Moving dots */}
        <circle cx="0" cy="100" r="3" fill="#8b5cf6" opacity="0.8">
          <animate attributeName="cx" values="0;400" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="0" cy="110" r="2.5" fill="#a78bfa" opacity="0.8">
          <animate attributeName="cx" values="0;400" dur="5s" repeatCount="indefinite" begin="0.5s"/>
          <animate attributeName="opacity" values="0;0.6;0.6;0" dur="5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        
        <circle cx="0" cy="120" r="2" fill="#c4b5fd" opacity="0.8">
          <animate attributeName="cx" values="0;400" dur="4.5s" repeatCount="indefinite" begin="1s"/>
          <animate attributeName="opacity" values="0;0.7;0.7;0" dur="4.5s" repeatCount="indefinite" begin="1s"/>
        </circle>
        
        {/* Plate icon - right side */}
        <g transform="translate(350, 80)">
          <ellipse cx="0" cy="15" rx="18" ry="4" fill="#8b5cf6" opacity="0.3">
            <animate attributeName="opacity" values="0;0.3" dur="1s" begin="1.5s" fill="freeze"/>
          </ellipse>
          <circle cx="0" cy="0" r="15" stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.8">
            <animate attributeName="opacity" values="0;1" dur="1s" begin="1.5s" fill="freeze"/>
            <animate attributeName="r" values="15;16;15" dur="2s" repeatCount="indefinite" begin="2.5s"/>
          </circle>
          
          {/* Food items in plate */}
          <circle cx="-5" cy="0" r="2" fill="#a78bfa" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2s" fill="freeze"/>
          </circle>
          <circle cx="0" cy="-5" r="2" fill="#c4b5fd" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2.2s" fill="freeze"/>
          </circle>
          <circle cx="5" cy="0" r="2" fill="#8b5cf6" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2.4s" fill="freeze"/>
          </circle>
        </g>

        {/* Loading indicator line */}
        <rect x="120" y="160" width="160" height="3" rx="1.5" fill="url(#textGradient)" opacity="0.8">
          <animate attributeName="width" values="0;160;0" dur="2s" repeatCount="indefinite" begin="1s"/>
          <animate attributeName="x" values="200;120;200" dur="2s" repeatCount="indefinite" begin="1s"/>
        </rect>
      </svg>
    </div>
  );
}
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-fit h-fit">
      {/* Improved Animated Truck (Inspired by Uiverse.io) */}
      <div className="loader">
        <div className="truckWrapper">
          {/* Speed Lines */}
          <div className="speedLines">
            <div className="line line1"></div>
            <div className="line line2"></div>
            <div className="line line3"></div>
          </div>
          
          {/* Truck Body */}
          <div className="truckBody">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 180 93"
              className="trucksvg"
            >
              {/* Trailer (Cargo Area) */}
              <rect strokeWidth="3" stroke="#282828" fill="#DFDFDF" rx="2.5" height="90" width="110" y="1.5" x="6.5"></rect>

              {/* Cabin */}
              <path strokeWidth="3" stroke="#282828" fill="#F83D3D"
                d="M125 22.5H165C166.2 22.5 167.2 23.1 167.6 24.1L180 56.8C180 57.1 180 57.4 180 57.7V89C180 90.4 179 91.5 177.5 91.5H125C123.5 91.5 122.5 90.4 122.5 89V25C122.5 23.6 123.5 22.5 125 22.5Z"
              ></path>

              {/* Truck Window */}
              <path strokeWidth="3" stroke="#282828" fill="#7D7C7C"
                d="M136 33.5H170C171 33.5 172 34.1 172.5 35.1L178 52.1C178.5 53.7 177 55.5 175.5 55.5H136C134.5 55.5 133.5 54.4 133.5 53V36C133.5 34.6 134.5 33.5 136 33.5Z"
              ></path>

              {/* Headlights */}
              <rect strokeWidth="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="175"></rect>

              {/* Rearview Mirror */}
              <rect strokeWidth="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81" x="180"></rect>
            </svg>
          </div>

          {/* Truck Tires */}
          <div className="truckTires">
            <div className="tire-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
                <circle strokeWidth="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
              <div className="burnout-glow"></div>
              <div className="smoke-container">
                <div className="smoke smoke1"></div>
                <div className="smoke smoke2"></div>
                <div className="smoke smoke3"></div>
              </div>
            </div>
            <div className="tire-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
                <circle strokeWidth="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
              <div className="burnout-glow"></div>
              <div className="smoke-container">
                <div className="smoke smoke1"></div>
                <div className="smoke smoke2"></div>
                <div className="smoke smoke3"></div>
              </div>
            </div>
          </div>

          {/* Road */}
          <div className="road"></div>

          {/* Street Lamp */}
          <svg viewBox="0 0 453.459 453.459" xmlns="http://www.w3.org/2000/svg"
            className="lampPost">
            <path fill="#111111"
              d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
              c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
              c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149
              C200.189,38.779,223.924,16,252.882,16c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437
              c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
              h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
              v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
              V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z"
            ></path>
          </svg>
        </div>
      </div>
      <style>{`
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .truckWrapper {
          position: relative;
          width: 200px;
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          overflow: hidden;
        }
        
        /* Speed lines */
        .speedLines {
          position: absolute;
          top: 40%;
          left: 0;
          width: 100%;
          height: 30px;
          z-index: -1;
        }
        
        .line {
          position: absolute;
          height: 2px;
          background-color: #444;
          opacity: 0.6;
        }
        
        .line1 {
          width: 80px;
          top: 0;
          animation: speedLineAnim 0.8s linear infinite;
        }
        
        .line2 {
          width: 60px;
          top: 10px;
          animation: speedLineAnim 0.6s linear infinite;
        }
        
        .line3 {
          width: 40px;
          top: 20px;
          animation: speedLineAnim 0.4s linear infinite;
        }
        
        .truckBody {
          width: 130px;
          margin-bottom: 6px;
          animation: bounce 0.6s ease-in-out infinite alternate;
          transform-origin: bottom center;
          transform: rotate(-2deg);
        }
        
        .trucksvg {
          width: 100%;
        }
        
        .truckTires {
          position: absolute;
          bottom: 0;
          width: 130px;
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
        }
        
        .tire-container {
          position: relative;
        }
        
        .tiresvg {
          width: 24px;
          animation: wheelSpin 0.3s linear infinite;
        }
        
        /* Tire burnout effects */
        .burnout-glow {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 4px;
          background: radial-gradient(circle, rgba(255,106,0,0.8) 0%, rgba(255,106,0,0.4) 60%, rgba(255,106,0,0) 100%);
          border-radius: 50%;
          filter: blur(1px);
          animation: glowPulse 0.5s ease-in-out infinite alternate;
        }
        
        /* Smoke particles */
        .smoke-container {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .smoke {
          position: absolute;
          bottom: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(200, 200, 200, 0.8);
          filter: blur(2px);
        }
        
        .smoke1 {
          animation: smokeRise 1.2s ease-out infinite;
        }
        
        .smoke2 {
          animation: smokeRise 1.6s ease-out 0.2s infinite;
        }
        
        .smoke3 {
          animation: smokeRise 1.4s ease-out 0.4s infinite;
        }
        
        .road {
          position: relative;
          bottom: 0;
          width: 100%;
          height: 2px;
          background-color: #282828;
          border-radius: 2px;
        }
        
        .road::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 100%;
          background-color: #282828;
          right: -50%;
          border-radius: 2px;
          animation: roadAnim 1.2s linear infinite;
          border-left: 4px solid white;
        }
        
        .road::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 100%;
          background-color: #282828;
          right: -65%;
          border-radius: 2px;
          animation: roadAnim 1.2s linear infinite;
          border-left: 2px solid white;
        }
        
        .lampPost {
          position: absolute;
          height: 120px;
          right: -100px;
          bottom: 0;
          opacity: 0.80;
          filter: brightness(0.7);
          animation: lampMove 4s linear infinite;
        }
        
        @keyframes bounce {
          0% {
            transform: translateY(0) rotate(-2deg);
          }
          100% {
            transform: translateY(-2px) rotate(-1deg);
          }
        }

        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes glowPulse {
          0% { opacity: 0.6; width: 18px; }
          100% { opacity: 1; width: 22px; }
        }

        @keyframes smokeRise {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          100% { 
            transform: translate(calc(Math.random() * 20px - 10px), -30px) scale(2);
            opacity: 0;
          }
        }

        @keyframes speedLineAnim {
          0% { transform: translateX(200px); }
          100% { transform: translateX(-100px); }
        }
        
        @keyframes roadAnim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes lampMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-400px); }
        }
      `}</style>
    </div>
  );
};

export default Loader;

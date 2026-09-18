import React from 'react';
import './payment.css'; // Importing a regular CSS file

interface PaymentSuccessModalProps {
  onOkClick: () => void;
  showDoNotShowAgain: boolean; // Prop to control visibility of "Do not show again today"
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  onOkClick,
}) => {
  return (
    // Corrected class names to be string literals for global CSS
    <div className="backdrop">
      <div className="wrapper">
        <section role="dialog" className="modal" aria-modal="true">
          <svg className="icon-payment" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_2418_8317)">
              <circle cx="56" cy="52" r="44" fill="url(#paint0_linear_2418_8317)"></circle>
            </g>
            <g filter="url(#filter1_d_2418_8317)">
              <path d="M33.9031 51.9949C32.3774 50.4692 32.3774 47.9956 33.9031 46.47C35.4287 44.9443 37.9023 44.9443 39.428 46.47L56.9236 63.9655L51.3987 69.4905L33.9031 51.9949Z" fill="white"></path>
              <path d="M72.5774 37.2625C74.103 35.7368 76.5766 35.7368 78.1023 37.2625C79.628 38.7881 79.628 41.2617 78.1023 42.7874L51.3985 69.4912L45.8736 63.9662L72.5774 37.2625Z" fill="white"></path>
            </g>
            <defs>
              <filter id="filter0_d_2418_8317" x="0" y="0" width="112" height="112" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                <feOffset dy="4"></feOffset>
                <feGaussianBlur stdDeviation="6"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix type="matrix" values="0 0 0 0 0.423529 0 0 0 0 0.596078 0 0 0 0 1 0 0 0 0.76 0"></feColorMatrix>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2418_8317"></feBlend>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2418_8317" result="shape"></feBlend>
              </filter>
              <filter id="filter1_d_2418_8317" x="26.7598" y="34.1182" width="58.4863" height="45.373" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                <feOffset dy="4"></feOffset>
                <feGaussianBlur stdDeviation="3"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.1375 0 0 0 0 0.46 0 0 0 0.3 0"></feColorMatrix>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2418_8317"></feBlend>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2418_8317" result="shape"></feBlend>
              </filter>
              <linearGradient id="paint0_linear_2418_8317" x1="56" y1="8" x2="56" y2="96" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C98FF"></stop>
                <stop offset="1" stopColor="#0038BC"></stop>
              </linearGradient>
            </defs>
          </svg>
          <p className="title">Paid successfully!</p>
          <p className="message">
            Your tickets have been successfully purchased. Please take note of the draw time and check the results promptly.
          </p>
          <div className="buttonContainer">
            <button type="button" className="okButton" onClick={onOkClick}>
              OK
            </button>
            {/* <button type="button" className="shareButton" onClick={onShareClick}>
              Share
            </button> */}
          </div>
         
         
          {/* {showDoNotShowAgain && (
            <div className="doNotShowAgainContainer">
              <label>
                <input
                  type="checkbox"
                  onChange={e => onDoNotShowAgainChange(e.target.checked)}
                />
                Do not show again today
              </label>
            </div>
          )} */}
        </section>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
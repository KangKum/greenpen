const LoadingSpinner = ({ size = 40, color = "#fff" }) => (
  <div className="overlay">
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 40 40" stroke={color}>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(2 2)" strokeWidth="4">
          <circle strokeOpacity=".2" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </g>
    </svg>
  </div>
);

export default LoadingSpinner;

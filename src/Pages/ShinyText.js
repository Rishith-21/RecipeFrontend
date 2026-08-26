

const ShinyText = ({ text, disabled = false, speed = 5, className = "" }) => {
  const animationDuration = `${speed}s`;

  // Inline styles for shiny text
  const style = {
    display: "inline-block",
    color: disabled ? "#b5b5b5a4" : "#ccc",  // Base color visible even during animation
    backgroundImage:
      "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
    backgroundSize: "200% 100%",
    backgroundClip: disabled ? "border-box" : "text",
    WebkitBackgroundClip: disabled ? "border-box" : "text",
    animationName: disabled ? "none" : "shine",
    animationDuration: animationDuration,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes shine {
            0% {
              background-position: 100% 0;
            }
            100% {
              background-position: -100% 0;
            }
          }
        `}
      </style>
      <div style={style} className={className}>
        {text}
      </div>
    </>
  );
};

export default ShinyText;

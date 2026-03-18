import React from "react";

const bannerStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#fff",
  padding: "40px 20px",
  textAlign: "center",
  borderRadius: "8px",
  margin: "20px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const subtitleStyle = {
  fontSize: "16px",
  opacity: 0.9,
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(255,255,255,0.2)",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  marginTop: "12px",
};

function Banner() {
  return (
    <div style={bannerStyle}>
      <div style={titleStyle}>Welcome to Micro Frontend!</div>
      <div style={subtitleStyle}>
        This banner is built with React and loaded via Module Federation
      </div>
      <div style={badgeStyle}>React {React.version}</div>
    </div>
  );
}

export default Banner;

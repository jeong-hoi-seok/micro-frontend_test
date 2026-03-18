export async function mountHeader(container) {
  try {
    const { createApp } = await import("vue");
    const Header = (await import("header/Header")).default;
    const app = createApp(Header);
    app.mount(container);
  } catch (err) {
    console.error("[Shell] Failed to load Header:", err);
    container.innerHTML = '<div style="padding:16px;background:#fee;color:#c00;">Header 로딩 실패 — header 앱이 실행 중인지 확인하세요 (port 3001)</div>';
  }
}

export async function mountBanner(container) {
  try {
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const Banner = (await import("banner/Banner")).default;
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(Banner));
  } catch (err) {
    console.error("[Shell] Failed to load Banner:", err);
    container.innerHTML = '<div style="padding:16px;background:#fee;color:#c00;">Banner 로딩 실패 — banner 앱이 실행 중인지 확인하세요 (port 3002)</div>';
  }
}

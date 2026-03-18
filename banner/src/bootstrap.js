import React from "react";
import { createRoot } from "react-dom/client";
import Banner from "./components/Banner";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<Banner />);

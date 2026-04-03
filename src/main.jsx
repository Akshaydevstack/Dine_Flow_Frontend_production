import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import store from "./store";
import {Provider} from 'react-redux'

createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}>
     <App />
    </Provider>
    </BrowserRouter>
  // </React.StrictMode>
);


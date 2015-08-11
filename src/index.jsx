import LoginComponent from "./login";
import Federated from "./federated";
import Basic from "./basic";
import insertCss from "insert-css";

let fs = require('fs');
let css = fs.readFileSync('build/main.css');

insertCss(css, { prepend: true });

export {LoginComponent as Login, Federated as Federated, Basic as Basic};

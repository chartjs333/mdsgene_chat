import DefaultLayout from "../containers/DefaultLayout";
import Home from "./Home";

const routes = [
  {
    path: "/",
    Component: Home,
    Layout: DefaultLayout,
    secured: false,
    exact: true,
  },
];

export default routes;

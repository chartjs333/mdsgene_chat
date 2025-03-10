import DefaultLayout from "../containers/DefaultLayout";
import Home from "./Home"
import TestUploadPage from "./TestUploadPage"

const routes = [
  {
    path: "/",
    Component: Home,
    Layout: DefaultLayout,
    secured: false,
    exact: true,
  },
  {
    path: "/test-upload",
    Component: TestUploadPage,
    Layout: DefaultLayout,
    secured: false,
    exact: true,
  },
];

export default routes;

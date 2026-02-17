import App from "./App";
import BadAss from "./BadAss";

export const routes = [
  {
    path: '*',
    element: <div>Not Found</div>
  },
  {
    path: '/',
    element: <App />
  },
  {
    path: '/badass',
    element: <BadAss />
  }
]
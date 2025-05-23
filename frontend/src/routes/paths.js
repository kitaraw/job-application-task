// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = "/auth";
const ROOTS_DASHBOARD = "/dashboard";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, "/login"),
  register: path(ROOTS_AUTH, "/register"),
};

export const PATH_PAGE = {
  page404: "/404",
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    roles: path(ROOTS_DASHBOARD, "/roles"),
    users: path(ROOTS_DASHBOARD, "/users"),
    packages: path(ROOTS_DASHBOARD, "/packages"),
  },
};



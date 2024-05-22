import branch from "./specs/branch";

export default branch(({ inputs: { condition }, notifyOutlet }) =>
  notifyOutlet(condition ? "true" : "false")
);

import enumerate from "./specs/enumerate";

export default enumerate(async function* ({
  inputs: { collection },
  notifyOutlet,
  registerInlet,
}) {
  let haltLoop = false;
  registerInlet("break", () => (haltLoop = true));
  for (const [elementIndex, element] of collection.entries()) {
    if (haltLoop) return;
    yield { element, elementIndex };
    notifyOutlet("onElement");
  }
});

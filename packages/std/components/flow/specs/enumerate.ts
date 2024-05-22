import {
  type ComponentSpec,
  NewComponent,
  t,
} from "@zenith-run/core/component";

export const Spec = {
  label: "Enumerate",
  doc: "Enumerates over a collection",
  parameters: {
    inputs: {
      collection: {
        doc: "The collection to enumerate over",
        type: t.Array(t.Any()),
      },
    },
    outputs: {
      element: {
        doc: "The current item in the collection (this changes each time the `element` outlet is notified)",
        type: t.Any(),
      },
      elementIndex: {
        doc: "The index of the current item in the collection (this changes each time the `element` outlet is notified)",
        type: t.Number(),
      },
    },
  },
  ports: {
    inlets: {
      break: {
        doc: "Breaks out of the loop",
      },
    },
    outlets: {
      onElement: {
        doc: "Called for each item in the collection",
      },
    },
  },
} as const satisfies ComponentSpec;

export default NewComponent(Spec);

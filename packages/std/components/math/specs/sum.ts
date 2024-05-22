import {
  type ComponentSpec,
  NewComponent,
  t,
} from "@zenith-run/core/component";

export const Spec = {
  label: "Sum",
  doc: "Adds up an array of numbers",
  parameters: {
    inputs: {
      numbers: {
        doc: "The numbers to sum",
        type: t.Array(t.Number()),
      },
    },
    outputs: {
      sum: {
        doc: "The sum of the numbers",
        type: t.Number(),
      },
    },
  },
} as const satisfies ComponentSpec;

export default NewComponent(Spec);

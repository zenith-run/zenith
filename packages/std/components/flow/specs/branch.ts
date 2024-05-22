import {
  type ComponentSpec,
  NewComponent,
  t,
} from "@zenith-run/core/component";

export const Spec = {
  label: "Branch",
  doc: "Branches based on the condition",
  parameters: {
    inputs: {
      condition: {
        doc: "The condition to check",
        type: t.Boolean(),
      },
    },
  },
  ports: {
    options: {
      completionPort: {
        hide: true,
      },
    },
    outlets: {
      true: {
        doc: "Called if the condition is true",
      },
      false: {
        doc: "Called if the condition is false",
      },
    },
  },
} as const satisfies ComponentSpec;

export default NewComponent(Spec);

import { expect, test } from "bun:test";

import sum from "@zenith-run/std/components/math/sum";
import { newCallableComponent } from "@zenith-run/core/component/exec";

test("sum", async () => {
  const callable = newCallableComponent(sum);
  const result = await callable({ numbers: [1, 2] });
  expect(result).toEqual({ sum: 3 });
});

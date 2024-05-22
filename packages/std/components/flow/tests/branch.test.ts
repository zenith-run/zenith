import { expect, jest, test } from "bun:test";

import branch from "@zenith-run/std/components/flow/branch";
import { newObservableComponent } from "@zenith-run/core/component/exec";

test("branch", async () => {
  const [observer, component] = newObservableComponent(branch);

  const onOutlet = jest.fn();
  observer.once("outlet", onOutlet);

  const onOuletTrue = jest.fn();
  observer.once("outlet:true", onOuletTrue);

  const onOutput = jest.fn();
  observer.once("output", onOutput);

  const onEnd = jest.fn();
  observer.once("end", onEnd);

  // Execute the action, triggering the above events and validate result.
  const result = await component({ condition: true });
  expect(result).toBeUndefined();

  // Validate the events occurred as expected.
  expect(onOutlet).toHaveBeenCalledWith("true");
  expect(onOuletTrue).toHaveBeenCalled();
  expect(onOutput).toHaveBeenCalledTimes(0);
  expect(onEnd).toHaveBeenCalled();
});

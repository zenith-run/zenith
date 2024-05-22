import { expect, jest, test } from "bun:test";
import enumerate from "@zenith-run/std/components/flow/enumerate";
import { newObservableComponent } from "@zenith-run/core/component/exec";

test("enumerate", async () => {
  const [observer, component] = newObservableComponent(enumerate);
  const collection = [1, 2, 3, 4, 5, 6];

  const onOutlet = jest.fn();
  observer.on("outlet", onOutlet);

  const onElement = jest.fn();
  observer.on("outlet:onElement", onElement);

  const onOutput = jest.fn();
  observer.on("output", ({ elementIndex }) => {
    if (elementIndex === 4) component.notifyInlet("break");
    onOutput();
  });

  const onInletBreak = jest.fn();
  observer.on("inlet:break", onInletBreak);

  const onEnd = jest.fn();
  observer.on("end", onEnd);

  // Execute the action, triggering the above events and validate result.
  const result = await component({ collection });
  expect(result).toEqual({
    element: 5,
    elementIndex: 4,
  });

  // Validate the events occurred as expected.
  expect(onOutlet).toHaveBeenNthCalledWith(5, "onElement");
  expect(onElement).toHaveBeenCalledTimes(5);
  expect(onOutput).toHaveBeenCalledTimes(5);
  expect(onInletBreak).toHaveBeenCalled();
  expect(onEnd).toHaveBeenCalled();

  // All events should be removed after the action is complete.
  expect(observer.eventNames().length).toBe(0);
});

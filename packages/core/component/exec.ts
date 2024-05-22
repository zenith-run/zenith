/**
 * @file This file exports functionality for executing component definitions.
 */

import { Value } from "@sinclair/typebox/value";
import { createEventEmitter, type EventEmitter } from "../common/events";
import {
  CallContext,
  Component,
  ComponentInlets,
  ComponentInputs,
  ComponentOutputs,
  ComponentPortEvents,
  ComponentSpec,
  Parameters,
} from ".";

/**
 * newCallableComponent constructs a new callable instance from a provided component.
 * It's immediately executable, given the inputs it requires and will directly return
 * any outputs it may produce.
 * @param component The component to construct an action instance from.
 * @param options provides options for constructing an action instance. See ActionOptions.
 * @returns See CallableAction.
 */
export function newCallableComponent<T extends ComponentSpec>(
  component: Component<T>
): CallableComponent<T> {
  return async (inputs: ComponentInputs<T>) =>
    await execAction<T>({ component, inputs });
}

/**
 * CallableComponent is a functional facade that wraps the execution
 * of a component
 */
type CallableComponent<T extends ComponentSpec> = {
  (inputs: ComponentInputs<T>): Promise<ComponentOutputs<T>>;
};

/**
 * newObservableComponent constructs a new observable instance from the provided component.
 * This function returns a tuple of:
 * - an EventEmitter that can be used to subscribe to events emitted during execution.
 * - a CallableComponent that drives execution.
 * Some notes on the EventEmitter:
 * - The events that are emitted are strongly typed based on the provided component.
 * - The `output` event will only be called if there are subscribers and there are values to provide.
 * - The `error` event will only be called if there are subscribers and an error occurs.
 *   If there are no subscribers, the error will be thrown.
 * - The `end` event will only be called if there are subscribers.
 *   It will always be called after zero or more `output` events or an `error` event is called.
 * @param component
 * @param options
 * @throws Iif there are no subscriptions to the `error` event.
 * @returns
 */
export function newObservableComponent<T extends ComponentSpec>(
  component: Component<T>
): [
  EventEmitter<ObservableEvents<T>>,
  CallableComponent<T> & ActionInletNotifier<T>,
] {
  const listener = createEventEmitter<ObservableEvents<T>>();
  const action = async (
    inputs: ComponentInputs<T>
  ): Promise<ComponentOutputs<T>> => {
    try {
      let output: ComponentOutputs<T> | undefined;
      const actionOptions = {
        component,
        inputs,
        listener,
      };
      // If the action is a generator function, we need to iterate over it
      // and yield each output it produces.
      // Otherwise, we can just execute it and return the output.
      const generator = isGeneratorFn(component)
        ? execGeneratorAction(actionOptions)
        : [await execAction(actionOptions)];
      for await (const value of generator) {
        output = value;
        if (output && listener.eventNames().includes("output")) {
          listener.emit("output", output);
        }
      }
      return output;
    } catch (e) {
      if (!listener.eventNames().includes("error")) {
        throw e;
      }
      listener.emit("error", e);
    } finally {
      if (listener.eventNames().includes("end")) {
        listener.emit("end");
      }
      listener.removeAllListeners();
    }
  };

  // This function is used to notify the EventEmitter of an inlet being triggered
  // from the outside.
  action.notifyInlet = (name: ComponentInlets<T>) => {
    const inletName = `inlet:${name as string}`;
    if (listener.eventNames().includes(inletName)) {
      listener.emit(inletName as ObservableEvents<T>);
    }
  };
  return [listener, action];
}

// ActionInletNotifier is a helper interface that provides a single method
// for notifying an inlet from the outside. This is available for use with
// newObservableComponent.
type ActionInletNotifier<T extends ComponentSpec> = {
  notifyInlet: (name: ComponentInlets<T>) => void;
};

// Defines the set of events that could be emitted from an observable action.
type ObservableEvents<T extends ComponentSpec> =
  | ComponentPortEvents<T>
  | "outlet"
  | "output"
  | "error"
  | "end";

/**
 * execAction executes a component synchronously, returning any outputs
 * it may have produced.
 * @param options provides details necessary to facilitate execution.
 * @returns The outputs produced by the component, if any.
 * @throws If the component does not define the requested action.
 * @throws If the inputs provided are invalid.`
 * @throws If the outputs produced are invalid.
 */
async function execAction<T extends ComponentSpec>(
  options: ExecOptions<T>
): Promise<ComponentOutputs<T>> {
  const { component } = options;
  const outputs = await component.action(newCallContext(options));
  if (outputs) return parseParameters("outputs", component, outputs);
}

// Runs a generator function defined in the provided component, yielding each output it produces.
// This function acts similarly to `execAction`, but is intended for component actions that
// behave as generators.
async function* execGeneratorAction<T extends ComponentSpec>(
  options: ExecOptions<T>
): AsyncGenerator<ComponentOutputs<T>> {
  const { component } = options;

  // Once we've acquired one, attempt to parse any provided inputs against
  // the defined input parameter schema.
  const generator = component.action(newCallContext(options)) as AsyncGenerator<
    ComponentOutputs<T>
  >;

  // Yield each output produced by the generator, ensuring they are also valid
  // given the output parameter schema.
  for await (const outputs of generator) {
    yield parseParameters("outputs", component, outputs);
  }
}

// A helper function to parse parameters against a component's parameter schema.
// This can be used to parse inputs or outputs, respectively.
function parseParameters<
  T extends ComponentSpec,
  R extends ComponentInputs<T> | ComponentOutputs<T>,
>(
  paramKey: keyof Parameters,
  { spec }: Component<T>,
  values?: Record<string, any>
): R {
  const parsedValues: Record<string, any> = {};
  const definitions = spec.parameters?.[paramKey];
  if (!values || !definitions) return parsedValues as R;
  if (Object.keys(definitions).length === 0 && Object.keys(values).length > 0) {
    throw new Error(
      `Component (${
        spec.label ?? "unknown"
      }) does not define any ${paramKey}, but values were provided`
    );
  }
  if (Object.keys(definitions).length > 0 && Object.keys(values).length === 0) {
    throw new Error(
      `Component (${
        spec.label ?? "unknown"
      }) defines ${paramKey}, but no values were provided`
    );
  }
  for (const [key, definition] of Object.entries(definitions)) {
    try {
      parsedValues[key] = Value.Decode(definition.type, values[key]);
    } catch (e) {
      throw new Error(
        `Component (${
          spec.label ?? "unknown"
        }) failed to parse "${key}" of ${paramKey}: ${
          (e as unknown as Error).message
        }`
      );
    }
  }
  return parsedValues as R;
}

// A helper function to construct a new call context, that is passed along
// as a second argument to the action's call function.
function newCallContext<T extends ComponentSpec>({
  component,
  inputs,
  listener,
}: ExecOptions<T>): CallContext<T> {
  return {
    inputs: parseParameters("inputs", component, inputs),
    registerInlet: <InletNames>(name: InletNames, fn: () => void) => {
      if (listener) listener.on(`inlet:${name}` as ObservableEvents<T>, fn);
    },
    notifyOutlet: <OutletNames>(name: OutletNames) => {
      let notified = false;
      if (listener) {
        // If `listener` is defined and there's subscribers, we emit at most two events:
        // - one broad `outlet` event that provides the name of the outlet.
        // - one specific `outlet:${name}` event with no arguments.
        if (listener.eventNames().includes("outlet")) {
          listener.emit("outlet", name);
          notified = true;
        }
        const outletName = `outlet:${name}`;
        if (listener.eventNames().includes(outletName)) {
          listener.emit(outletName as ObservableEvents<T>);
          notified = true;
        }
      }

      if (!notified) {
        console.trace(
          `Outlet "${name}" from "${
            component.spec.label ?? "unknown"
          }" Component was triggered and not handled!`
        );
      }
    },
  };
}

// Returns true if the action name defined in the provided component is a generator function.
function isGeneratorFn<T extends ComponentSpec>(
  component: Component<T>
): boolean {
  const action = component.action ?? undefined;
  return action?.constructor.name === "AsyncGeneratorFunction";
}

// Provides details necessary to facilitate execution.
type ExecOptions<T extends ComponentSpec> = {
  // The component to execute.
  component: Component<T>;

  // The inputs to provide to the component. If the component defines inputs,
  // they must be provided here.
  inputs?: ComponentInputs<T>;

  // An optional listener to emit/subsribe for events, during execution.
  listener?: EventEmitter<ObservableEvents<T>>;
};

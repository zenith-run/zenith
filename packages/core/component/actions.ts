/**
 * @file This file defines the types used to define actions within a components and their capabilities.
 */

import { ComponentInputs, ComponentOutputs, ComponentSpec } from ".";
import type { ComponentInlets, ComponentOutlets } from "./ports";

/**
 * CallContext is passed to the call function of an action, and provides
 * access to functionality that is scoped to the call itself.
 */
export type CallContext<T extends ComponentSpec> = {
  /**
   * notifyOutlet is used to notify observers outside of the component of an event from within the call.
   * @param name should be a string scoped to the component's defined outlets, derived from {@link ComponentOutlets<T>}.
   */
  notifyOutlet: (name: ComponentOutlets<T>) => void;

  /**
   * registerInlet is used to register a function that may be executed from an event
   * outside of the component, during the call.
   * @param name should be a string scoped to the component's defined inlets, derived from {@link ComponentInlets<T>}.
   * @param fn a function to be executed when the inlet is notified.
   */
  registerInlet: (name: ComponentInlets<T>, fn: () => void) => void;

  /**
   * inputs is an object literal based on the the schema defined within a component's parameters.
   */
  inputs: ComponentInputs<T>;
};

/**
 * ActionOutput is the return type of an action, and can be a Promise, an AsyncGenerator, or void.
 *
 * - If the return type is a Promise, the component will wait for the promise to resolve before continuing.
 * - If the return type is an AsyncGenerator, the component will iterate over the generator, waiting for each value to resolve before continuing.
 * - If the return type is void, the component will continue immediately.
 */
type ActionOutput<T extends ComponentSpec> =
  | ComponentOutputs<T>
  | Promise<ComponentOutputs<T>>
  | AsyncGenerator<ComponentOutputs<T>>
  | void;

/**
 * Action is a function type that provides the executable behavior of a component.
 * It's the primary way to implement the behavior of a component.
 */
export type Action<T extends ComponentSpec> = (
  context: CallContext<T>
) => ActionOutput<T>;

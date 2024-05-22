/**
 * @file This file collates all available functionality used to define components.
 */

import { Parameters } from "./parameters";
import { Ports } from "./ports";
import { Action } from "./actions";

/**
 * Definable is a type that can be used to provide human-readable context and documentation.
 * Most human-interfaced types within the component system extend this type.
 */
export type Definable = {
  /**
   * doc is a string that can be used to provide contextual human-readable documentation.
   */
  doc?: string;

  /**
   * label is a string that can be used to provide a human-readable alternative to
   * an otherwise derived type-based value.
   */
  label?: string;
};

/**
 * ComponentSpec defines the contract for a component.
 */
export type ComponentSpec = Definable & {
  /**
   * parameters provides a schema of all available inputs and outputs for a component.
   * See {@link Parameters} for more information.
   */
  parameters?: Parameters;

  /**
   * ports provides a schema of all available ports for a component.
   * See {@link Ports} for more information.
   */
  ports?: Ports;
};

/**
 * Component is a type that represents a component instance, merging a spec with an action
 * that implements the behavior of the component.
 */
export type Component<T extends ComponentSpec> = {
  spec: T;
  action: Action<T>;
};

type ComponentFactory<T extends ComponentSpec> = (
  action: Action<T>
) => Component<T>;

/**
 * NewComponent is a factory function that can be used to create instances
 * of a component, by binding a spec to an executable action/behavior.
 * @param spec a {@link ComponentSpec} to base the component off of.
 * @returns A {@link Component}
 */
export function NewComponent<T extends ComponentSpec>(
  spec: T
): ComponentFactory<T> {
  return (action: Action<T>) => ({
    spec,
    action,
  });
}

export * from "./actions";
export * from "./parameters";
export * from "./ports";
export * as t from "@sinclair/typebox";

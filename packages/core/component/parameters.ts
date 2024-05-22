/**
 * @file This file defines the types used to define parameters within a components.
 * Parameters allow components to declare static inputs and outputs, that can be consumed
 * at compile time for strict type safety, and at runtime for validation. Inputs and Outputs
 * are how components communicate what they need to operate, and what they provide to the
 * rest of the system.
 */

import type { Static, TSchema } from "@sinclair/typebox";
import type { ComponentSpec, Definable } from ".";

/**
 * ParameterSpec is a type that defines a parameter instance within a component.
 */
export type ParameterSpec = Definable & {
  /**
   * type is any valid Typebox schema that's used to validate the parameter.
   * See https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types for more information on it's capabilities.
   */
  type: TSchema;
};

export type ParameterSet = { [key: string]: ParameterSpec };

/**
 * Parameters is a type that defines all available inputs and outputs for a component.
 */
export type Parameters = {
  /**
   * inputs is an optional map of input names to their respective {@link ParameterSpec}.
   */
  inputs?: ParameterSet;

  /**
   * outputs is an optional map of output names to their respective {@link ParameterSpec}.
   */
  outputs?: ParameterSet;
};

/**
 * InputsFor is a utility type that derives the all input types for a {@link Parameters} definition.
 * This is typically used within the definition of a component to provide type safety for inputs.
 */
type InputsFor<T extends Parameters | undefined> = T extends Parameters
  ? {
      [K in keyof T["inputs"]]: T["inputs"][K] extends ParameterSpec
        ? Static<T["inputs"][K]["type"]>
        : never;
    }
  : never;

/**
 * ComponentInputs is a utility type that derives all available inputs for a {@link ComponentSpec}.
 * This is typically used by APIs that consume components to provide downstream type safety for inputs.
 */
export type ComponentInputs<T extends ComponentSpec> =
  | (T["parameters"] extends Parameters ? InputsFor<T["parameters"]> : never)
  | never;

/**
 * OutputsFor is a utility type that derives the all output types for a {@link Parameters} definition.
 * This is typically used within the definition of a component to provide type safety for outputs.
 */
type OutputsFor<T extends Parameters | undefined> = T extends Parameters
  ? {
      [K in keyof T["outputs"]]: T["outputs"][K] extends ParameterSpec
        ? Static<T["outputs"][K]["type"]>
        : never;
    }
  : never;
/**
 * ComponentOutputs is a utility type that derives all available outputs for a {@link ComponentSpec}.
 * This is typically used by APIs that consume components to provide downstream type safety for outputs.
 */
export type ComponentOutputs<T extends ComponentSpec> =
  | (T["parameters"] extends Parameters ? OutputsFor<T["parameters"]> : never)
  | undefined;

/**
 * @file This file defines the types used to define ports within a components.
 * Ports allow components to declare static inlets and outlets that can be used
 * to influence the behavior of a component, and to communicate realtime events
 * to the rest of the system. This allows a component to have more than a simple
 * input/output relationship with the rest of the system.
 */

import type { ComponentSpec, Definable } from ".";

/**
 * PortDefinition is a type that defines a port instance within a component.
 */
export type PortSpec = Definable & {};

/**
 * Ports is a type that defines all available inlets and outlets for a component.
 */
export type Ports = {
  /**
   * inlets is an optional map of inlet names to their respective {@link PortSpec}.
   */
  inlets?: { [key: string]: PortSpec };

  /**
   * outlets is an optional map of outlet names to their respective {@link PortSpec}.
   */
  outlets?: { [key: string]: PortSpec };

  /**
   * options is an optional set of global options for all ports within a component.
   */
  options?: PortOptions;
};

/**
 * PortOptions is a type that defines the global options available for ports.
 */
export type PortOptions = {
  /**
   * completionPort is an optional {@link PortSpec} that is used to notify
   * when a component has completed its execution. This is typically used to
   * signal to the rest of the system that a component has completed its work.
   */
  completionPort?: Definable & {
    /**
     * hide is an optional boolean that indicates whether or not the completion
     * port should be hidden from the rest of the system. This is typically used
     * if other named outlets are used to signal completion.
     */
    hide?: boolean;
  };

  /**
   * executionPort is an optional {@link PortSpec} that is used to notify
   * when a component should begin execution. This port is not visible to the
   * component itself.
   */
  executionPort?: Definable & {};
};

/**
 * InletsFor is a utility type that derives the all inlet names for a {@link Ports} definition.
 * This is typically used within the definition of a component to provide type safety for inlets.
 */
type InletsFor<T extends Ports | undefined> = T extends Ports
  ? {
      [K in keyof T["inlets"]]: T["inlets"][K] extends PortSpec ? K : never;
    }[keyof T["inlets"]]
  : never;

/**
 * ComponentInlets is a utility type that derives all available inlets for a {@link ComponentSpec}.
 * This is typically used by APIs that consume components to provide downstream type safety for inlets.
 */
export type ComponentInlets<T extends ComponentSpec> =
  | (T["ports"] extends Ports ? InletsFor<T["ports"]> : never)
  | undefined;

/**
 * OutletsFor is a utility type that derives the all outlet names for a {@link Ports} definition.
 * This is typically used within the definition of a component to provide type safety for outlets.
 */
type OutletsFor<T extends Ports | undefined> = T extends Ports
  ? {
      [K in keyof T["outlets"]]: T["outlets"][K] extends PortSpec ? K : never;
    }[keyof T["outlets"]]
  : never;

/**
 * ComponentOutlets is a utility type that derives all available outlets for a {@link ComponentSpec}.
 * This is typically used by APIs that consume components to provide downstream type safety for outlets.
 */
export type ComponentOutlets<T extends ComponentSpec> =
  | (T["ports"] extends Ports ? OutletsFor<T["ports"]> : never)
  | undefined;

/**
 * ComponentPortEvents is a utility type that derives all available events for a {@link ComponentSpec},
 * based upon all available inlets and outlets defined within. This is designed to scope what events
 * an {@code EventEmitter} may produce or consume.
 */
export type ComponentPortEvents<T extends ComponentSpec> =
  | ComponentOutletEvents<T>
  | ComponentInletEvents<T>;

/**
 * ComponentOutletEvents is a utility type that derives all available outlet events for a {@link ComponentSpec}.
 * All outlet events are prefixed with {@code outlet:} to reduce potential of collision with other events.
 */
export type ComponentOutletEvents<T extends ComponentSpec> = keyof {
  [K in Exclude<ComponentOutlets<T>, undefined> as `outlet:${Extract<
    K,
    string
  >}`]: K;
};

/**
 * ComponentInletEvents is a utility type that derives all available inlet events for a {@link ComponentSpec}.
 * All inlet events are prefixed with {@code inlet:} to reduce potential of collision with other events.
 */
export type ComponentInletEvents<T extends ComponentSpec> = keyof {
  [K in Exclude<ComponentInlets<T>, undefined> as `inlet:${Extract<
    K,
    string
  >}`]: K;
};
